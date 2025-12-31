import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

function generateCoachCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState(emailFromState);
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('coach');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
          email: user.email,
          displayName: displayName || email.split('@')[0],
          role: role,
          createdAt: serverTimestamp(),
          onboardingComplete: false,
          bio: '',
          subscriptionStatus: role === 'coach' ? 'inactive' : 'active',
          freeReviewsRemaining: role === 'coach' ? 3 : null,
          videosUploaded: 0,
          coachCode: role === 'coach' ? generateCoachCode() : null,
          connectedCoaches: role === 'athlete' ? [] : null,
          instagram: '',
          twitter: '',
          tiktok: ''
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        toast.success('Welcome! Account created as ' + role + '.');
        navigate('/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use. Try signing in instead.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password.');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('No account found. Sign up first.');
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        const userData = {
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          role: role,
          createdAt: serverTimestamp(),
          onboardingComplete: false,
          bio: '',
          subscriptionStatus: role === 'coach' ? 'inactive' : 'active',
          freeReviewsRemaining: role === 'coach' ? 3 : null,
          videosUploaded: 0,
          coachCode: role === 'coach' ? generateCoachCode() : null,
          connectedCoaches: role === 'athlete' ? [] : null,
          instagram: '',
          twitter: '',
          tiktok: ''
        };

        await setDoc(doc(db, 'users', user.uid), userData);
        toast.success('Welcome! Account created as ' + role + '.');
      } else {
        toast.success('Welcome back!');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '40px',
        backgroundColor: '#111',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          <span style={{ color: '#ff0000' }}>Tape2Tape</span>
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#999',
          marginBottom: '30px'
        }}>
          {isSignUp ? 'Create your account' : 'Welcome back!'}
        </p>

        {isSignUp && (
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              I am a...
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={() => setRole('coach')}
                style={{
                  padding: '15px',
                  backgroundColor: role === 'coach' ? '#ff0000' : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: role === 'coach' ? '2px solid #ff0000' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: role === 'coach' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                Coach
              </button>
              <button
                type="button"
                onClick={() => setRole('athlete')}
                style={{
                  padding: '15px',
                  backgroundColor: role === 'athlete' ? '#ff0000' : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: role === 'athlete' ? '2px solid #ff0000' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: role === 'athlete' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                Athlete
              </button>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              {role === 'coach' 
                ? '3 free video reviews to start'
                : 'Connect with your coach for feedback'}
            </p>
          </div>
        )}

        <form onSubmit={handleEmailAuth}>
          {isSignUp && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required={isSignUp}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coach@example.com"
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#ff0000',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '25px 0',
          gap: '10px'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: '#666', fontSize: '14px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: 'white',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            opacity: loading ? 0.7 : 1
          }}
        >
          <span style={{ fontSize: '20px' }}>G</span>
          Continue with Google
        </button>

        <p style={{
          textAlign: 'center',
          marginTop: '25px',
          fontSize: '14px',
          color: '#999'
        }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff0000',
              cursor: 'pointer',
              fontWeight: 'bold',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        <div style={{
          marginTop: '25px',
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}