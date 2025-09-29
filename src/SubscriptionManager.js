// src/SubscriptionManager.js
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function SubscriptionManager() {
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role);
          setSubscriptionStatus(userData.subscriptionStatus || "inactive");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Temporary demo function - in real app this would go to Stripe
  const handleSubscribe = async (planType) => {
    if (!user) return;

    try {
      // For demo purposes, just activate the subscription
      await updateDoc(doc(db, "users", user.uid), {
        subscriptionStatus: "active",
        subscriptionPlan: planType,
        subscriptionStarted: serverTimestamp(),
      });

      setSubscriptionStatus("active");
      alert("Demo: Subscription activated! (In production, this would use Stripe)");
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        subscriptionStatus: "cancelled",
        cancelledAt: serverTimestamp(),
      });

      setSubscriptionStatus("cancelled");
      alert("Subscription cancelled successfully.");
    } catch (error) {
      console.error("Cancellation error:", error);
      alert("Failed to cancel subscription. Please try again.");
    }
  };

  if (loading) return <div>Loading subscription info...</div>;
  if (userRole !== "coach") return null; // Only show for coaches

  const plans = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: "$29",
      interval: "/month",
      features: [
        "Unlimited video reviews",
        "Advanced annotation tools",
        "HD video recording",
        "Client notifications",
        "Priority support"
      ]
    },
    {
      id: "annual",
      name: "Annual Plan",
      price: "$290",
      interval: "/year",
      savings: "Save $58/year",
      features: [
        "Everything in Monthly",
        "2 months free",
        "Advanced analytics",
        "Custom branding",
        "Phone support"
      ]
    }
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>Coach Subscription</h2>
      
      {/* Current Status */}
      <div 
        style={{
          padding: "16px",
          backgroundColor: subscriptionStatus === "active" ? "#d4edda" : "#f8d7da",
          border: `1px solid ${subscriptionStatus === "active" ? "#c3e6cb" : "#f5c6cb"}`,
          borderRadius: "8px",
          marginBottom: "24px"
        }}
      >
        <strong>Current Status: </strong>
        <span style={{ textTransform: "capitalize" }}>
          {subscriptionStatus}
        </span>
        {subscriptionStatus === "active" && (
          <button
            onClick={handleCancelSubscription}
            style={{
              marginLeft: "16px",
              padding: "4px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {subscriptionStatus !== "active" && (
        <>
          <div style={{
            padding: "16px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            marginBottom: "24px"
          }}>
            <strong>Demo Mode:</strong> This is a demo version. In production, this would integrate with Stripe for real payments.
          </div>

          <p style={{ marginBottom: "32px", color: "#666" }}>
            Choose a plan to start using the video review tools:
          </p>

          <div 
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
              marginBottom: "32px"
            }}
          >
            {plans.map(plan => (
              <div
                key={plan.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "24px",
                  backgroundColor: "white",
                  position: "relative",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                {plan.savings && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "16px",
                      backgroundColor: "#28a745",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}
                  >
                    {plan.savings}
                  </div>
                )}
                
                <h3 style={{ marginTop: "0", marginBottom: "8px" }}>
                  {plan.name}
                </h3>
                
                <div style={{ marginBottom: "16px" }}>
                  <span style={{ fontSize: "32px", fontWeight: "bold" }}>
                    {plan.price}
                  </span>
                  <span style={{ color: "#666" }}>{plan.interval}</span>
                </div>

                <ul style={{ marginBottom: "24px", paddingLeft: "20px" }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{ marginBottom: "8px" }}>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: plan.id === "annual" ? "#007bff" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Choose {plan.name} (Demo)
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {subscriptionStatus === "active" && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            padding: "20px"
          }}
        >
          <h3>You're all set!</h3>
          <p>
            Your subscription is active. You can now use all the video review tools.
            Visit your dashboard to start creating reviews.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper component to check subscription status and block access
export function SubscriptionGate({ children, userRole, subscriptionStatus }) {
  if (userRole !== "coach") {
    return children; // Non-coaches can access freely
  }

  if (subscriptionStatus !== "active") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          margin: "20px"
        }}
      >
        <h3>Subscription Required</h3>
        <p>You need an active subscription to access the video review tools.</p>
        <a 
          href="/subscription" 
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold"
          }}
        >
          View Subscription Plans
        </a>
      </div>
    );
  }

  return children;
}