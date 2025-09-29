// src/EnhancedVideoUpload.js
import React, { useState, useEffect, useRef } from "react";
import { storage, db, auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { createNotification } from "./NotificationSystem";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DURATION = 60; // 60 seconds
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];

export default function EnhancedVideoUpload() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState("");
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchUserRole = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      setRole(snap.exists() ? snap.data().role : "client");
    };

    const fetchCoaches = async () => {
      const snapshot = await getDocs(
        query(collection(db, "users"), where("role", "==", "coach"))
      );
      setCoaches(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    };

    fetchUserRole();
    fetchCoaches();
  }, [user]);

  const validateFile = (file) => {
    setValidationError("");

    if (!file) {
      setValidationError("Please select a video file");
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError("Please upload a valid video file (MP4, WebM, MOV, or AVI)");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (!validateFile(file)) {
      return;
    }

    setVideo(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);

    // Auto-generate title from filename
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setTitle(fileName);

    // Validate video duration
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    videoElement.src = previewUrl;
    
    videoElement.onloadedmetadata = () => {
      const duration = videoElement.duration;
      setVideoDuration(duration);
      
      if (duration > MAX_DURATION) {
        setValidationError(`Video duration must be less than ${MAX_DURATION} seconds. Current: ${Math.round(duration)}s`);
        setVideo(null);
        setVideoPreview(null);
        URL.revokeObjectURL(previewUrl);
      }
    };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const resetForm = () => {
    setVideo(null);
    setVideoPreview(null);
    setTitle("");
    setDescription("");
    setProgress(0);
    setUrl("");
    setValidationError("");
    setVideoDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!video || !user) {
      setValidationError("Please select a video file");
      return;
    }

    if (role === "client" && !selectedCoach) {
      setValidationError("Please select a coach");
      return;
    }

    if (!title.trim()) {
      setValidationError("Please enter a title");
      return;
    }

    setUploading(true);
    setValidationError("");

    try {
      const timestamp = Date.now();
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_');
      const filePath = `videos/${timestamp}-${sanitizedTitle}.${video.name.split('.').pop()}`;
      const storageRef = ref(storage, filePath);

      const uploadTask = uploadBytesResumable(storageRef, video, {
        contentType: video.type,
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progressPercent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progressPercent);
        },
        (error) => {
          console.error("Upload error:", error);
          setValidationError("Upload failed: " + error.message);
          setUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            const videoData = {
              name: title.trim(),
              originalFileName: video.name,
              description: description.trim(),
              url: downloadURL,
              duration: videoDuration,
              size: video.size,
              type: video.type,
              createdAt: serverTimestamp(),
              clientId: user.uid,
              coachId: role === "client" ? selectedCoach : user.uid,
              uploaderRole: role || "client",
              status: "pending",
              reviewed: false,
            };

            const docRef = await addDoc(collection(db, "videos"), videoData);
            
            // Send notification to coach
            if (role === "client" && selectedCoach) {
              await createNotification(
                selectedCoach,
                "new_video",
                `New video "${title}" has been uploaded by ${user.displayName || user.email}`,
                docRef.id
              );
            }

            setUrl(downloadURL);
            alert("Video uploaded successfully!");
            resetForm();
          } catch (error) {
            console.error("Error saving video data:", error);
            setValidationError("Failed to save video information");
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error("Upload initiation error:", error);
      setValidationError("Failed to start upload");
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Video</h1>
          <p className="page-subtitle">
            Share your video with a coach for professional review and feedback
          </p>
        </div>
      </div>

      <div className="card">
        {/* File Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${video ? 'var(--success-color)' : 'var(--border-color)'}`,
            borderRadius: 'var(--border-radius)',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            backgroundColor: video ? '#f0fdf4' : 'var(--background)',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          
          {!video ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Drop your video here or click to browse
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Supports MP4, WebM, MOV, AVI • Max {MAX_FILE_SIZE / (1024 * 1024)}MB • Max {MAX_DURATION}s duration
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--success-color)' }}>
                Video Ready
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {video.name} • {formatFileSize(video.size)} • {formatDuration(videoDuration)}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetForm();
                }}
                className="btn btn-sm btn-secondary"
                style={{ marginTop: '0.5rem' }}
                disabled={uploading}
              >
                Choose Different Video
              </button>
            </>
          )}
        </div>

        {/* Validation Error */}
        {validationError && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              marginBottom: '1.5rem'
            }}
          >
            {validationError}
          </div>
        )}

        {/* Video Preview */}
        {videoPreview && (
          <div className="video-container" style={{ marginBottom: '1.5rem' }}>
            <video
              ref={videoRef}
              src={videoPreview}
              controls
              className="video-player"
              style={{ borderRadius: 'var(--border-radius)' }}
            />
          </div>
        )}

        {/* Form Fields */}
        {video && (
          <div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="Enter a descriptive title for your video"
                disabled={uploading}
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                placeholder="Add any context or specific areas you'd like the coach to focus on..."
                disabled={uploading}
                maxLength={500}
              />
              <small style={{ color: 'var(--text-secondary)' }}>
                {description.length}/500 characters
              </small>
            </div>

            {role === "client" && (
              <div className="form-group">
                <label className="form-label">Select Coach *</label>
                <select
                  value={selectedCoach}
                  onChange={(e) => setSelectedCoach(e.target.value)}
                  className="form-select"
                  disabled={uploading}
                >
                  <option value="">Choose a coach...</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.displayName || coach.email}
                      {coach.subscriptionStatus !== 'active' && ' (Inactive)'}
                    </option>
                  ))}
                </select>
                {coaches.length === 0 && (
                  <small style={{ color: 'var(--warning-color)' }}>
                    No coaches available. Please contact an administrator.
                  </small>
                )}
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="form-group">
                <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Uploading... {progress}%
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || !title.trim() || (role === "client" && !selectedCoach)}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              {uploading ? (
                <>
                  <span className="loading-spinner" style={{ marginRight: '0.5rem' }} />
                  Uploading...
                </>
              ) : (
                'Upload Video'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Upload Success */}
      {url && !uploading && (
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>
              Upload Successful!
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your video has been uploaded and {role === "client" ? "sent to your coach" : "is ready for review"}.
              You'll receive a notification when the review is complete.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="btn btn-primary"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Upload Another Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}