import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, updatePassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import MyTeam from '../MyTeam';

export default function Profile({ user, userData }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
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

  // Force reload fresh user data on mount
  useEffect(() => {
    const loadFreshUserData = async () => {
      if (!user?.uid) {
        setLoadingData(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const freshData = userDoc.data();
          setEmail(user.email || '');
          setDisplayName(freshData.displayName || '');
          setPhotoURL(user.photoURL || freshData.photoURL || '');
          setBio(freshData.bio || '');
          setSport(freshData.sport || '');
          setOrganization(freshData.organization || '');
          setPhone(freshData.phone || '');
          setCoachCode(freshData.coachCode || '');
          setInstagram(freshData.instagram || '');
          setTwitter(freshData.twitter || '');
          setTiktok(freshData.tiktok || '');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadFreshUserData();
  }, [user]);

  // Backup: Also update from userData prop when it changes
  useEffect(() => {
    if (user && userData) {
      setEmail(user.email || '');
      setDisplayName(userData.displayName || '');
      setPhotoURL(user.photoURL || userData.photoURL || '');
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

  const copyCoachCode = () => {
    navigator.clipboard.writeText(coachCode);
    setCopied(true);
    toast.success('Coach code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const generateMyCoachCode = async () => {
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      await updateDoc(doc(db, 'users', user.uid), {
        coachCode: code
      });

      setCoachCode(code);
      toast.success('Coach code generated!');
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Failed to generate code');
    }
  };

  const handleRoleSwitch = async () => {
    const newRole = isCoach ? 'athlete' : 'coach';
    const confirmMessage = isCoach 
      ? 'Are you sure you want to switch to an Athlete account? You will lose access to coach features and your subscription will be canceled.'
      : 'Are you sure you want to switch to a Coach account? You will need to set up a subscription to access coach features.';

    if (window.confirm(confirmMessage)) {
      try {
        const updates = {
          role: newRole,
          updatedAt: new Date()
        };

        // If switching to coach and no coach code, generate one
        if (newRole === 'coach' && !coachCode) {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let code = '';
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          updates.coachCode = code;
        }

        await updateDoc(doc(db, 'users', user.uid), updates);
        
        toast.success(`Account switched to ${newRole}!`);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Error switching role:', error);
        toast.error('Failed to switch account type');
      }
    }
  };

  const isCoach = userData?.role === 'coach';

  // Loading state
  if (loadingData || !userData) {
    return (
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '40px 20px',
        textAlign: 'center' 
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p style={{ color: '#666' }}>Loading profile...</p>
      </div>
    );
  }

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

      {/* COACH CODE SECTION - Prominent for coaches */}
      {isCoach && (
        <div style={{
          backgroundColor: '#fff5f5',
          border: '3px solid #ff0000',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 4px 12px rgba(255, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#ff0000' }}>
            🏆 Your Coach Code
          </h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            Share this code with athletes so they can connect with you
          </p>
          
          {coachCode ? (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{
                flex: 1,
                padding: '20px 30px',
                backgroundColor: 'white',
                border: '3px solid #ff0000',
                borderRadius: '10px',
                fontSize: '48px',
                fontWeight: 'bold',
                letterSpacing: '12px',
                textAlign: 'center',
                fontFamily: 'monospace',
                color: '#ff0000'
              }}>
                {coachCode}
              </div>
              <button
                onClick={copyCoachCode}
                style={{
                  padding: '20px 30px',
                  backgroundColor: copied ? '#28a745' : '#ff0000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minWidth: '140px'
                }}
              >
                {copied ? '✓ Copied!' : '📋 Copy Code'}
              </button>
            </div>
          ) : (
            <button
              onClick={generateMyCoachCode}
              style={{
                width: '100%',
                padding: '20px',
                backgroundColor: '#ff0000',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🎲 Generate My Coach Code
            </button>
          )}
        </div>
      )}

      {/* MY TEAM SECTION - For coaches */}
      {isCoach && <MyTeam user={user} userData={userData} />}

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

      {/* ACCOUNT TYPE SWITCHER */}
      <div style={{
        padding: '30px',
        backgroundColor: '#fff3cd',
        border: '2px solid #ffc107',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#856404' }}>
          🔄 Change Account Type
        </h2>
        <div style={{ marginBottom: '15px' }}>
          <p style={{ color: '#856404', marginBottom: '10px' }}>
            Current account type: <strong>{isCoach ? '🏆 Coach' : '⚡ Athlete'}</strong>
          </p>
          <p style={{ color: '#856404', fontSize: '14px', marginBottom: '0' }}>
            {isCoach 
              ? '⚠️ Warning: Switching to Athlete will remove access to coach features and cancel any active subscription.'
              : '💡 Switching to Coach will allow you to review videos and manage athletes. You\'ll need to set up a subscription to access all features.'
            }
          </p>
        </div>
        <button
          onClick={handleRoleSwitch}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          🔄 Switch to {isCoach ? 'Athlete' : 'Coach'}
        </button>
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