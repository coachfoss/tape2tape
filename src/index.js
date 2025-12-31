const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {logger} = require("firebase-functions");
const {Resend} = require("resend");
const admin = require("firebase-admin");

admin.initializeApp();

const resend = new Resend(process.env.RESEND_API_KEY);

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
              <a href="https://tape2tape-2cd5f.web.app/coach-editor" 
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