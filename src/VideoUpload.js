import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { storage, db } from './firebase';
import toast from 'react-hot-toast';

export default function VideoUpload({ user, userData }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState(null);
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [coaches, setCoaches] = useState([]);

  const isCoach = userData?.role === 'coach';
  const isAthlete = userData?.role === 'athlete';

  useEffect(() => {
    if (isAthlete) {
      loadConnectedCoaches();
    }
  }, [isAthlete, userData]);

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
      if (coachesData.length > 0) {
        setSelectedCoachId(coachesData[0].id);
      }
    } catch (error) {
      console.error('Error loading coaches:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setVideoPreview(url);
      } else {
        toast.error('Please select a video file');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile);
      const url = URL.createObjectURL(droppedFile);
      setVideoPreview(url);
    } else {
      toast.error('Please drop a video file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a video file');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (isAthlete && !selectedCoachId) {
      toast.error('Please select a coach');
      return;
    }

    if (isCoach) {
      const canUpload = userData?.subscriptionStatus === 'active' || (userData?.freeReviewsRemaining > 0);
      if (!canUpload) {
        toast.error('Subscribe or use your free reviews to upload videos');
        navigate('/subscription');
        return;
      }
    }

    setUploading(true);

    try {
      const videoRef = ref(storage, `videos/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(videoRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(prog);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Failed to upload video');
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const videoData = {
            title: title,
            description: description,
            videoURL: downloadURL,
            uploadedBy: user.uid,
            coachId: isCoach ? user.uid : selectedCoachId,
            athleteId: isAthlete ? user.uid : null,
            createdAt: serverTimestamp(),
            status: 'pending'
          };

          const docRef = await addDoc(collection(db, 'videos'), videoData);

          if (isCoach && userData?.freeReviewsRemaining > 0 && userData?.subscriptionStatus !== 'active') {
            await updateDoc(doc(db, 'users', user.uid), {
              freeReviewsRemaining: increment(-1)
            });
          }

          toast.success('Video uploaded successfully!');
          navigate('/dashboard');
        }
      );
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
        Upload a Video
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        {isCoach && 'Upload a video to review for your athletes'}
        {isAthlete && 'Upload a video for your coach to review'}
      </p>

      {/* Athlete Coach Selection */}
      {isAthlete && (
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Select Coach
          </label>
          {coaches.length === 0 ? (
            <div style={{
              padding: '20px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ color: '#856404', marginBottom: '10px' }}>
                You haven't connected with any coaches yet.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffc107',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Connect with a Coach
              </button>
            </div>
          ) : (
            <select
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              {coaches.map(coach => (
                <option key={coach.id} value={coach.id}>
                  {coach.displayName} - {coach.sport || 'Coach'}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* File Upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '20px',
          backgroundColor: '#f8f9fa'
        }}
      >
        <p style={{ marginBottom: '20px', color: '#666' }}>Drag and drop video here</p>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="video-upload"
        />
        <label
          htmlFor="video-upload"
          style={{
            padding: '12px 24px',
            backgroundColor: '#ff0000',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'inline-block'
          }}
        >
          Choose File
        </label>
        {file && <p style={{ marginTop: '20px', color: '#28a745', fontWeight: 'bold' }}>{file.name}</p>}
      </div>

      {/* Video Preview */}
      {videoPreview && (
        <div style={{ marginBottom: '20px' }}>
          <video
            src={videoPreview}
            controls
            style={{
              width: '100%',
              maxWidth: '400px',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}
          />
        </div>
      )}

      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontSize: '16px'
          }}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter video description"
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontSize: '16px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '10px' }}>Progress: {progress}%</p>
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#e9ecef',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#ff0000',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || !file || (isAthlete && coaches.length === 0)}
        style={{
          padding: '15px 30px',
          backgroundColor: '#ff0000',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: (uploading || !file || (isAthlete && coaches.length === 0)) ? 'not-allowed' : 'pointer',
          opacity: (uploading || !file || (isAthlete && coaches.length === 0)) ? 0.5 : 1
        }}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}