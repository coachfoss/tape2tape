import React, { useState, useEffect } from "react";
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
} from "firebase/firestore";

export default function VideoUpload() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState("");
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchUserRole = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      setRole(snap.exists() ? snap.data().role : "client");
    };
    const fetchCoaches = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      setCoaches(
        snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.role === "coach")
      );
    };
    fetchUserRole();
    fetchCoaches();
  }, [user]);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setVideo(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!video || !user || (role === "client" && !selectedCoach)) {
      alert("Pick a video and, if you are a client, select a coach.");
      return;
    }

    const filePath = `videos/${Date.now()}-${video.name}`;
    const storageRef = ref(storage, filePath);

    const uploadTask = uploadBytesResumable(storageRef, video, {
      contentType: video.type,
    });

    uploadTask.on(
      "state_changed",
      (s) =>
        setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      (err) => alert("Upload failed: " + err.message),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const payload = {
          name: video.name,
          url: downloadURL,
          createdAt: serverTimestamp(),
          clientId: user.uid,
          coachId: role === "client" ? selectedCoach : user.uid,
          uploaderRole: role || "client",
        };
        console.log("📝 adding video doc:", payload);
        await addDoc(collection(db, "videos"), payload);
        setUrl(downloadURL);
        alert("✅ Upload successful");
      }
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload a Video</h2>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed #aaa",
          padding: 20,
          marginBottom: 10,
          borderRadius: 8,
        }}
      >
        Drag and drop video here
      </div>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideo(e.target.files[0])}
      />
      {role === "client" && (
        <select
          value={selectedCoach}
          onChange={(e) => setSelectedCoach(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          <option value="">Select Coach</option>
          {coaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.displayName || c.email}
            </option>
          ))}
        </select>
      )}
      <button onClick={handleUpload} style={{ marginLeft: 8 }}>
        Upload
      </button>
      {progress > 0 && <p>Progress: {progress}%</p>}
      {url && <video src={url} controls width="300" />}
    </div>
  );
}
