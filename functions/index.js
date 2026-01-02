require('dotenv').config();
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {logger} = require("firebase-functions");
const {Resend} = require("resend");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('Resend key not available during code analysis');
    return null;
  }
  return new Resend(apiKey);
};

const getStripe = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.warn('Stripe key not available during code analysis');
    return null;
  }
  return require("stripe")(apiKey);
};

const PRICE_IDS = {
  monthly: "price_1Sbr3FIrCEtTstBuwZUJq77t",
  annual: "price_1Sbr2CIrCEtTstBuLIuonp35",
};

const setCorsHeaders = (res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');
};

// ============= STRIPE FUNCTIONS =============

exports.createCheckoutSession = onRequest(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({error: "Stripe not configured"});
  }

  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    const {userId, priceType, successUrl, cancelUrl} = req.body;

    if (!userId || !priceType || !successUrl || !cancelUrl) {
      return res.status(400).json({error: "Missing parameters"});
    }

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found"});
    }

    const userData = userDoc.data();
    let customerId = userData.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {firebaseUID: userId},
      });
      customerId = customer.id;
      await db.collection("users").doc(userId).update({stripeCustomerId: customerId});
    }

    const priceId = priceType === "annual" ? PRICE_IDS.annual : PRICE_IDS.monthly;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{price: priceId, quantity: 1}],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {firebaseUID: userId, priceType: priceType},
    });

    return res.status(200).json({url: session.url});
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({error: error.message});
  }
});

exports.createPortalSession = onRequest(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({error: "Stripe not configured"});
  }

  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    const {userId, returnUrl} = req.body;

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found"});
    }

    const customerId = userDoc.data().stripeCustomerId;
    if (!customerId) {
      return res.status(400).json({error: "No customer found"});
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return res.status(200).json({url: session.url});
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({error: error.message});
  }
});

