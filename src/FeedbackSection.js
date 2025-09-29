// src/FeedbackSection.js
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

export default function FeedbackSection({ videoId }) {
  const [user] = useAuthState(auth);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      const videoRef = doc(db, "videos", videoId);
      const videoSnap = await getDoc(videoRef);
      if (videoSnap.exists()) {
        const data = videoSnap.data();
        setFeedbackList(data.feedback || []);
      }
    };
    fetchFeedback();
  }, [videoId]);

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;
    const videoRef = doc(db, "videos", videoId);
    await updateDoc(videoRef, {
      feedback: arrayUnion({
        coachId: user.uid,
        comment: feedbackText.trim(),
        timestamp: new Date(),
      }),
    });
    setFeedbackText("");
    const updatedSnap = await getDoc(videoRef);
    setFeedbackList(updatedSnap.data().feedback || []);
  };

  return (
    <div>
      <h4>Coach Feedback</h4>
      {feedbackList.map((f, index) => (
        <p key={index}><strong>{f.coachId}:</strong> {f.comment}</p>
      ))}
      {user && (
        <div>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={3}
            placeholder="Leave feedback..."
          />
          <br />
          <button onClick={submitFeedback}>Submit Feedback</button>
        </div>
      )}
    </div>
  );
}
