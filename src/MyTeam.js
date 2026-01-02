import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function MyTeam({ user, userData }) {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAthletes = async () => {
      if (!userData?.myAthletes || userData.myAthletes.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const athletePromises = userData.myAthletes.map(athleteId =>
          getDoc(doc(db, 'users', athleteId))
        );

        const athleteDocs = await Promise.all(athletePromises);
        const athleteData = athleteDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }));

        setAthletes(athleteData);
      } catch (error) {
        console.error('Error loading athletes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAthletes();
  }, [userData]);

  if (loading) {
    return <div>Loading team...</div>;
  }

  if (athletes.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '8px' }}>My Team</h3>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          No athletes yet. Share your coach code to get started!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>
        My Team ({athletes.length} {athletes.length === 1 ? 'Athlete' : 'Athletes'})
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {athletes.map(athlete => (
          <div
            key={athlete.id}
            style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 auto 12px'
              }}
            >
              {athlete.displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
              {athlete.displayName || athlete.email}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {athlete.email}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}