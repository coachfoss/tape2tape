import React, { useEffect, useMemo, useState } from "react";
import { db, auth, storage } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { listAll, ref } from "firebase/storage";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [videos, setVideos] = useState([]);
  const [fallbackVideos, setFallbackVideos] = useState([]);
  const [reviewIndex, setReviewIndex] = useState({});
  const [debug, setDebug] = useState(false);
  const navigate = useNavigate();

  // Load user role
  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      const r = snap.exists() ? snap.data().role || "client" : "client";
      setRole(r);
      console.log("🔑 role:", r);
    })();
  }, [user]);

  // Load videos (filtered + fallback)
  useEffect(() => {
    if (!user || !role) return;
    (async () => {
      let qMain;
      if (role === "coach") {
        qMain = query(
          collection(db, "videos"),
          where("coachId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
      } else if (role === "client") {
        qMain = query(
          collection(db, "videos"),
          where("clientId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
      } else {
        qMain = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      }
      const snap = await getDocs(qMain);
      const vids = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVideos(vids);
      console.log("🎯 filtered videos:", vids);

      if (vids.length === 0) {
        const snapAll = await getDocs(
          query(collection(db, "videos"), orderBy("createdAt", "desc"), limit(20))
        );
        const all = snapAll.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFallbackVideos(all);
        console.log("🧪 fallback videos (unfiltered):", all);
      } else {
        setFallbackVideos([]);
      }
    })();
  }, [user, role]);

  // Build review index: mark ready when annotation JSON OR analysis is present
  useEffect(() => {
    (async () => {
      try {
        const folderRef = ref(storage, "reviews");
        const all = await listAll(folderRef);
        const idx = {};
        for (const item of all.items) {
          const n = item.name.toLowerCase();
          const baseFor = (suffix) => n.endsWith(suffix) && n.slice(0, -suffix.length);
          const jsonBase = baseFor("-review.json");
          const voiceBase = baseFor("-voice.webm") || baseFor("-voice.mp3");
          const analysisBase = baseFor("-analysis.webm");
          if (jsonBase) {
            if (!idx[jsonBase]) idx[jsonBase] = {};
            idx[jsonBase].drawing = true;
          }
          if (voiceBase) {
            if (!idx[voiceBase]) idx[voiceBase] = {};
            idx[voiceBase].voice = true;
          }
          if (analysisBase) {
            if (!idx[analysisBase]) idx[analysisBase] = {};
            idx[analysisBase].analysis = true;
          }
        }
        setReviewIndex(idx);
        console.log("🗂️ review index:", idx);
      } catch (e) {
        console.error("review index failed", e);
        setReviewIndex({});
      }
    })();
  }, []);

  const rows = useMemo(() => {
    return videos.map((v) => {
      const base = (v.name || "").toLowerCase().replace(/\.mp4$/i, "");
      const ri = reviewIndex[base] || {};
      const hasReview = !!(ri.drawing || ri.analysis); // either is enough
      return { ...v, hasReview };
    });
  }, [videos, reviewIndex]);

  if (!user) return <p style={{ padding: 20 }}>Please log in.</p>;

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <h2>Dashboard</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/upload">Upload</Link>
          <button onClick={() => signOut(auth)}>Logout</button>
        </div>
      </div>

      <p style={{ marginTop: -8, color: "#666" }}>
        Signed in as <strong>{user.email}</strong> — role:{" "}
        <strong>{role || "…"}</strong>
      </p>

      {rows.length === 0 && (
        <div
          style={{
            padding: 12,
            background: "#fff6e6",
            border: "1px solid #f0d8a8",
            borderRadius: 8,
            margin: "12px 0",
          }}
        >
          <strong>No videos yet.</strong>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => setDebug((d) => !d)}>
              {debug ? "Hide" : "Show"} debug
            </button>
          </div>
          {debug && (
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <p>
                <strong>Fallback (latest 20, unfiltered):</strong>
              </p>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(fallbackVideos, null, 2)}
              </pre>
              <p style={{ marginTop: 8, color: "#333" }}>
                If fallback shows docs but filtered list is empty, your{" "}
                <code>clientId/coachId</code> may not match your current user,
                or uploads didn't set them properly.
              </p>
            </div>
          )}
        </div>
      )}

      {rows.map((v) => (
        <div
          key={v.id}
          style={{
            marginBottom: 20,
            borderBottom: "1px solid #eee",
            paddingBottom: 12,
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>{v.name || "Untitled"}</strong>
          </p>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            {role === "coach" && (
              <button
                onClick={() => navigate("/editor", { state: { videoId: v.id } })}
              >
                Open Editor
              </button>
            )}
            <button
              onClick={() => navigate("/review", { state: { videoId: v.id } })}
              disabled={!v.hasReview}
              title={
                v.hasReview
                  ? "Open the published review"
                  : "Coach has not published a review yet"
              }
            >
              {v.hasReview ? "View Review" : "Review Not Ready"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
