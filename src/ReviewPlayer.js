// src/ReviewPlayer.js
import React, { useEffect, useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import { useParams } from "react-router-dom";
import { db, storage } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";

export default function ReviewPlayer() {
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [drawingData, setDrawingData] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const videoDoc = await getDoc(doc(db, "videos", videoId));
        if (!videoDoc.exists()) {
          console.warn("Video not found in Firestore");
          return;
        }

        const videoInfo = videoDoc.data();
        setVideoData(videoInfo);

        const reviewFolderRef = ref(storage, `reviews/${videoId}`);
        const items = await listAll(reviewFolderRef);
        
        // ✅ CORRECT .find() syntax (implicit return)
        const drawingFile = items.items.find(item => item.name === "drawing.json");

        if (drawingFile) {
          const drawUrl = await getDownloadURL(drawingFile);
          const res = await fetch(drawUrl);
          const drawJson = await res.text();
          setDrawingData(drawJson);
        } else {
          console.log("✅ No drawing found for this review (not an error)");
        }
      } catch (err) {
        console.error("❌ Error loading review:", err);
      }
    };

    fetchReview();
  }, [videoId]);

  if (!videoData) return <p>Loading review...</p>;

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Review Viewer</h2>
      <div style={{ position: "relative", width: "640px", height: "360px", margin: "0 auto" }}>
        <video
          src={videoData.url}
          width="640"
          height="360"
          controls
          style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
        />
        {drawingData && (
          <CanvasDraw
            ref={canvasRef}
            canvasWidth={640}
            canvasHeight={360}
            hideGrid
            disabled
            saveData={drawingData}
            immediateLoading
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 2,
              pointerEvents: "none",
              backgroundColor: "transparent"
            }}
          />
        )}
      </div>
    </div>
  );
}
