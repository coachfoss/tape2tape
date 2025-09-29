// src/App.js - Final working version with proper navigation
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Auth from "./Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EnhancedVideoUpload from "./EnhancedVideoUpload";
import ReviewViewer from "./ReviewViewer";
import CoachEditor from "./pages/CoachEditor";
import AdminDashboard from "./pages/AdminDashboard";
import SubscriptionManager, { SubscriptionGate } from "./SubscriptionManager";
import NotificationSystem from "./NotificationSystem";
import OnboardingFlow, { useOnboarding } from "./OnboardingFlow";
import UserDataManager from "./UserDataManager";
import { TermsOfService, PrivacyPolicy, LegalFooter } from "./Legal";
import ErrorBoundary from "./ErrorBoundary";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function AppContent() {
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [loadingUserData, setLoadingUserData] = useState(true);
  const { needsOnboarding, loading: onboardingLoading } = useOnboarding();

  // Load user data when authenticated
  useEffect(() => {
    if (!user) {
      setUserRole(null);
      setSubscriptionStatus("inactive");
      setLoadingUserData(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role || "client");
          setSubscriptionStatus(userData.subscriptionStatus || "inactive");
        } else {
          setUserRole("client");
          setSubscriptionStatus("inactive");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Navigation component
  const Navigation = () => {
    return (
      <nav
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 0',
          marginBottom: '2rem'
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <Link
                to="/dashboard"
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  color: 'var(--primary-color)'
                }}
              >
                Tape2Tape
              </Link>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/dashboard" className="btn btn-secondary btn-sm">
                  Dashboard
                </Link>
                <Link to="/upload" className="btn btn-secondary btn-sm">
                  Upload
                </Link>
                {userRole === "coach" && (
                  <Link to="/subscription" className="btn btn-secondary btn-sm">
                    Subscription
                  </Link>
                )}
                {userRole === "admin" && (
                  <Link to="/admin" className="btn btn-secondary btn-sm">
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {userRole === "coach" && (
                <span className={`badge ${
                  subscriptionStatus === "active" ? "badge-success" :
                  subscriptionStatus === "trial" ? "badge-warning" : "badge-error"
                }`}>
                  {subscriptionStatus}
                </span>
              )}

              <NotificationSystem />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/profile" className="btn btn-secondary btn-sm">
                  Profile
                </Link>
                <button
                  onClick={() => auth.signOut()}
                  className="btn btn-secondary btn-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  if (loading || loadingUserData || onboardingLoading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading your account...</div>;
  }

  // Show onboarding if needed
  if (user && needsOnboarding) {
    return <OnboardingFlow />;
  }

  return (
    <div>
      {user && <Navigation />}
      
      <Routes>
        {!user ? (
          <React.Fragment>
            <Route path="/login" element={<Auth />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/upload" element={<EnhancedVideoUpload />} />
            <Route path="/review" element={<ReviewViewer />} />
            <Route path="/data-management" element={<UserDataManager />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            {/* Coach routes with subscription gate */}
            <Route 
              path="/editor" 
              element={
                <SubscriptionGate userRole={userRole} subscriptionStatus={subscriptionStatus}>
                  <CoachEditor />
                </SubscriptionGate>
              } 
            />
            
            {userRole === "coach" && (
              <Route path="/subscription" element={<SubscriptionManager />} />
            )}
            
            {userRole === "admin" && (
              <Route path="/admin" element={<AdminDashboard />} />
            )}

            <Route 
              path="*" 
              element={
                <div className="container">
                  <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2>Page Not Found</h2>
                    <p>The page you're looking for doesn't exist.</p>
                    <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                  </div>
                </div>
              } 
            />
          </React.Fragment>
        )}
      </Routes>

      <LegalFooter />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}