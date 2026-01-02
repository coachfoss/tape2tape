import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { storage, db } from "./firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
import toast from 'react-hot-toast';

export default function ReviewViewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { videoId } = location.state || {};

  const [videoUrl, setVideoUrl] = useState("");
  const [videoName, setVideoName] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [analysisUrl, setAnalysisUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

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
    if (analysisUrl || annotations.length === 0) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    let animationId;

    const render = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    const startRendering = () => {
      if (video.readyState >= 2) {
        render();
      }
    };

    video.addEventListener('loadeddata', startRendering);
    video.addEventListener('play', startRendering);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      video.removeEventListener('loadeddata', startRendering);
      video.removeEventListener('play', startRendering);
    };
  }, [annotations, analysisUrl]);

  // Download function
  const handleDownload = async (url, filename) => {
    if (downloading) return;
    
    setDownloading(true);
    toast.loading('Preparing download...');

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
      toast.dismiss();
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss();
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!videoId) {
    return (
      <div style={{ 
        maxWidth: '900px', 
        margin: '40px auto', 
        padding: '0 20px' 
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
          <h3 style={{ marginBottom: '12px' }}>No Video Selected</h3>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Please select a video from your dashboard to view the review.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff0000',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '900px', 
        margin: '40px auto', 
        padding: '0 20px',
        textAlign: 'center'
      }}>
        <div className="spinner"></div>
        <p style={{ color: '#666', marginTop: '20px' }}>Loading review...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        maxWidth: '900px', 
        margin: '40px auto', 
        padding: '0 20px' 
      }}>
        <div style={{
          backgroundColor: '#fff5f5',
          padding: '40px',
          borderRadius: '12px',
          border: '2px solid #dc3545',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ marginBottom: '12px', color: '#dc3545' }}>Error</h3>
          <p style={{ color: '#666' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '40px 20px' 
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: 'clamp(24px, 5vw, 32px)', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: '#333'
          }}>
            Video Review
          </h1>
          <p style={{ fontSize: '16px', color: '#666' }}>{videoName}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Main Video Container */}
      <div style={{
        backgroundColor: 'white',
        padding: 'clamp(20px, 4vw, 32px)',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '24px'
      }}>
        {analysisUrl ? (
          // Analysis Video (complete review)
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                  Coach Analysis Video
                </h3>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                  Complete review with video, audio commentary, and annotations
                </p>
              </div>
              <button
                onClick={() => handleDownload(analysisUrl, `${videoName.replace(/\.mp4$/i, '')}-review.webm`)}
                disabled={downloading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: downloading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {downloading ? '⏳ Downloading...' : '📥 Download Review'}
              </button>
            </div>
            <div style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '100%',
              margin: '0 auto'
            }}>
              <video 
                src={analysisUrl} 
                controls 
                style={{ 
                  width: '100%',
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                preload="metadata"
              />
            </div>
          </div>
        ) : videoUrl ? (
          // Original Video with Annotations
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                  Original Video {annotations.length > 0 && 'with Annotations'}
                </h3>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                  {annotations.length > 0 
                    ? `${annotations.length} annotation${annotations.length !== 1 ? 's' : ''} overlaid`
                    : 'No annotations yet'}
                </p>
              </div>
              <button
                onClick={() => handleDownload(videoUrl, videoName)}
                disabled={downloading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: downloading ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {downloading ? '⏳ Downloading...' : '📥 Download Video'}
              </button>
            </div>
            
            <div style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '100%',
              margin: '0 auto'
            }}>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                style={{ 
                  width: '100%',
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'block'
                }}
                preload="metadata"
              />
              {annotations.length > 0 && (
                <canvas
                  ref={canvasRef}
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
                marginTop: '16px', 
                padding: '12px 16px', 
                backgroundColor: '#e7f3ff', 
                borderRadius: '6px',
                fontSize: '14px',
                color: '#004085',
                borderLeft: '4px solid #007bff'
              }}>
                <strong>📝 Note:</strong> Coach annotations are overlaid on the video above.
              </div>
            )}

            {voiceUrl && (
              <div style={{ 
                marginTop: '24px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    🎙️ Coach Voice Commentary
                  </h4>
                  <button
                    onClick={() => handleDownload(voiceUrl, `${videoName.replace(/\.mp4$/i, '')}-voice.webm`)}
                    disabled={downloading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: downloading ? '#ccc' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: downloading ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '13px'
                    }}
                  >
                    {downloading ? '⏳' : '📥 Download Audio'}
                  </button>
                </div>
                <audio 
                  src={voiceUrl} 
                  controls 
                  style={{ 
                    width: '100%',
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⏳</div>
            <h3 style={{ marginBottom: '12px', color: '#333' }}>Review Pending</h3>
            <p style={{ fontSize: '16px' }}>
              Your coach is working on this review. You'll receive an email notification when it's ready!
            </p>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {analysisUrl && (
          <div style={{
            backgroundColor: '#d4edda',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #c3e6cb'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#155724' }}>
              Review Complete
            </h4>
            <p style={{ fontSize: '14px', color: '#155724', margin: 0 }}>
              Your coach has finished reviewing this video with full analysis.
            </p>
          </div>
        )}
        
        {(annotations.length > 0 || voiceUrl) && !analysisUrl && (
          <div style={{
            backgroundColor: '#fff3cd',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ffc107'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#856404' }}>
              Review Available
            </h4>
            <p style={{ fontSize: '14px', color: '#856404', margin: 0 }}>
              {annotations.length > 0 && voiceUrl 
                ? 'Annotations and voice commentary available'
                : annotations.length > 0 
                  ? 'Annotations available'
                  : 'Voice commentary available'}
            </p>
          </div>
        )}

        <div style={{
          backgroundColor: '#e7f3ff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #007bff'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💡</div>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#004085' }}>
            Download Available
          </h4>
          <p style={{ fontSize: '14px', color: '#004085', margin: 0 }}>
            Download the video to save it locally or share with teammates.
          </p>
        </div>
      </div>
    </div>
  );
}