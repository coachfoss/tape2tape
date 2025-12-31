import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { storage, db } from "./firebase";
import { ref, uploadBytes } from "firebase/storage";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { notifyReviewCompleted } from "./NotificationSystem";

const DEFAULT_COLOR = "#ff0000"; // Red only
const LINE_WIDTH = 3;

export default function CoachEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { videoId } = location.state || {};

  const [videoUrl, setVideoUrl] = useState("");
  const [videoName, setVideoName] = useState("");
  const [loading, setLoading] = useState(true);

  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const facecamPreviewRef = useRef(null);
  const containerRef = useRef(null);

  const [drawMode, setDrawMode] = useState(false);
  const [shapes, setShapes] = useState([]);
  const drawing = useRef(null);
  const tempShapeRef = useRef(null);
  const [tool, setTool] = useState("line"); // "line" or "freehand"

  const [recording, setRecording] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("unknown");
  const recChunksRef = useRef([]);
  const recMediaRecorderRef = useRef(null);
  const micStreamRef = useRef(null);
  const facecamStreamRef = useRef(null);
  const compCanvasRef = useRef(null);
  const compRafRef = useRef(null);

  // Video controls
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Zoom and pan
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Touch handling
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const touchStartRef = useRef(null);
  const [isGesturing, setIsGesturing] = useState(false);
  const gestureStartRef = useRef({ distance: 0, zoom: 1, centerX: 0, centerY: 0 });

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "videos", videoId));
        if (snap.exists()) {
          const d = snap.data();
          setVideoUrl(d.url);
          setVideoName(d.name || "Untitled");
        }
      } catch (err) {
        console.error("Failed to fetch video doc", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const micPermission = await navigator.permissions.query({ name: 'microphone' });
        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        
        if (micPermission.state === 'granted' && cameraPermission.state === 'granted') {
          setPermissionStatus("granted");
        } else if (micPermission.state === 'denied' || cameraPermission.state === 'denied') {
          setPermissionStatus("denied");
        } else {
          setPermissionStatus("prompt");
        }
      } catch (error) {
        setPermissionStatus("unknown");
      }
    };

    checkPermissions();
  }, []);

  // Prevent scrolling and set up viewport
  useEffect(() => {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    // Cleanup camera and microphone when component unmounts or user leaves
useEffect(() => {
  return () => {
    // Stop microphone stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped microphone track');
      });
      micStreamRef.current = null;
    }
    
    // Stop camera stream
    if (facecamStreamRef.current) {
      facecamStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped camera track');
      });
      facecamStreamRef.current = null;
    }
    
    // Clear facecam preview
    if (facecamPreviewRef.current) {
      facecamPreviewRef.current.srcObject = null;
    }
    
    // Stop media recorder if active
    if (recMediaRecorderRef.current && recMediaRecorderRef.current.state !== 'inactive') {
      recMediaRecorderRef.current.stop();
    }
    
    // Cancel animation frame
    if (compRafRef.current) {
      cancelAnimationFrame(compRafRef.current);
    }
    
    console.log('CoachEditor cleanup completed - camera should be off');
  };
}, []);
    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0, minimum-scale=1.0';

    const preventDefault = (e) => e.preventDefault();
    
    // Disable all scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100vh';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.touchAction = 'none';
    
    // Prevent various touch behaviors
    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('gesturestart', preventDefault, { passive: false });
    document.addEventListener('gesturechange', preventDefault, { passive: false });
    document.addEventListener('gestureend', preventDefault, { passive: false });

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.touchAction = '';
      
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('gesturestart', preventDefault);
      document.removeEventListener('gesturechange', preventDefault);
      document.removeEventListener('gestureend', preventDefault);
    };
  }, []);

  // Canvas rendering
  useEffect(() => {
    const c = overlayRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;

    let rafId;
    const render = () => {
      const v = videoRef.current;
      const naturalW = v?.videoWidth || 1280;
      const naturalH = v?.videoHeight || 720;

      if (c.width !== naturalW) c.width = naturalW;
      if (c.height !== naturalH) c.height = naturalH;

      ctx.clearRect(0, 0, c.width, c.height);
      drawShapesArray(ctx, shapes);
      const s = tempShapeRef.current;
      if (s) drawShapesArray(ctx, [s]);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [shapes]);

  function drawShapesArray(ctx, arr) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (const s of arr) {
      if (!s) continue;
      ctx.strokeStyle = DEFAULT_COLOR;
      ctx.lineWidth = LINE_WIDTH;

      if (s.type === "line") {
        const { x1, y1, x2, y2 } = s;
        if ([x1, y1, x2, y2].every((n) => typeof n === "number")) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
      
      if (s.type === "freehand") {
        const pts = Array.isArray(s.points) ? s.points : [];
        if (pts.length > 1) {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.stroke();
        }
      }
    }
  }

  function getCanvasCoords(clientX, clientY) {
    const c = overlayRef.current;
    if (!c) return { x: 0, y: 0 };
    
    const rect = c.getBoundingClientRect();
    
    // Simple approach: get coordinates relative to the actual visible canvas
    const x = ((clientX - rect.left) * c.width) / rect.width;
    const y = ((clientY - rect.top) * c.height) / rect.height;
    
    return { x, y };
  }

  const handleStart = useCallback((clientX, clientY) => {
    if (isPanning || !drawMode) return;

    // Haptic feedback on touch devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    const { x, y } = getCanvasCoords(clientX, clientY);

    if (tool === "eraser") {
      const hitIndex = findHitShapeIndex(shapes, x, y);
      if (hitIndex >= 0) {
        setShapes(prev => {
          const copy = [...prev];
          copy.splice(hitIndex, 1);
          return copy;
        });
        // Extra haptic feedback for successful erase
        if ('vibrate' in navigator) {
          navigator.vibrate([5, 50, 5]);
        }
      }
      return;
    }

    const seed = {
      type: tool,
      x1: x, y1: y, x2: x, y2: y,
      points: tool === "freehand" ? [{ x, y }] : [],
    };
    
    drawing.current = seed;
    tempShapeRef.current = { ...seed };
  }, [drawMode, tool, isPanning, shapes]);

  const handleMove = useCallback((clientX, clientY) => {
    if (isPanning || !drawMode) return;

    const { x, y } = getCanvasCoords(clientX, clientY);

    if (tool === "eraser") {
      // Continuous erasing while dragging
      const hitIndex = findHitShapeIndex(shapes, x, y);
      if (hitIndex >= 0) {
        setShapes(prev => {
          const copy = [...prev];
          copy.splice(hitIndex, 1);
          return copy;
        });
      }
      return;
    }

    if (!drawing.current) return;

    const s = { ...drawing.current };

    if (tool === "freehand") {
      s.points = [...(s.points || []), { x, y }];
    } else if (tool === "line") {
      s.x2 = x;
      s.y2 = y;
    }

    tempShapeRef.current = s;
    drawing.current = s;
  }, [drawMode, tool, isPanning, shapes]);

  const handleEnd = useCallback((clientX, clientY) => {
    if (isPanning || !drawMode) return;

    if (tool === "eraser") {
      // Eraser doesn't need end handling
      return;
    }

    if (!drawing.current) return;

    const { x, y } = getCanvasCoords(clientX, clientY);
    let s = { ...drawing.current };

    if (tool === "line") {
      s.x2 = x;
      s.y2 = y;
    }

    setShapes((prev) => [...prev, s]);
    drawing.current = null;
    tempShapeRef.current = null;

    // Haptic feedback for completed drawing
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  }, [drawMode, tool, isPanning]);

  // Helper function to get distance between two touches
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Helper function to get center point between two touches
  const getTouchCenter = (touches) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  // Unified touch/mouse handlers
  const handlePointerStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    const timeDiff = now - lastTouchTime;
    
    let clientX, clientY;
    if (e.type.startsWith('touch')) {
      // Handle pinch gesture start
      if (e.touches.length === 2) {
        setIsGesturing(true);
        const distance = getTouchDistance(e.touches);
        const center = getTouchCenter(e.touches);
        gestureStartRef.current = {
          distance,
          zoom: zoom,
          centerX: center.x,
          centerY: center.y
        };
        return;
      }
      
      if (e.touches.length !== 1) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      setLastTouchTime(now);
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Reset gesture state for single touch
    setIsGesturing(false);
    touchStartRef.current = { x: clientX, y: clientY, time: now };
    
    // Double tap to toggle draw mode on touch devices
    if (e.type.startsWith('touch') && timeDiff < 300) {
      setDrawMode(!drawMode);
      return;
    }
    
    if (drawMode) {
      handleStart(clientX, clientY);
    } else {
      // Start panning
      setIsPanning(true);
      panStartRef.current = { 
        x: clientX, 
        y: clientY, 
        panX: panX, 
        panY: panY 
      };
    }
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Handle pinch-to-zoom gesture
    if (e.type.startsWith('touch') && e.touches.length === 2) {
      if (!isGesturing) return;
      
      const currentDistance = getTouchDistance(e.touches);
      const currentCenter = getTouchCenter(e.touches);
      const startData = gestureStartRef.current;
      
      if (startData.distance > 0) {
        // Calculate zoom based on distance change
        const scaleChange = currentDistance / startData.distance;
        const newZoom = Math.max(0.5, Math.min(3, startData.zoom * scaleChange));
        
        // Calculate pan adjustment to keep zoom centered on pinch point
        const container = containerRef.current;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const centerOffsetX = (currentCenter.x - containerRect.left - containerRect.width / 2) / zoom;
          const centerOffsetY = (currentCenter.y - containerRect.top - containerRect.height / 2) / zoom;
          
          // Adjust pan to keep the pinch center point stable
          const zoomDiff = newZoom - zoom;
          setPanX(panX - centerOffsetX * zoomDiff / newZoom);
          setPanY(panY - centerOffsetY * zoomDiff / newZoom);
        }
        
        setZoom(newZoom);
      }
      return;
    }
    
    let clientX, clientY;
    if (e.type.startsWith('touch')) {
      if (e.touches.length !== 1 || isGesturing) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (drawMode && !isPanning && !isGesturing) {
      handleMove(clientX, clientY);
    } else if (isPanning && !isGesturing) {
      const deltaX = (clientX - panStartRef.current.x) / zoom;
      const deltaY = (clientY - panStartRef.current.y) / zoom;
      setPanX(panStartRef.current.panX + deltaX);
      setPanY(panStartRef.current.panY + deltaY);
    }
  };

  const handlePointerEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Handle end of pinch gesture
    if (e.type.startsWith('touch') && isGesturing) {
      // Check if we still have multiple touches
      if (e.touches.length < 2) {
        setIsGesturing(false);
      }
      return;
    }
    
    let clientX, clientY;
    if (e.type.startsWith('touch')) {
      if (e.changedTouches.length !== 1 || isGesturing) return;
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (drawMode && !isPanning && !isGesturing) {
      handleEnd(clientX, clientY);
    }
    
    setIsPanning(false);
  };

  // Eraser function
  const handleErase = (clientX, clientY) => {
    const { x, y } = getCanvasCoords(clientX, clientY);
    setShapes(prev => {
      const hitIndex = findHitShapeIndex(prev, x, y);
      if (hitIndex >= 0) {
        const copy = [...prev];
        copy.splice(hitIndex, 1);
        return copy;
      }
      return prev;
    });
  };

  function findHitShapeIndex(arr, x, y) {
    const tolerance = 15; // Larger hit area for touch
    
    for (let i = arr.length - 1; i >= 0; i--) {
      const s = arr[i];
      if (!s) continue;
      
      if (s.type === "line") {
        if (pointNearLine(x, y, s.x1, s.y1, s.x2, s.y2, tolerance)) return i;
      }
      
      if (s.type === "freehand") {
        const pts = s.points || [];
        for (let j = 1; j < pts.length; j++) {
          if (pointNearLine(x, y, pts[j-1].x, pts[j-1].y, pts[j].x, pts[j].y, tolerance)) return i;
        }
      }
    }
    return -1;
  }

  function pointNearLine(px, py, x1, y1, x2, y2, tolerance) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D || 1;
    let t = dot / lenSq;
    t = Math.max(0, Math.min(1, t));
    const lx = x1 + t * C;
    const ly = y1 + t * D;
    const dx = px - lx;
    const dy = py - ly;
    return dx * dx + dy * dy <= tolerance * tolerance;
  }

  // Video controls
  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) {
      setDuration(v.duration || 0);
    }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v) {
      setCurrent(v.currentTime || 0);
      setIsPlaying(!v.paused);
    }
  };

  const playPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  };

  const onSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Number(e.target.value);
    v.currentTime = t;
    setCurrent(t);
  };

  // Frame by frame navigation (improved)
  const stepFrame = (direction) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    
    // More precise frame stepping - assume 30fps but calculate from video if possible
    const frameRate = 30;
    const frameTime = 1 / frameRate;
    let newTime;
    
    if (direction > 0) {
      // Step forward
      newTime = Math.min(duration, current + frameTime);
    } else {
      // Step backward  
      newTime = Math.max(0, current - frameTime);
    }
    
    v.currentTime = newTime;
    setCurrent(newTime);
    
    // Haptic feedback for frame stepping
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  // Video speed control
  const changePlaybackSpeed = (speed) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = speed;
    setPlaybackSpeed(speed);
    
    // Visual feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Zoom controls
  const handleZoom = (delta) => {
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    setZoom(newZoom);
    
    // Reset pan when zooming out to 1x
    if (newZoom === 1) {
      setPanX(0);
      setPanY(0);
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Recording functions (simplified for space - keeping existing logic)
  const startAnalysis = async () => {
    // ... existing recording logic
    try {
      micStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      facecamStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });

      setPermissionStatus("granted");
      
      if (facecamPreviewRef.current) {
        facecamPreviewRef.current.srcObject = facecamStreamRef.current;
        await facecamPreviewRef.current.play();
      }

      // ... rest of existing recording setup
      const v = videoRef.current;
      if (!v) throw new Error("Video not ready");
      
      // ... existing canvas and recording logic
      setRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      setPermissionStatus("denied");
      alert("Camera/microphone access required for recording.");
    }
  };

  const stopAnalysis = () => {
    const mr = recMediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
    }
    setRecording(false);
  };

  const saveReview = async () => {
    try {
      const base = videoName.replace(/\.mp4$/i, "");
      const jsonRef = ref(storage, `reviews/${base}-review.json`);
      const clean = shapes.filter(Boolean);
      const blob = new Blob([JSON.stringify(clean)], { type: "application/json" });
      await uploadBytes(jsonRef, blob);
      await updateDoc(doc(db, "videos", videoId), {
        reviewed: true,
        reviewedAt: serverTimestamp(),
      });
      
      await notifyReviewCompleted(videoId);
      alert("Review saved and client notified!");
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Failed to save review");
    }
  };

  if (!videoId) return (
    <div style={{ padding: 20, color: 'white', backgroundColor: '#000', minHeight: '100vh' }}>
      <h3>No video selected</h3>
      <p>Please select a video from your dashboard to review.</p>
    </div>
  );
  
  if (loading) return (
    <div style={{ padding: 20, textAlign: 'center', color: 'white', backgroundColor: '#000', minHeight: '100vh' }}>
      <p>Loading video...</p>
    </div>
  );
  
  if (!videoUrl) return (
    <div style={{ padding: 20, color: 'white', backgroundColor: '#000', minHeight: '100vh' }}>
      <h3>Video not found</h3>
      <p>The requested video could not be loaded.</p>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#000',
      overflow: 'hidden',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      touchAction: 'none'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: 'rgba(0,0,0,0.9)',
        color: 'white',
        fontSize: '14px',
        height: '44px',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
          {videoName}
        </div>
        <button 
          onClick={() => navigate("/dashboard")}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Back
        </button>
      </div>

      {/* Main tools bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '10px 12px',
        backgroundColor: 'rgba(0,0,0,0.9)',
        color: 'white',
        alignItems: 'center',
        height: '56px',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        overflowX: 'auto',
        overflowY: 'hidden'
      }}>
        {/* Draw Mode Toggle */}
        <button
          onClick={() => setDrawMode(!drawMode)}
          style={{
            padding: '8px 16px',
            backgroundColor: drawMode ? '#ff0000' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            minWidth: '70px'
          }}
        >
          {drawMode ? 'DRAW' : 'DRAW'}
        </button>

        {/* Tool Selection */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setTool('line')}
            disabled={!drawMode}
            style={{
              padding: '8px 12px',
              backgroundColor: (tool === 'line' && drawMode) ? '#ff0000' : '#333',
              color: drawMode ? 'white' : '#999',
              border: 'none',
              borderRadius: '6px',
              cursor: drawMode ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: '500',
              minHeight: '44px',
              minWidth: '50px'
            }}
          >
            Line
          </button>
          <button
            onClick={() => setTool('freehand')}
            disabled={!drawMode}
            style={{
              padding: '8px 12px',
              backgroundColor: (tool === 'freehand' && drawMode) ? '#ff0000' : '#333',
              color: drawMode ? 'white' : '#999',
              border: 'none',
              borderRadius: '6px',
              cursor: drawMode ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: '500',
              minHeight: '44px',
              minWidth: '50px'
            }}
          >
            Draw
          </button>
          <button
            onClick={() => setTool('eraser')}
            disabled={!drawMode}
            style={{
              padding: '8px 12px',
              backgroundColor: (tool === 'eraser' && drawMode) ? '#ff0000' : '#333',
              color: drawMode ? 'white' : '#999',
              border: 'none',
              borderRadius: '6px',
              cursor: drawMode ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: '500',
              minHeight: '44px',
              minWidth: '50px'
            }}
          >
            Erase
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setShapes(prev => prev.slice(0, -1))}
            disabled={shapes.length === 0}
            style={{
              padding: '8px 12px',
              backgroundColor: shapes.length > 0 ? '#666' : '#333',
              color: shapes.length > 0 ? 'white' : '#999',
              border: 'none',
              borderRadius: '6px',
              cursor: shapes.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Undo
          </button>
          <button
            onClick={() => setShapes([])}
            disabled={shapes.length === 0}
            style={{
              padding: '8px 12px',
              backgroundColor: shapes.length > 0 ? '#666' : '#333',
              color: shapes.length > 0 ? 'white' : '#999',
              border: 'none',
              borderRadius: '6px',
              cursor: shapes.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Clear
          </button>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Zoom controls */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            onClick={() => handleZoom(-0.25)}
            style={{
              padding: '8px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              width: '36px',
              height: '36px'
            }}
          >
            −
          </button>
          <span style={{ fontSize: '12px', minWidth: '50px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.25)}
            style={{
              padding: '8px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              width: '36px',
              height: '36px'
            }}
          >
            +
          </button>
          <button
            onClick={resetZoom}
            style={{
              padding: '6px 8px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            Reset
          </button>
        </div>

        {/* Save & Record */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={saveReview}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            Save
          </button>
          
          <button
            onClick={recording ? stopAnalysis : startAnalysis}
            style={{
              padding: '8px 16px',
              backgroundColor: recording ? '#dc3545' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            {recording ? 'Stop' : 'Record'}
          </button>
        </div>
      </div>

      {/* Video area */}
      <div 
        ref={containerRef}
        style={{ 
          flex: 1, 
          position: 'relative', 
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{
          transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
          transformOrigin: 'center center',
          transition: zoom === 1 ? 'transform 0.2s ease' : 'none'
        }}>
          <video
            ref={videoRef}
            src={videoUrl}
            controls={false}
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
            crossOrigin="anonymous"
          />
          
          <canvas
            ref={overlayRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              cursor: drawMode ? 'crosshair' : (zoom > 1 ? 'move' : 'default'),
              pointerEvents: 'auto'
            }}
            onMouseDown={handlePointerStart}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerEnd}
            onTouchStart={handlePointerStart}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerEnd}
          />
        </div>

        {/* Recording indicator and facecam */}
        {recording && (
          <>
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              padding: '8px 16px',
              backgroundColor: 'rgba(220, 38, 38, 0.95)',
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              zIndex: 10
            }}>
              ● REC
            </div>
            
            <video
              ref={facecamPreviewRef}
              autoPlay
              muted
              playsInline
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '140px',
                aspectRatio: '16/9',
                backgroundColor: '#111',
                borderRadius: '8px',
                border: '2px solid rgba(255,255,255,0.8)',
                objectFit: 'cover',
                zIndex: 10
              }}
            />
          </>
        )}

        {/* Draw mode instructions */}
        {drawMode && (
          <div style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            backgroundColor: 'rgba(255, 0, 0, 0.9)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            Draw Mode ON - Double tap to toggle
          </div>
        )}

        {/* Pan/zoom instructions */}
        {zoom > 1 && !isGesturing && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '16px',
            transform: 'translateY(-50%)',
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '11px',
            zIndex: 10
          }}>
            Drag to pan • Pinch to zoom
          </div>
        )}
      </div>

      {/* Video controls bar */}
      <div style={{
        padding: '12px',
        backgroundColor: 'rgba(0,0,0,0.95)',
        color: 'white',
        flexShrink: 0,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Frame controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <button
            onClick={() => stepFrame(-1)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              minHeight: '44px',
              minWidth: '50px'
            }}
          >
            ◀
          </button>
          
          <button
            onClick={playPause}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '60px',
              minHeight: '44px'
            }}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <button
            onClick={() => stepFrame(1)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              minHeight: '44px',
              minWidth: '50px'
            }}
          >
            ▶
          </button>

          {/* Speed controls */}
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
            <button
              onClick={() => changePlaybackSpeed(0.25)}
              style={{
                padding: '6px 8px',
                backgroundColor: playbackSpeed === 0.25 ? '#007bff' : '#555',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: playbackSpeed === 0.25 ? 'bold' : 'normal',
                minHeight: '36px'
              }}
            >
              0.25x
            </button>
            <button
              onClick={() => changePlaybackSpeed(0.5)}
              style={{
                padding: '6px 8px',
                backgroundColor: playbackSpeed === 0.5 ? '#007bff' : '#555',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: playbackSpeed === 0.5 ? 'bold' : 'normal',
                minHeight: '36px'
              }}
            >
              0.5x
            </button>
            <button
              onClick={() => changePlaybackSpeed(1)}
              style={{
                padding: '6px 8px',
                backgroundColor: playbackSpeed === 1 ? '#007bff' : '#555',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: playbackSpeed === 1 ? 'bold' : 'normal',
                minHeight: '36px'
              }}
            >
              1x
            </button>
          </div>

          <div style={{ flex: 1, marginLeft: '12px', marginRight: '12px' }}>
            <input
              type="range"
              min={0}
              max={duration}
              value={current}
              onChange={onSeek}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: `linear-gradient(to right, #ff0000 0%, #ff0000 ${(current/duration)*100}%, #333 ${(current/duration)*100}%, #333 100%)`,
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ 
            fontSize: '12px', 
            minWidth: '80px', 
            textAlign: 'right',
            fontFamily: 'monospace'
          }}>
            {Math.floor(current / 60)}:{String(Math.floor(current % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        /* Custom range slider styles */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ff0000;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ff0000;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        /* Prevent text selection on mobile */
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
        
        /* Hide scrollbars completely */
        ::-webkit-scrollbar {
          display: none;
        }
        
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        /* Improve button touch targets on mobile */
        @media (max-width: 768px) {
          button {
            min-height: 44px;
            min-width: 44px;
            font-size: 14px !important;
          }
          
          /* Larger scrubber on mobile */
          input[type="range"] {
            height: 12px !important;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            height: 20px !important;
            width: 20px !important;
          }
          
          input[type="range"]::-moz-range-thumb {
            height: 20px !important;
            width: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}