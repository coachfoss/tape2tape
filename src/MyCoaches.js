import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function MyCoaches({ user, userData }) {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoaches = async () => {
      if (!userData?.myCoaches || userData.myCoaches.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const coachPromises = userData.myCoaches.map(coachId =>
          getDoc(doc(db, 'users', coachId))
        );

        const coachDocs = await Promise.all(coachPromises);
        const coachData = coachDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }));

        setCoaches(coachData);
      } catch (error) {
        console.error('Error loading coaches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCoaches();
  }, [userData]);

  if (loading) {
    return <div>Loading coaches...</div>;
  }

  if (coaches.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>My Coaches</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {coaches.map(coach => (
          <div
            key={coach.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#ff0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              {coach.displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {coach.displayName || coach.email}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {coach.sport || 'Coach'} • Code: {coach.coachCode}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}