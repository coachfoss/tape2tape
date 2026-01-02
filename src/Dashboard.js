import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import AddCoachByCode from './AddCoachByCode';
import MyCoaches from './MyCoaches';

export default function Dashboard({ user, userData }) {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const isCoach = userData?.role === 'coach';
  const hasActiveSubscription = userData?.subscriptionStatus === 'active';
  const freeReviewsRemaining = userData?.freeReviewsRemaining || 0;

  useEffect(() => {
    const loadVideos = async () => {
      if (!user?.uid) return;

      try {
        let q;
        if (isCoach) {
          q = query(
            collection(db, 'videos'),
            where('coachId', '==', user.uid),
            orderBy('uploadedAt', 'desc')
          );
        } else {
          q = query(
            collection(db, 'videos'),
            where('athleteId', '==', user.uid),
            orderBy('uploadedAt', 'desc')
          );
        }

        const snapshot = await getDocs(q);
        const videoData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVideos(videoData);
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [user, isCoach, refreshKey]);

  const handleCoachAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: 'clamp(20px, 4vw, 40px)',
        textAlign: 'center'
      }}>
        <div className="spinner"></div>
        <p style={{ color: '#999', marginTop: '20px' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: 'clamp(20px, 4vw, 40px)',
      minHeight: '100vh'
    }}>
      {/* Welcome Header */}
      <div style={{ 
        marginBottom: 'clamp(24px, 5vw, 40px)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 'clamp(20px, 4vw, 32px)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(24px, 5vw, 36px)', 
          fontWeight: 'bold', 
          marginBottom: '8px',
          color: 'white'
        }}>
          Welcome back, {userData?.displayName || 'Coach'}! 👋
        </h1>
        <p style={{ 
          color: '#999', 
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          margin: 0
        }}>
          {isCoach 
            ? `You have ${videos.length} video${videos.length !== 1 ? 's' : ''} to review` 
            : `You have ${videos.length} video${videos.length !== 1 ? 's' : ''} uploaded`}
        </p>
      </div>

      {/* Coach Subscription Status */}
      {isCoach && (
        <div style={{
          backgroundColor: hasActiveSubscription 
            ? 'rgba(40, 167, 69, 0.1)' 
            : freeReviewsRemaining > 0 
              ? 'rgba(255, 193, 7, 0.1)' 
              : 'rgba(220, 53, 69, 0.1)',
          border: `1px solid ${hasActiveSubscription 
            ? 'rgba(40, 167, 69, 0.3)' 
            : freeReviewsRemaining > 0 
              ? 'rgba(255, 193, 7, 0.3)' 
              : 'rgba(220, 53, 69, 0.3)'}`,
          padding: 'clamp(16px, 3vw, 24px)',
          borderRadius: '12px',
          marginBottom: 'clamp(20px, 4vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ 
                fontSize: 'clamp(16px, 3vw, 20px)', 
                fontWeight: '600', 
                marginBottom: '4px',
                color: hasActiveSubscription ? '#28a745' : freeReviewsRemaining > 0 ? '#ffc107' : '#dc3545'
              }}>
                {hasActiveSubscription 
                  ? '✓ Active Subscription' 
                  : freeReviewsRemaining > 0 
                    ? `🎁 ${freeReviewsRemaining} Free Reviews Left` 
                    : '⚠️ No Active Subscription'}
              </h3>
              <p style={{ 
                fontSize: 'clamp(13px, 2.5vw, 14px)', 
                color: '#ccc',
                margin: 0
              }}>
                {hasActiveSubscription 
                  ? 'Unlimited video reviews available' 
                  : freeReviewsRemaining > 0 
                    ? 'Subscribe for unlimited reviews' 
                    : 'Subscribe to continue reviewing videos'}
              </p>
            </div>
            {!hasActiveSubscription && (
              <button
                onClick={() => navigate('/subscription')}
                style={{
                  padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
                  backgroundColor: '#ff0000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: 'clamp(13px, 2.5vw, 14px)',
                  whiteSpace: 'nowrap'
                }}
              >
                View Plans
              </button>
            )}
          </div>
        </div>
      )}

      {/* Athlete - Add Coach Section */}
      {!isCoach && (
        <>
          <AddCoachByCode user={user} userData={userData} onCoachAdded={handleCoachAdded} />
          <MyCoaches user={user} userData={userData} key={refreshKey} />
        </>
      )}

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: 'clamp(16px, 3vw, 20px)',
        marginBottom: 'clamp(24px, 5vw, 40px)'
      }}>
        <button
          onClick={() => navigate('/upload')}
          style={{
            padding: 'clamp(20px, 4vw, 24px)',
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 'clamp(15px, 3vw, 18px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(255,0,0,0.3)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <span style={{ fontSize: 'clamp(20px, 4vw, 24px)' }}>📹</span>
          Upload New Video
        </button>

        {isCoach && (
          <button
            onClick={() => navigate('/profile')}
            style={{
              padding: 'clamp(20px, 4vw, 24px)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: 'clamp(15px, 3vw, 18px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.08)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: 'clamp(20px, 4vw, 24px)' }}>👥</span>
            View My Team
          </button>
        )}
      </div>

      {/* Videos Section */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 'clamp(20px, 4vw, 32px)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ 
          fontSize: 'clamp(20px, 4vw, 28px)', 
          fontWeight: 'bold', 
          marginBottom: 'clamp(20px, 4vw, 24px)',
          color: 'white'
        }}>
          {isCoach ? 'Videos to Review' : 'My Videos'}
        </h2>

        {videos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'clamp(40px, 8vw, 60px)',
            color: '#999'
          }}>
            <div style={{ fontSize: 'clamp(48px, 10vw, 64px)', marginBottom: '16px' }}>📹</div>
            <h3 style={{ 
              fontSize: 'clamp(18px, 3.5vw, 22px)', 
              marginBottom: '12px',
              color: '#ccc'
            }}>
              No videos yet
            </h3>
            <p style={{ 
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              marginBottom: '24px'
            }}>
              {isCoach 
                ? 'Videos uploaded by your athletes will appear here' 
                : 'Upload your first video to get started'}
            </p>
            <button
              onClick={() => navigate('/upload')}
              style={{
                padding: 'clamp(12px, 2.5vw, 14px) clamp(24px, 5vw, 32px)',
                backgroundColor: '#ff0000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}
            >
              Upload Video
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(16px, 3vw, 20px)'
          }}>
            {videos.map(video => (
              <div
                key={video.id}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
                onClick={() => {
                  if (isCoach) {
                    navigate(`/editor/${video.id}`);
                  } else {
                    navigate(`/review/${video.id}`, { state: { videoId: video.id } });
                  }
                }}
              >
                {/* Video Thumbnail */}
                <div style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  backgroundColor: '#111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {video.thumbnailUrl ? (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 'clamp(32px, 6vw, 48px)' }}>🎥</div>
                  )}
                  {video.reviewed && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: 'clamp(11px, 2vw, 12px)',
                      fontWeight: 'bold'
                    }}>
                      ✓ Reviewed
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div style={{ padding: 'clamp(12px, 3vw, 16px)' }}>
                  <h3 style={{ 
                    fontSize: 'clamp(15px, 3vw, 18px)', 
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: 'white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {video.name || 'Untitled Video'}
                  </h3>
                  <div style={{ 
                    fontSize: 'clamp(12px, 2.5vw, 14px)', 
                    color: '#999',
                    marginBottom: '8px'
                  }}>
                    {video.uploadedAt?.toDate?.().toLocaleDateString() || 'Recently'}
                  </div>
                  {video.athleteName && isCoach && (
                    <div style={{ 
                      fontSize: 'clamp(12px, 2.5vw, 13px)', 
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>👤</span> {video.athleteName}
                    </div>
                  )}
                  {video.coachName && !isCoach && (
                    <div style={{ 
                      fontSize: 'clamp(12px, 2.5vw, 13px)', 
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>🏆</span> {video.coachName}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div style={{ 
                  padding: '0 clamp(12px, 3vw, 16px) clamp(12px, 3vw, 16px)',
                  borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <button
                    style={{
                      width: '100%',
                      padding: 'clamp(10px, 2vw, 12px)',
                      backgroundColor: isCoach 
                        ? (video.reviewed ? 'rgba(255,255,255,0.1)' : '#ff0000')
                        : (video.reviewed ? '#28a745' : 'rgba(255,255,255,0.1)'),
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: 'clamp(13px, 2.5vw, 14px)',
                      marginTop: 'clamp(8px, 2vw, 12px)'
                    }}
                  >
                    {isCoach 
                      ? (video.reviewed ? 'Edit Review' : 'Review Video')
                      : (video.reviewed ? 'Watch Review' : 'Pending Review')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}