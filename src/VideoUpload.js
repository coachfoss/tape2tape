import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, db } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function VideoUpload({ user, userData }) {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coaches, setCoaches] = useState([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const isCoach = userData?.role === 'coach';

  // Load coaches for athletes
  useEffect(() => {
    const loadCoaches = async () => {
      if (isCoach || !userData?.myCoaches || userData.myCoaches.length === 0) {
        setLoadingCoaches(false);
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
        
        // Auto-select first coach if only one
        if (coachData.length === 1) {
          setSelectedCoachId(coachData[0].id);
        }
      } catch (error) {
        console.error('Error loading coaches:', error);
      } finally {
        setLoadingCoaches(false);
      }
    };

    loadCoaches();
  }, [userData, isCoach]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        toast.error('Please upload a video file');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    // Athletes must select a coach
    if (!isCoach && !selectedCoachId) {
      toast.error('Please select a coach');
      return;
    }

    setUploading(true);
    const timestamp = Date.now();
    const fileName = `${timestamp}-${videoFile.name}`;
    const storageRef = ref(storage, `videos/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        console.error('Upload error:', error);
        toast.error('Upload failed. Please try again.');
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const videoData = {
            name: title,
            description: description || '',
            url: downloadURL,
            fileName: fileName,
            athleteId: isCoach ? null : user.uid,
            athleteName: isCoach ? null : userData.displayName || user.email,
            coachId: isCoach ? user.uid : selectedCoachId,
            coachName: isCoach 
              ? userData.displayName || user.email 
              : coaches.find(c => c.id === selectedCoachId)?.displayName || 'Coach',
            uploadedAt: serverTimestamp(),
            reviewed: false,
            fileSize: videoFile.size,
            duration: null
          };

          await addDoc(collection(db, 'videos'), videoData);

          toast.success('Video uploaded successfully!');
          navigate('/dashboard');
        } catch (error) {
          console.error('Error saving video data:', error);
          toast.error('Failed to save video information');
        } finally {
          setUploading(false);
        }
      }
    );
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: 'clamp(20px, 4vw, 40px)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 'clamp(32px, 6vw, 40px)' }}>
        <h1 style={{ 
          fontSize: 'clamp(28px, 6vw, 36px)', 
          fontWeight: 'bold', 
          marginBottom: '12px',
          color: 'white'
        }}>
          Upload a Video
        </h1>
        <p style={{ 
          fontSize: 'clamp(14px, 2.5vw, 16px)', 
          color: '#999',
          margin: 0
        }}>
          {isCoach 
            ? 'Upload a video to review and analyze' 
            : 'Upload a video for your coach to review'}
        </p>
      </div>

      <form onSubmit={handleUpload}>
        {/* Coach Selection - Athletes Only */}
        {!isCoach && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            padding: 'clamp(20px, 4vw, 24px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 'clamp(20px, 4vw, 24px)'
          }}>
            <h3 style={{ 
              fontSize: 'clamp(16px, 3vw, 18px)', 
              fontWeight: '600',
              marginTop: 0,
              marginBottom: '16px',
              color: 'white'
            }}>
              Select Coach
            </h3>

            {loadingCoaches ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
                <p style={{ marginTop: '12px', fontSize: 'clamp(13px, 2.5vw, 14px)' }}>Loading coaches...</p>
              </div>
            ) : coaches.length === 0 ? (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '2px solid #ffc107',
                padding: 'clamp(16px, 3vw, 20px)',
                borderRadius: '8px',
                color: '#856404'
              }}>
                <p style={{ 
                  margin: '0 0 12px 0',
                  fontSize: 'clamp(14px, 2.5vw, 15px)',
                  fontWeight: '500'
                }}>
                  You haven't connected with any coaches yet.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  style={{
                    padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
                    backgroundColor: '#ffc107',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: 'clamp(13px, 2.5vw, 14px)'
                  }}
                >
                  Connect with a Coach
                </button>
              </div>
            ) : (
              <select
                value={selectedCoachId}
                onChange={(e) => setSelectedCoachId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'clamp(12px, 2.5vw, 14px)',
                  backgroundColor: '#000',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="" style={{ backgroundColor: '#000', color: 'white' }}>
                  -- Select a Coach --
                </option>
                {coaches.map(coach => (
                  <option 
                    key={coach.id} 
                    value={coach.id}
                    style={{ backgroundColor: '#000', color: 'white' }}
                  >
                    {coach.displayName || coach.email} {coach.coachCode ? `(${coach.coachCode})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* File Upload Area */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          padding: 'clamp(20px, 4vw, 24px)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 'clamp(20px, 4vw, 24px)'
        }}>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              backgroundColor: dragActive ? 'rgba(255,0,0,0.1)' : '#000',
              border: `3px dashed ${dragActive ? '#ff0000' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: '12px',
              padding: 'clamp(40px, 8vw, 60px) clamp(20px, 4vw, 40px)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {videoFile ? (
              <div>
                <div style={{ fontSize: 'clamp(40px, 8vw, 48px)', marginBottom: '16px' }}>✅</div>
                <p style={{ 
                  fontSize: 'clamp(16px, 3vw, 18px)', 
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'white'
                }}>
                  {videoFile.name}
                </p>
                <p style={{ 
                  fontSize: 'clamp(13px, 2.5vw, 14px)', 
                  color: '#999',
                  marginBottom: '16px'
                }}>
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoFile(null);
                  }}
                  style={{
                    padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: 'clamp(13px, 2.5vw, 14px)',
                    fontWeight: '500'
                  }}
                >
                  Choose Different File
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 'clamp(40px, 8vw, 48px)', marginBottom: '16px' }}>📹</div>
                <p style={{ 
                  fontSize: 'clamp(16px, 3vw, 18px)', 
                  color: 'white',
                  marginBottom: '8px'
                }}>
                  Drag and drop video here
                </p>
                <p style={{ 
                  fontSize: 'clamp(13px, 2.5vw, 14px)', 
                  color: '#999',
                  marginBottom: '20px'
                }}>
                  or
                </p>
                <button
                  type="button"
                  style={{
                    padding: 'clamp(12px, 2.5vw, 14px) clamp(28px, 6vw, 36px)',
                    backgroundColor: '#ff0000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 'clamp(14px, 2.5vw, 16px)'
                  }}
                >
                  Choose File
                </button>
              </div>
            )}
            <input
              id="fileInput"
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Title Input */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          padding: 'clamp(20px, 4vw, 24px)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 'clamp(20px, 4vw, 24px)'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '600',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            color: 'white'
          }}>
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            required
            style={{
              width: '100%',
              padding: 'clamp(12px, 2.5vw, 14px)',
              backgroundColor: '#000',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              outline: 'none'
            }}
          />
        </div>

        {/* Description Input */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          padding: 'clamp(20px, 4vw, 24px)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 'clamp(24px, 5vw, 32px)'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '600',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            color: 'white'
          }}>
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description"
            rows={4}
            style={{
              width: '100%',
              padding: 'clamp(12px, 2.5vw, 14px)',
              backgroundColor: '#000',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            padding: 'clamp(20px, 4vw, 24px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 'clamp(20px, 4vw, 24px)'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ 
                  fontSize: 'clamp(13px, 2.5vw, 14px)',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  Uploading...
                </span>
                <span style={{ 
                  fontSize: 'clamp(13px, 2.5vw, 14px)',
                  color: '#ff0000',
                  fontWeight: 'bold'
                }}>
                  {uploadProgress}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  backgroundColor: '#ff0000',
                  transition: 'width 0.3s ease',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || (!isCoach && coaches.length === 0)}
          style={{
            width: '100%',
            padding: 'clamp(14px, 3vw, 18px)',
            backgroundColor: (uploading || (!isCoach && coaches.length === 0)) ? '#666' : '#ff0000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (uploading || (!isCoach && coaches.length === 0)) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: 'clamp(15px, 3vw, 18px)',
            transition: 'all 0.2s'
          }}
        >
          {uploading ? `Uploading... ${uploadProgress}%` : '📤 Upload Video'}
        </button>
      </form>
    </div>
  );
}