// src/OnboardingFlow.js
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function OnboardingFlow() {
  const [user] = useAuthState(auth);
  const [currentStep, setCurrentStep] = useState(0);
  const [userRole, setUserRole] = useState("client");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    const checkOnboarding = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().onboardingComplete) {
        setIsComplete(true);
      } else {
        // Pre-fill with existing data if available
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserRole(data.role || "client");
          setDisplayName(data.displayName || user.displayName || "");
          setBio(data.bio || "");
        } else {
          setDisplayName(user.displayName || "");
        }
      }
    };
    
    checkOnboarding();
  }, [user]);

  const completeOnboarding = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        role: userRole,
        displayName: displayName.trim(),
        bio: bio.trim(),
        onboardingComplete: true,
        onboardingCompletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setIsComplete(true);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      alert("Failed to complete setup. Please try again.");
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!user || isComplete) return null;

  const steps = [
    {
      title: "Welcome to Tape2Tape",
      content: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎥</div>
          <h2>Video Analysis Made Simple</h2>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Upload your videos and get professional feedback with annotations, 
            voice commentary, and detailed analysis from expert coaches.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📤</div>
              <h4>Upload Videos</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Share your performance videos securely
              </p>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✏️</div>
              <h4>Get Analysis</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Receive detailed feedback with annotations
              </p>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</div>
              <h4>Improve</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Apply insights to enhance your performance
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Role",
      content: (
        <div style={{ textAlign: "center" }}>
          <h2>What best describes you?</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            This helps us customize your experience
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", maxWidth: "600px", margin: "0 auto" }}>
            <div 
              onClick={() => setUserRole("client")}
              className="card"
              style={{ 
                padding: "2rem", 
                cursor: "pointer", 
                border: userRole === "client" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)",
                backgroundColor: userRole === "client" ? "var(--background)" : "transparent"
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
              <h3>Athlete/Client</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                I want to upload videos and receive coaching feedback
              </p>
            </div>
            <div 
              onClick={() => setUserRole("coach")}
              className="card"
              style={{ 
                padding: "2rem", 
                cursor: "pointer", 
                border: userRole === "coach" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)",
                backgroundColor: userRole === "coach" ? "var(--background)" : "transparent"
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👨‍🏫</div>
              <h3>Coach</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                I want to provide video analysis and coaching services
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Complete Your Profile",
      content: (
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <h2>Tell us about yourself</h2>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="form-input"
              placeholder="How should others see your name?"
              maxLength={50}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              {userRole === "coach" ? "Professional Bio" : "About You"} (Optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="form-textarea"
              placeholder={
                userRole === "coach" 
                  ? "Describe your coaching experience, specialties, and qualifications..."
                  : "Tell us about your sport, goals, or what you're looking to improve..."
              }
              maxLength={500}
            />
            <small style={{ color: "var(--text-secondary)" }}>
              {bio.length}/500 characters
            </small>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set!",
      content: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
          <h2>Welcome to Tape2Tape!</h2>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Your account is ready. Here's what you can do next:
          </p>
          
          {userRole === "client" ? (
            <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
              <h3>Next Steps for Athletes</h3>
              <ul style={{ textAlign: "left", maxWidth: "400px", margin: "0 auto" }}>
                <li>Upload your first video (max 60 seconds)</li>
                <li>Choose a coach to review it</li>
                <li>Receive detailed feedback with annotations</li>
                <li>Apply the insights to improve your performance</li>
              </ul>
            </div>
          ) : (
            <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
              <h3>Next Steps for Coaches</h3>
              <ul style={{ textAlign: "left", maxWidth: "400px", margin: "0 auto" }}>
                <li>Set up your subscription to start reviewing videos</li>
                <li>Wait for client video submissions</li>
                <li>Use our annotation tools to provide feedback</li>
                <li>Build your coaching reputation</li>
              </ul>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <div className="card" style={{ padding: "3rem" }}>
        {/* Progress indicator */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
            </span>
          </div>
          <div className="progress-bar" style={{ height: "4px" }}>
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div style={{ minHeight: "400px" }}>
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <button 
            onClick={nextStep}
            disabled={currentStep === 2 && !displayName.trim()}
            className="btn btn-primary"
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to check if user needs onboarding
export function useOnboarding() {
  const [user] = useAuthState(auth);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkOnboarding = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || !userDoc.data().onboardingComplete) {
          setNeedsOnboarding(true);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [user]);

  return { needsOnboarding, loading };
}