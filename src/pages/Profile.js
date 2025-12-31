import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, updatePassword } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function Profile({ user, userData }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [sport, setSport] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [coachCode, setCoachCode] = useState('');
  
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [tiktok, setTiktok] = useState('');
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user && userData) {
      setEmail(user.email || '');
      setDisplayName(userData.displayName || '');
      setPhotoURL(user.photoURL || '');
      setBio(userData.bio || '');
      setSport(userData.sport || '');
      setOrganization(userData.organization || '');
      setPhone(userData.phone || '');
      setCoachCode(userData.coachCode || '');
      setInstagram(userData.instagram || '');
      setTwitter(userData.twitter || '');
      setTiktok(userData.tiktok || '');
    }
  }, [user, userData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(user, { displayName });

      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        bio,
        sport,
        organization,
        phone,
        instagram,
        twitter,
        tiktok,
        updatedAt: new Date()
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const photoRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(photoRef, file);
      const url = await getDownloadURL(photoRef);

      await updateProfile(user, { photoURL: url });
      setPhotoURL(url);

      toast.success('Photo updated successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(user, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in to change your password');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setSaving(false);
    }
  };

  const isCoach = userData?.role === 'coach';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            Profile & Settings
          </h1>
          <p style={{ color: '#666' }}>Manage your account information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
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
            ✏️ Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                setIsEditing(false);
                setDisplayName(userData.displayName || '');
                setBio(userData.bio || '');
                setSport(userData.sport || '');
                setOrganization(userData.organization || '');
                setPhone(userData.phone || '');
                setInstagram(userData.instagram || '');
                setTwitter(userData.twitter || '');
                setTiktok(userData.tiktok || '');
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div style={{
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Profile Photo
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#dee2e6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            overflow: 'hidden'
          }}>
            {photoURL ? (
              <img src={photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              '👤'
            )}
          </div>
          <label style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            📷 Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div style={{
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Basic Information
        </h2>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            ) : (
              <div style={{ padding: '12px', fontSize: '16px', color: '#495057' }}>
                {displayName || 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Email
            </label>
            <div style={{ padding: '12px', fontSize: '16px', color: '#6c757d', backgroundColor: '#e9ecef', borderRadius: '6px' }}>
              {email}
            </div>
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
              Email cannot be changed
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Account Type
            </label>
            <div style={{ padding: '12px', fontSize: '16px', color: '#495057' }}>
              {isCoach ? '🏆 Coach' : '⚡ Athlete'}
            </div>
          </div>

          {isCoach && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                Your Coach Code
              </label>
              <div style={{
                padding: '12px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#ff0000',
                backgroundColor: 'white',
                border: '2px dashed #ff0000',
                borderRadius: '6px',
                textAlign: 'center',
                letterSpacing: '2px'
              }}>
                {coachCode || 'Not assigned'}
              </div>
              <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                Share this code with athletes to connect with them
              </p>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Sport / Focus Area
            </label>
            {isEditing ? (
              <input
                type="text"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                placeholder="e.g., Hockey, Soccer, Basketball"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            ) : (
              <div style={{ padding: '12px', fontSize: '16px', color: '#495057' }}>
                {sport || 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Organization
            </label>
            {isEditing ? (
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g., High School, Club Team"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            ) : (
              <div style={{ padding: '12px', fontSize: '16px', color: '#495057' }}>
                {organization || 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            ) : (
              <div style={{ padding: '12px', fontSize: '16px', color: '#495057' }}>
                {phone || 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '16px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            ) : (
              <div style={{ padding: '12px', fontSize: '16px', color: '#495057', whiteSpace: 'pre-wrap' }}>
                {bio || 'Not set'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Social Media
        </h2>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              <span style={{ 
                display: 'inline-block',
                width: '24px',
                height: '24px',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                borderRadius: '6px',
                marginRight: '8px',
                verticalAlign: 'middle'
              }}></span>
              Instagram
            </label>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#666' }}>@</span>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                  placeholder="username"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
            ) : (
              <div style={{ padding: '12px', fontSize: '16px', color: '#495057' }}>
                {instagram ? `@${instagram}` : 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              <span style={{ 
                display: 'inline-block',
                width: '24px',
                height: '24px',
                backgroundColor: '#1DA1F2',
                borderRadius: '6px',
                marginRight: '8px',
                verticalAlign: 'middle',
                textAlign: 'center',
                color: 'white',
                fontSize: '14px',
                lineHeight: '24px',
                fontWeight: 'bold'
              }}>𝕏</span>
              Twitter / X
            </label>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#666' }}>@</span>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value.replace('@', ''))}
                  placeholder="username"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
            ) : (
              <div style={{ padding: '12px', fontSize: '16px', color: '#495057' }}>
                {twitter ? `@${twitter}` : 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              <span style={{ 
                display: 'inline-block',
                width: '24px',
                height: '24px',
                backgroundColor: '#000000',
                borderRadius: '6px',
                marginRight: '8px',
                verticalAlign: 'middle',
                textAlign: 'center',
                color: '#00f2ea',
                fontSize: '16px',
                lineHeight: '24px',
                fontWeight: 'bold'
              }}>♪</span>
              TikTok
            </label>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#666' }}>@</span>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value.replace('@', ''))}
                  placeholder="username"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
            ) : (
              <div style={{ padding: '12px', fontSize: '16px', color: '#495057' }}>
                {tiktok ? `@${tiktok}` : 'Not set'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Security
        </h2>

        {!showPasswordChange ? (
          <button
            onClick={() => setShowPasswordChange(true)}
            style={{
              padding: '12px 20px',
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔒 Change Password
          </button>
        ) : (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={saving || !newPassword || !confirmPassword}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff0000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (saving || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer',
                  opacity: (saving || !newPassword || !confirmPassword) ? 0.5 : 1,
                  fontWeight: 'bold'
                }}
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}
      </div>

      {isCoach && (
        <div style={{
          padding: '30px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
            Subscription
          </h2>
          <div style={{ marginBottom: '15px' }}>
            <span style={{ color: '#6c757d' }}>Status: </span>
            <span style={{ fontWeight: 'bold' }}>
              {userData?.subscriptionStatus === 'active' && '✓ Active'}
              {(!userData?.subscriptionStatus || userData?.subscriptionStatus === 'inactive') && (userData?.freeReviewsRemaining > 0 ? `🎁 ${userData.freeReviewsRemaining} Free Reviews Left` : '✗ Inactive')}
            </span>
          </div>
          <button
            onClick={() => navigate('/subscription')}
            style={{
              padding: '12px 20px',
              backgroundColor: '#ff0000',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Manage Subscription
          </button>
        </div>
      )}
    </div>
  );
}