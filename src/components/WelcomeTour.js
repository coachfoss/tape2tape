import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function WelcomeTour({ userData }) {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(true);
  const isCoach = userData?.role === 'coach';

  const coachSteps = [
    {
      title: "Welcome to Tape2Tape!",
      content: "Let's take a quick tour to help you get started with video coaching.",
      emoji: "👋"
    },
    {
      title: "3 Free Video Reviews",
      content: "Start with 3 free video reviews to try out all features. No credit card required, no time limit!",
      emoji: "🎁"
    },
    {
      title: "Upload Videos",
      content: "Click 'Upload Video' to record or upload footage. You can assign videos to specific athletes for personalized feedback.",
      emoji: "📹"
    },
    {
      title: "Video Review Tools",
      content: "Use our frame-by-frame editor to draw, annotate, and add voice feedback directly on the video.",
      emoji: "✏️"
    },
    {
      title: "Your Coach Code",
      content: "Your unique coach code lets athletes connect with you. Find it in your profile and share it with your athletes!",
      emoji: "🔑"
    }
  ];

  const athleteSteps = [
    {
      title: "Welcome to Tape2Tape!",
      content: "Your platform for receiving expert video analysis from your coach.",
      emoji: "👋"
    },
    {
      title: "Upload Your Videos",
      content: "Upload game footage or training videos for your coach to review and provide feedback.",
      emoji: "📹"
    },
    {
      title: "Get Expert Feedback",
      content: "Your coach will analyze your technique frame-by-frame with drawings, annotations, and voice feedback.",
      emoji: "⚡"
    },
    {
      title: "Connect with Coach",
      content: "Ask your coach for their unique code, then enter it in your profile to connect and start receiving reviews.",
      emoji: "🔗"
    },
    {
      title: "Track Your Progress",
      content: "All your reviewed videos are saved forever. Download them anytime to track your improvement over time.",
      emoji: "📊"
    }
  ];

  const steps = isCoach ? coachSteps : athleteSteps;

  const handleComplete = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          onboardingComplete: true
        });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
    setShow(false);
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (!show) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9998
      }} />

      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        zIndex: 9999,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e9ecef',
          borderRadius: '2px',
          marginBottom: '30px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((step + 1) / steps.length) * 100}%`,
            height: '100%',
            backgroundColor: '#ff0000',
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>
            {steps[step].emoji}
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#212529'
          }}>
            {steps[step].title}
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6c757d',
            lineHeight: '1.6'
          }}>
            {steps[step].content}
          </p>
        </div>

        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#adb5bd',
          marginBottom: '20px'
        }}>
          {step + 1} of {steps.length}
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handleSkip}
            style={{
              padding: '12px 20px',
              backgroundColor: 'transparent',
              color: '#6c757d',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Skip Tour
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {step > 0 && (
              <button
                onClick={handlePrevious}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#f8f9fa',
                  color: '#212529',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Previous
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ff0000',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {step < steps.length - 1 ? 'Next' : 'Get Started!'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}