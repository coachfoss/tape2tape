import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Toaster } from 'react-hot-toast';

import Landing from './pages/Landing';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Profile from './pages/Profile';
import SubscriptionManager from './SubscriptionManager';
import CoachEditor from './CoachEditor';
import VideoUpload from './VideoUpload';
import ReviewViewer from './ReviewViewer';
import WelcomeTour from './components/WelcomeTour';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function Navigation({ user, userData, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isCoach = userData?.role === 'coach';
  const isOnDashboard = location.pathname === '/dashboard';

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['coach', 'athlete'], hideOnDashboard: true },
    { path: '/upload', label: 'Upload Video', icon: '📹', roles: ['coach', 'athlete'] },
    { path: '/subscription', label: 'Subscription', icon: '💳', roles: ['coach'] }
  ];

  const visibleItems = navItems.filter(item => {
    const roleMatch = item.roles.includes(userData?.role);
    const dashboardCheck = !(item.hideOnDashboard && isOnDashboard);
    return roleMatch && dashboardCheck;
  });

  return (
    <>
      <nav style={{
        borderBottom: '1px solid #e9ecef',
        backgroundColor: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px'
        }}>
          <div
            onClick={() => navigate('/dashboard')}
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#ff0000',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Tape2Tape
          </div>

          {/* Desktop Navigation */}
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }} className="desktop-nav">
            {visibleItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: location.pathname === item.path ? '#ff0000' : '#666',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div style={{ position: 'relative', paddingLeft: '30px', borderLeft: '1px solid #e9ecef' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  backgroundColor: showDropdown ? '#f8f9fa' : 'transparent'
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {userData?.displayName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {isCoach ? '🏆 Coach' : '⚡ Athlete'}
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#666' }}>▼</span>
              </button>

              {showDropdown && (
                <>
                  <div
                    onClick={() => setShowDropdown(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 99998
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    minWidth: '200px',
                    zIndex: 99999
                  }}>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/profile');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background 0.2s',
                        borderRadius: '8px 8px 0 0'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      👤 Profile & Settings
                    </button>
                    <div style={{ height: '1px', backgroundColor: '#e9ecef', margin: '0 8px' }} />
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onLogout();
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#dc3545',
                        transition: 'background 0.2s',
                        borderRadius: '0 0 8px 8px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fff5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            {showMobileMenu ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div
            className="mobile-menu"
            style={{
              display: 'none',
              flexDirection: 'column',
              backgroundColor: 'white',
              borderTop: '1px solid #e9ecef',
              padding: '20px'
            }}
          >
            {visibleItems.map(item => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setShowMobileMenu(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: location.pathname === item.path ? '#ff0000' : '#666',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '6px',
                  textAlign: 'left',
                  width: '100%',
                  marginBottom: '8px',
                  backgroundColor: location.pathname === item.path ? '#fff5f5' : 'transparent'
                }}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div style={{ height: '1px', backgroundColor: '#e9ecef', margin: '12px 0' }} />
            <button
              onClick={() => {
                navigate('/profile');
                setShowMobileMenu(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '6px',
                textAlign: 'left',
                width: '100%',
                marginBottom: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>👤</span>
              Profile & Settings
            </button>
            <button
              onClick={() => {
                onLogout();
                setShowMobileMenu(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc3545',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '6px',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <span style={{ fontSize: '20px' }}>🚪</span>
              Logout
            </button>
          </div>
        )}
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          .mobile-menu {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}

function ProtectedRoute({ children, user, userData, requiredRole }) {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userData?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppContent() {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setUserData(null);
      }
      setUserLoading(false);
    };

    if (!loading) {
      loadUserData();
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  if (loading || userLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ color: '#666', marginTop: '20px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user && <Navigation user={user} userData={userData} onLogout={handleLogout} />}
      {user && !userData?.onboardingComplete && <WelcomeTour userData={userData} />}
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} userData={userData}>
              <Dashboard user={user} userData={userData} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} userData={userData}>
              <Profile user={user} userData={userData} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute user={user} userData={userData}>
              <VideoUpload user={user} userData={userData} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute user={user} userData={userData} requiredRole="coach">
              <SubscriptionManager user={user} userData={userData} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:videoId"
          element={
            <ProtectedRoute user={user} userData={userData}>
              <CoachEditor user={user} userData={userData} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review/:videoId"
          element={
            <ProtectedRoute user={user} userData={userData}>
              <ReviewViewer user={user} userData={userData} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 5000,
          style: {
            borderRadius: '8px',
            padding: '16px 20px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: '#28a745',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#dc3545',
              secondary: '#fff'
            }
          }
        }} 
      />
      <AppContent />
    </>
  );
}