import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import AthleteDashboard from './pages/AthleteDashboard';

export default function Dashboard({ user, userData }) {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState([]);

  useEffect(() => {
    if (user && userData?.role === 'coach') {
      loadCoachData();
    } else {
      setLoading(false);
    }
  }, [user, userData]);

  const loadCoachData = async () => {
    try {
      const videosQuery = query(
        collection(db, 'videos'),
        where('coachId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const videosSnapshot = await getDocs(videosQuery);
      const videosData = videosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVideos(videosData);

      const athletesQuery = query(
        collection(db, 'users'),
        where('connectedCoaches', 'array-contains', user.uid)
      );
      const athletesSnapshot = await getDocs(athletesQuery);
      const athletesData = athletesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAthletes(athletesData);
    } catch (error) {
      console.error('Error loading coach data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (userData?.role === 'athlete') {
    return <AthleteDashboard user={user} userData={userData} />;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p style={{ color: '#666' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const isSubscribed = userData?.subscriptionStatus === 'active';
  const hasFreeReviews = (userData?.freeReviewsRemaining || 0) > 0;
  const freeReviewsRemaining = userData?.freeReviewsRemaining || 0;
  const canUpload = isSubscribed || hasFreeReviews;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Free Reviews Banner */}
      {hasFreeReviews && !isSubscribed && (
        <div style={{
          padding: '20px',
          backgroundColor: '#d1ecf1',
          border: '2px solid #0c5460',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '32px' }}>🎁</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '5px', color: '#0c5460' }}>
                Free Reviews Available!
              </h3>
              <p style={{ color: '#0c5460', marginBottom: '10px' }}>
                You have <strong>{freeReviewsRemaining} free video reviews</strong> remaining. Try out all features before subscribing!
              </p>
              <button
                onClick={() => navigate('/subscription')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0c5460',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                View Subscription Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Free Reviews Left */}
      {!isSubscribed && !hasFreeReviews && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8d7da',
          border: '2px solid #721c24',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '32px' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '5px', color: '#721c24' }}>
                Free Reviews Used
              </h3>
              <p style={{ color: '#721c24', marginBottom: '10px' }}>
                Subscribe now to continue creating unlimited video reviews for your athletes.
              </p>
              <button
                onClick={() => navigate('/subscription')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff0000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          Welcome back, Coach {userData?.displayName}! 👋
        </h1>
        <p style={{ color: '#666' }}>
          {isSubscribed && 'Your subscription is active. Start reviewing videos!'}
          {hasFreeReviews && !isSubscribed && `You have ${freeReviewsRemaining} free reviews remaining!`}
          {!isSubscribed && !hasFreeReviews && 'Subscribe to start coaching your athletes.'}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff0000' }}>{videos.length}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Total Videos</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff0000' }}>{athletes.length}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Connected Athletes</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff0000' }}>{userData?.coachCode || '-'}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Your Coach Code</div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: isSubscribed ? '#d4edda' : hasFreeReviews ? '#d1ecf1' : '#f8d7da',
          borderRadius: '8px',
          border: `1px solid ${isSubscribed ? '#c3e6cb' : hasFreeReviews ? '#bee5eb' : '#f5c6cb'}`
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: isSubscribed ? '#155724' : hasFreeReviews ? '#0c5460' : '#721c24' }}>
            {isSubscribed && '✓ Active'}
            {hasFreeReviews && !isSubscribed && `🎁 ${freeReviewsRemaining} Free Left`}
            {!isSubscribed && !hasFreeReviews && '✗ Inactive'}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Subscription</div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <button
          onClick={() => canUpload ? navigate('/upload') : navigate('/subscription')}
          style={{
            padding: '30px',
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            opacity: canUpload ? 1 : 0.6
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>📹</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Upload Video</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {canUpload ? 'Create a new video review' : 'Subscribe to upload'}
          </div>
        </button>

        <button
          onClick={() => navigate('/profile')}
          style={{
            padding: '30px',
            backgroundColor: '#f8f9fa',
            color: '#000',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>👤</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Profile & Settings</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Update your information</div>
        </button>

        <button
          onClick={() => navigate('/subscription')}
          style={{
            padding: '30px',
            backgroundColor: '#f8f9fa',
            color: '#000',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>💳</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Subscription</div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {isSubscribed ? 'Manage your plan' : hasFreeReviews ? 'Upgrade now' : 'Choose a plan'}
          </div>
        </button>
      </div>

      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Recent Videos</h2>
        {videos.length === 0 ? (
          <div style={{
            padding: '60px 40px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #dee2e6'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎥</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>No Videos Yet</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {canUpload
                ? 'Upload your first video to start creating reviews for your athletes.'
                : 'Subscribe to start uploading and reviewing videos.'}
            </p>
            <button
              onClick={() => canUpload ? navigate('/upload') : navigate('/subscription')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ff0000',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {canUpload ? 'Upload First Video' : 'View Plans'}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {videos.map(video => (
              <div
                key={video.id}
                onClick={() => navigate(`/review/${video.id}`)}
                style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '10px' }}>🎥</div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {video.title || 'Untitled Video'}
                </h3>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  {video.createdAt?.toDate?.()?.toLocaleDateString() || 'No date'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}