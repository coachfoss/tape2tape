import React, { useState } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function AddCoachByCode({ user, userData, onCoachAdded }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCoach = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Please enter a coach code');
      return;
    }

    setLoading(true);

    try {
      // Find coach by code
      const coachQuery = query(
        collection(db, 'users'),
        where('coachCode', '==', code.trim().toUpperCase())
      );
      
      const coachSnapshot = await getDocs(coachQuery);

      if (coachSnapshot.empty) {
        toast.error('Coach code not found');
        setLoading(false);
        return;
      }

      const coachDoc = coachSnapshot.docs[0];
      const coachData = coachDoc.data();
      const coachId = coachDoc.id;

      // Check if already added
      const currentUserDoc = await getDoc(doc(db, 'users', user.uid));
      const currentUserData = currentUserDoc.data();
      const currentCoaches = currentUserData.myCoaches || [];
      
      if (currentCoaches.includes(coachId)) {
        toast.error('You already added this coach!');
        setLoading(false);
        return;
      }

      // Add coach to athlete's list
      await updateDoc(doc(db, 'users', user.uid), {
        myCoaches: arrayUnion(coachId)
      });

      // Add athlete to coach's team
      await updateDoc(doc(db, 'users', coachId), {
        myAthletes: arrayUnion(user.uid)
      });

      toast.success(`Successfully added ${coachData.displayName || 'coach'}!`);
      setCode('');
      
      // Force immediate reload
      if (onCoachAdded) {
        onCoachAdded();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding coach:', error);
      toast.error('Failed to add coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '12px',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        🔍 Add a Coach
      </h3>
      <p style={{ 
        color: '#666', 
        fontSize: '14px', 
        marginBottom: '20px',
        lineHeight: '1.5'
      }}>
        Enter your coach's 6-character code to connect with them
      </p>
      
      <form onSubmit={handleAddCoach} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
          style={{
            flex: '1 1 200px',
            padding: '14px 18px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '18px',
            fontFamily: 'monospace',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            textAlign: 'center',
            fontWeight: 'bold',
            transition: 'border-color 0.2s',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#ff0000'}
          onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          style={{
            flex: '0 0 auto',
            padding: '14px 28px',
            backgroundColor: loading || !code.trim() ? '#ccc' : '#ff0000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: loading || !code.trim() ? 'none' : '0 2px 8px rgba(255,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            if (!loading && code.trim()) {
              e.target.style.backgroundColor = '#cc0000';
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && code.trim()) {
              e.target.style.backgroundColor = '#ff0000';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading ? 'Adding...' : '➕ Add Coach'}
        </button>
      </form>
    </div>
  );
}