exports.stripeWebhook = onRequest(async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({error: "Stripe not configured"});
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata.firebaseUID;
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        await db.collection("users").doc(userId).update({
          subscriptionStatus: "active",
          subscriptionId: session.subscription,
          subscriptionPlan: session.metadata.priceType,
          subscriptionStarted: admin.firestore.FieldValue.serverTimestamp(),
          currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const usersSnapshot = await db.collection("users")
            .where("stripeCustomerId", "==", invoice.customer)
            .limit(1).get();

        if (!usersSnapshot.empty) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          await usersSnapshot.docs[0].ref.update({
            subscriptionStatus: "active",
            currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const usersSnapshot = await db.collection("users")
            .where("stripeCustomerId", "==", invoice.customer)
            .limit(1).get();

        if (!usersSnapshot.empty) {
          await usersSnapshot.docs[0].ref.update({
            subscriptionStatus: "past_due",
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const usersSnapshot = await db.collection("users")
            .where("stripeCustomerId", "==", subscription.customer)
            .limit(1).get();

        if (!usersSnapshot.empty) {
          await usersSnapshot.docs[0].ref.update({
            subscriptionStatus: "canceled",
            canceledAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const usersSnapshot = await db.collection("users")
            .where("stripeCustomerId", "==", subscription.customer)
            .limit(1).get();

        if (!usersSnapshot.empty) {
          await usersSnapshot.docs[0].ref.update({
            subscriptionStatus: subscription.status,
            currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
          });
        }
        break;
      }
    }

    res.status(200).json({received: true});
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({error: "Webhook failed"});
  }
});

// ============= EMAIL NOTIFICATION FUNCTIONS =============

// Generate unique coach code
function generateCoachCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Welcome email when new user signs up
exports.onUserCreated = onDocumentCreated(
    "users/{userId}",
    async (event) => {
      const userData = event.data.data();
      const userId = event.params.userId;

      logger.info("New user created:", {userId, userData});

      try {
        // Auto-assign coach code if user is a coach
        if (userData.role === 'coach' && !userData.coachCode) {
          let code = generateCoachCode();
          let isUnique = false;

          while (!isUnique) {
            const existing = await admin.firestore()
                .collection("users")
                .where("coachCode", "==", code)
                .limit(1)
                .get();

            if (existing.empty) {
              isUnique = true;
            } else {
              code = generateCoachCode();
            }
          }

          await admin.firestore()
              .collection("users")
              .doc(userId)
              .update({
                coachCode: code,
              });

          logger.info(`Assigned coach code ${code} to user ${userId}`);
        }

        // Send welcome email
        const resend = getResend();
        if (!resend) {
          logger.error("Resend not configured");
          return;
        }

        const userName = userData.displayName || userData.email.split('@')[0];
        const userRole = userData.role === 'coach' ? 'Coach' : 'Athlete';

        await resend.emails.send({
          from: "Coach Foss @ Tape2Tape <onboarding@resend.dev>",
          to: userData.email,
          subject: "Welcome to Tape2Tape! 🏒",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hey ${userName},</h2>
              
              <p>My name is Foss — I'm the founder of Tape2Tape.</p>
              
              <p>We started Tape2Tape because we wanted a better way for coaches and athletes to collaborate. 
              A simple, fast, and powerful platform for video coaching that just works.</p>
              
              <p><strong>Here are 3 tips to get started:</strong></p>
              
              <ol>
                <li><strong><a href="https://tape2tape-2cd5f.web.app/upload" style="color: #ff0000;">Upload your first video</a></strong></li>
                <li><strong><a href="https://tape2tape-2cd5f.web.app/profile" style="color: #ff0000;">Complete your profile</a></strong></li>
                ${userData.role === 'coach' ?
                  '<li><strong><a href="https://tape2tape-2cd5f.web.app/subscription" style="color: #ff0000;">Activate your coaching subscription</a></strong></li>' :
                  '<li><strong><a href="https://tape2tape-2cd5f.web.app/dashboard" style="color: #ff0000;">Connect with a coach</a></strong></li>'
                }
              </ol>
              
              <p><strong>P.S.:</strong> Why did you sign up? What brought you here?</p>
              
              <p>Hit "Reply" and let me know. I read and reply to every email.</p>
              
              <p>Cheers,<br>
              <strong>Coach Foss</strong><br>
              Founder, Tape2Tape</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #666;">
                You're receiving this because you signed up as a ${userRole} on Tape2Tape.
              </p>
            </div>
          `,
        });

        logger.info("Welcome email sent to:", userData.email);
      } catch (error) {
        logger.error("Error in onUserCreated:", error);
      }
    });

// Email when video uploaded
exports.onVideoUploaded = onDocumentCreated(
    "videos/{videoId}",
    async (event) => {
      const video = event.data.data();
      const videoId = event.params.videoId;

      logger.info("New video uploaded:", {videoId, video});

      try {
        const coachDoc = await admin.firestore()
            .collection("users")
            .doc(video.coachId)
            .get();

        if (!coachDoc.exists) {
          logger.error("Coach not found:", video.coachId);
          return;
        }

        const coach = coachDoc.data();
        const coachEmail = coach.email;

        const clientDoc = await admin.firestore()
            .collection("users")
            .doc(video.clientId)
            .get();

        const clientName = clientDoc.exists ?
          (clientDoc.data().displayName || clientDoc.data().email) :
          "An athlete";

        const resend = getResend();
        if (!resend) {
          logger.error("Resend not configured");
          return;
        }

        await resend.emails.send({
          from: "Tape2Tape <onboarding@resend.dev>",
          to: coachEmail,
          subject: "New Video Ready for Review - Tape2Tape",
          html: `
            <h2>New Video Uploaded</h2>
            <p><strong>${clientName}</strong> has uploaded a new video for your review.</p>
            <p><strong>Title:</strong> ${video.name}</p>
            ${video.description ? `<p><strong>Notes:</strong> ${video.description}</p>` : ""}
            <p>
              <a href="https://tape2tape-2cd5f.web.app/dashboard" 
                 style="display: inline-block; padding: 12px 24px; background-color: #007bff; 
                        color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Review Video Now
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              Log in to your Tape2Tape dashboard to start reviewing.
            </p>
          `,
        });

        logger.info("Email sent to coach:", coachEmail);
      } catch (error) {
        logger.error("Error sending email to coach:", error);
      }
    });

// Email when review completed
exports.onReviewCompleted = onDocumentUpdated(
    "videos/{videoId}",
    async (event) => {
      const beforeData = event.data.before.data();
      const afterData = event.data.after.data();
      const videoId = event.params.videoId;

      if (!beforeData.reviewed && afterData.reviewed) {
        logger.info("Review completed for video:", videoId);

        try {
          const athleteDoc = await admin.firestore()
              .collection("users")
              .doc(afterData.clientId)
              .get();

          if (!athleteDoc.exists) {
            logger.error("Athlete not found:", afterData.clientId);
            return;
          }

          const athlete = athleteDoc.data();
          const athleteEmail = athlete.email;

          const coachDoc = await admin.firestore()
              .collection("users")
              .doc(afterData.coachId)
              .get();

          const coachName = coachDoc.exists ?
            (coachDoc.data().displayName || "Your coach") :
            "Your coach";

          const resend = getResend();
          if (!resend) {
            logger.error("Resend not configured");
            return;
          }

          await resend.emails.send({
            from: "Tape2Tape <onboarding@resend.dev>",
            to: athleteEmail,
            subject: "Your Video Review is Ready! - Tape2Tape",
            html: `
              <h2>Review Complete! 🎉</h2>
              <p><strong>${coachName}</strong> has finished reviewing your video.</p>
              <p><strong>Video:</strong> ${afterData.name}</p>
              <p>
                <a href="https://tape2tape-2cd5f.web.app/dashboard" 
                   style="display: inline-block; padding: 12px 24px; background-color: #28a745; 
                          color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  View Review Now
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                Log in to your Tape2Tape dashboard to watch your reviewed video.
              </p>
            `,
          });

          logger.info("Email sent to athlete:", athleteEmail);
        } catch (error) {
          logger.error("Error sending email to athlete:", error);
        }
      }
    });