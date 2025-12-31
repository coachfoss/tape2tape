import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

export default function AthleteDashboard({ user, userData }) {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [coachCodeInput, setCoachCodeInput] = useState('');
  const [addingCoach, setAddingCoach] = useState(false);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    loadConnectedCoaches();
    loadVideos();
  }, [user, userData]);

  const loadConnectedCoaches = async () => {
    if (!userData?.connectedCoaches || userData.connectedCoaches.length === 0) {
      setCoaches([]);
      return;
    }

    try {
      const coachesData = [];
      for (const coachId of userData.connectedCoaches) {
        const coachDoc = await getDoc(doc(db, 'users', coachId));
        if (coachDoc.exists()) {
          coachesData.push({ id: coachDoc.id, ...coachDoc.data() });
        }
      }
      setCoaches(coachesData);
    } catch (error) {
      console.error('Error loading coaches:', error);
    }
  };

  const loadVideos = async () => {
    try {
      const videosQuery = query(
        collection(db, 'videos'),
        where('athleteId', '==', user.uid)
      );
      const videosSnapshot = await getDocs(videosQuery);
      const videosData = videosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVideos(videosData);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const handleAddCoach = async () => {
    if (!coachCodeInput.trim()) {
      toast.error('Please enter a coach code');
      return;
    }

    setAddingCoach(true);
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('coachCode', '==', coachCodeInput.toUpperCase()),
        where('role', '==', 'coach')
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        toast.error('Coach code not found. Please check and try again.');
        setAddingCoach(false);
        return;
      }

      const coachDoc = usersSnapshot.docs[0];
      const coachId = coachDoc.id;

      if (userData.connectedCoaches?.includes(coachId)) {
        toast.error('Already connected to this coach!');
        setAddingCoach(false);
        return;
      }

      await updateDoc(doc(db, 'users', user.uid), {
        connectedCoaches: arrayUnion(coachId)
      });

      toast.success(`Connected to Coach ${coachDoc.data().displayName}!`);
      setCoachCodeInput('');
      loadConnectedCoaches();
    } catch (error) {
      console.error('Error adding coach:', error);
      toast.error('Failed to connect to coach');
    } finally {
      setAddingCoach(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          Welcome back, {userData?.displayName || 'Athlete'}! 👋
        </h1>
        <p style={{ color: '#666' }}>View your video reviews and track your progress</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff0000' }}>{videos.length}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Total Reviews</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff0000' }}>
            {videos.filter(v => {
              const createdAt = v.createdAt?.toDate?.();
              if (!createdAt) return false;
              const now = new Date();
              const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
              return createdAt >= firstDay;
            }).length}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>This Month</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff0000' }}>{coaches.length}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Connected Coaches</div>
        </div>
      </div>

      {/* Connected Coaches */}
      {coaches.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Your Coaches</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {coaches.map(coach => (
              <div key={coach.id} style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏆</div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '5px' }}>{coach.displayName}</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>{coach.sport || 'Coach'}</p>
                {coach.instagram && (
                  <a href={`https://instagram.com/${coach.instagram}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#ff0000' }}>
                    @{coach.instagram}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <button
          onClick={() => navigate('/upload')}
          style={{
            padding: '30px',
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>📹</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Upload Video</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Send video to your coach</div>
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
      </div>

      {/* Add Coach Section */}
      <div style={{ marginBottom: '40px', padding: '30px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>🔗 Connect with a Coach</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Ask your coach for their unique code to link your account and start receiving video reviews.
        </p>
        <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
          <input
            type="text"
            value={coachCodeInput}
            onChange={(e) => setCoachCodeInput(e.target.value.toUpperCase())}
            placeholder="Enter coach code"
            maxLength={6}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              fontSize: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          />
          <button
            onClick={handleAddCoach}
            disabled={addingCoach || !coachCodeInput.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffc107',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: addingCoach || !coachCodeInput.trim() ? 'not-allowed' : 'pointer',
              opacity: addingCoach || !coachCodeInput.trim() ? 0.5 : 1
            }}
          >
            {addingCoach ? 'Adding...' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Videos */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Your Videos</h2>
        {videos.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '2px dashed #dee2e6' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📹</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>No Video Reviews Yet</h2>
            <p style={{ color: '#666', marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px' }}>
              Upload videos for your coach to review, or wait for your coach to upload reviewed videos.
            </p>
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