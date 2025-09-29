import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { storage, db } from "./firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";

export default function ReviewViewer() {
  const location = useLocation();
  const { videoId } = location.state || {};

  const [videoUrl, setVideoUrl] = useState("");
  const [videoName, setVideoName] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [analysisUrl, setAnalysisUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load video doc
  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) {
        setError("No video selected");
        setLoading(false);
        return;
      }
      
      try {
        const snap = await getDoc(doc(db, "videos", videoId));
        if (snap.exists()) {
          const d = snap.data();
          setVideoUrl(d.url);
          setVideoName(d.name || "Untitled");
        } else {
          setError("Video not found");
        }
      } catch (err) {
        console.error("Could not fetch video doc", err);
        setError("Failed to load video information");
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId]);

  // Load review overlays + voice + analysis
  useEffect(() => {
    if (!videoName) return;
    
    const base = videoName.replace(/\.mp4$/i, "");
    const loadReview = async () => {
      try {
        // Try to load analysis video first (preferred)
        try {
          const analysisRef = ref(storage, `reviews/${base}-analysis.webm`);
          const analysisDownloadUrl = await getDownloadURL(analysisRef);
          setAnalysisUrl(analysisDownloadUrl);
          console.log("Found analysis video");
          return; // If we have analysis video, we don't need annotations
        } catch {
          console.log("No analysis video found, looking for annotations");
        }

        // Load annotations JSON if no analysis video
        try {
          const jsonRef = ref(storage, `reviews/${base}-review.json`);
          const jsonUrl = await getDownloadURL(jsonRef);
          const res = await fetch(jsonUrl);
          const annotationsData = await res.json();
          setAnnotations(Array.isArray(annotationsData) ? annotationsData : []);
          console.log("Loaded annotations:", annotationsData);
        } catch (err) {
          console.log("No annotations found");
          setAnnotations([]);
        }

        // Load voice note
        try {
          const voiceRef = ref(storage, `reviews/${base}-voice.webm`);
          const voiceDownloadUrl = await getDownloadURL(voiceRef);
          setVoiceUrl(voiceDownloadUrl);
          console.log("Found voice note");
        } catch {
          console.log("No voice note found");
          setVoiceUrl(null);
        }

      } catch (error) {
        console.error("Error loading review files:", error);
      }
    };
    
    loadReview();
  }, [videoName]);

  // Render overlay (only if no analysis video and we have annotations)
  useEffect(() => {
    if (analysisUrl || annotations.length === 0) return; // Skip if we have analysis video or no annotations
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    let animationId;

    const render = () => {
      // Set canvas size to match video display size
      const rect = video.getBoundingClientRect();
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw annotations
      annotations.forEach(shape => {
        if (!shape) return;

        ctx.strokeStyle = shape.color || "#ff0000";
        ctx.lineWidth = shape.lineWidth || 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        try {
          if (shape.type === "line") {
            if (typeof shape.x1 === 'number' && typeof shape.y1 === 'number' && 
                typeof shape.x2 === 'number' && typeof shape.y2 === 'number') {
              ctx.beginPath();
              ctx.moveTo(shape.x1, shape.y1);
              ctx.lineTo(shape.x2, shape.y2);
              ctx.stroke();
            }
          }
          
          else if (shape.type === "rect") {
            if (typeof shape.x === 'number' && typeof shape.y === 'number' && 
                typeof shape.w === 'number' && typeof shape.h === 'number') {
              ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
            }
          }
          
          else if (shape.type === "circle") {
            if (typeof shape.cx === 'number' && typeof shape.cy === 'number' && 
                typeof shape.r === 'number') {
              ctx.beginPath();
              ctx.arc(shape.cx, shape.cy, Math.abs(shape.r), 0, Math.PI * 2);
              ctx.stroke();
            }
          }
          
          else if (shape.type === "freehand" && Array.isArray(shape.points)) {
            if (shape.points.length > 1) {
              ctx.beginPath();
              ctx.moveTo(shape.points[0].x, shape.points[0].y);
              shape.points.forEach((point, index) => {
                if (index > 0 && typeof point.x === 'number' && typeof point.y === 'number') {
                  ctx.lineTo(point.x, point.y);
                }
              });
              ctx.stroke();
            }
          }
        } catch (error) {
          console.warn("Error drawing shape:", shape, error);
        }
      });

      animationId = requestAnimationFrame(render);
    };

    // Start rendering when video is ready
    const startRendering = () => {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        render();
      }
    };

    video.addEventListener('loadeddata', startRendering);
    video.addEventListener('play', startRendering);
    
    // Clean up
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      video.removeEventListener('loadeddata', startRendering);
      video.removeEventListener('play', startRendering);
    };
  }, [annotations, analysisUrl]);

  if (!videoId) {
    return (
      <div className="container">
        <div className="card">
          <h3>No Video Selected</h3>
          <p>Please select a video from your dashboard to view the review.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading review...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h3>Error</h3>
          <p style={{ color: 'var(--error-color)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Video Review</h1>
          <p className="page-subtitle">{videoName}</p>
        </div>
      </div>

      <div className="card">
        {analysisUrl ? (
          // Show analysis video (preferred - includes everything)
          <div>
            <h3>Coach Analysis Video</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              This is the complete review with video, audio commentary, and annotations.
            </p>
            <div className="video-container">
              <video 
                src={analysisUrl} 
                controls 
                className="video-player"
                style={{ 
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)'
                }}
                preload="metadata"
              />
            </div>
          </div>
        ) : videoUrl ? (
          // Show original video with overlay annotations
          <div>
            <h3>Original Video with Annotations</h3>
            <div className="video-container" style={{ position: 'relative' }}>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="video-player"
                style={{ 
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)'
                }}
                preload="metadata"
              />
              {annotations.length > 0 && (
                <canvas
                  ref={canvasRef}
                  className="video-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    borderRadius: '8px'
                  }}
                />
              )}
            </div>
            
            {annotations.length > 0 && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                backgroundColor: 'var(--background)', 
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}>
                <strong>Note:</strong> Annotations are overlaid on the video. 
                {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} found.
              </div>
            )}

            {voiceUrl && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4>Coach Voice Commentary</h4>
                <audio 
                  src={voiceUrl} 
                  controls 
                  style={{ 
                    width: '100%', 
                    marginTop: '0.5rem',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <h3>No Review Available</h3>
            <p>The coach hasn't completed the review for this video yet.</p>
          </div>
        )}
      </div>

      {!analysisUrl && annotations.length === 0 && !voiceUrl && (
        <div className="card">
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            backgroundColor: 'var(--background)',
            borderRadius: '8px'
          }}>
            <h3>Review Pending</h3>
            <p>Your coach is working on this review. You'll receive a notification when it's ready!</p>
          </div>
        </div>
      )}
    </div>
  );
}