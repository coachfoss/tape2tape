// src/UserDataManager.js
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "./firebase";
import { 
  doc, 
  getDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  writeBatch
} from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { useErrorToast } from "./ErrorBoundary";

export default function UserDataManager() {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState(null);
  const { showError, showInfo, ErrorToasts } = useErrorToast();

  const exportUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userData = {};
      
      // Get user profile
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        userData.profile = userDoc.data();
      }

      // Get user's videos
      const videosQuery = query(
        collection(db, "videos"),
        where("clientId", "==", user.uid)
      );
      const videosSnapshot = await getDocs(videosQuery);
      userData.videosAsClient = videosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get videos user coached
      const coachedVideosQuery = query(
        collection(db, "videos"),
        where("coachId", "==", user.uid)
      );
      const coachedVideosSnapshot = await getDocs(coachedVideosQuery);
      userData.videosAsCoach = coachedVideosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get notifications
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      userData.notifications = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Add export metadata
      userData.exportMetadata = {
        exportedAt: new Date().toISOString(),
        exportedBy: user.email,
        dataVersion: "1.0"
      };

      setExportData(userData);
      showInfo("Data export completed successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      showError("Failed to export data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadExportData = () => {
    if (!exportData) return;

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tape2tape-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const deleteAllUserData = async () => {
    if (!user) return;

    const confirmMessage = `This will permanently delete all your data including:
- Your profile and account information
- All uploaded videos and reviews
- All notifications and activity history

This action cannot be undone. Type "DELETE" to confirm:`;

    const confirmation = window.prompt(confirmMessage);
    if (confirmation !== "DELETE") {
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);

      // Delete user profile
      batch.delete(doc(db, "users", user.uid));

      // Get and delete user's videos
      const videosQuery = query(
        collection(db, "videos"),
        where("clientId", "==", user.uid)
      );
      const videosSnapshot = await getDocs(videosQuery);
      
      for (const videoDoc of videosSnapshot.docs) {
        batch.delete(videoDoc.ref);
        
        // Delete associated files from storage
        try {
          const videoData = videoDoc.data();
          if (videoData.url) {
            // Extract file path from URL and delete
            const urlParts = videoData.url.split('/');
            const fileName = urlParts[urlParts.length - 1].split('?')[0];
            await deleteObject(ref(storage, `videos/${fileName}`));
          }
        } catch (storageError) {
          console.warn("Error deleting video file:", storageError);
        }
      }

      // Get and delete coached videos (remove coach assignment)
      const coachedVideosQuery = query(
        collection(db, "videos"),
        where("coachId", "==", user.uid)
      );
      const coachedVideosSnapshot = await getDocs(coachedVideosQuery);
      
      for (const videoDoc of coachedVideosSnapshot.docs) {
        batch.update(videoDoc.ref, {
          coachId: null,
          reviewed: false
        });
      }

      // Delete notifications
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      
      for (const notificationDoc of notificationsSnapshot.docs) {
        batch.delete(notificationDoc.ref);
      }

      // Delete review files from storage
      try {
        const reviewsRef = ref(storage, 'reviews');
        const reviewsList = await listAll(reviewsRef);
        
        for (const item of reviewsList.items) {
          // Check if filename contains user ID or email
          if (item.name.includes(user.uid) || item.name.includes(user.email)) {
            await deleteObject(item);
          }
        }
      } catch (storageError) {
        console.warn("Error cleaning up review files:", storageError);
      }

      // Commit all deletions
      await batch.commit();

      // Sign out user
      await auth.signOut();

      alert("Your account and all associated data have been permanently deleted.");
      window.location.href = "/";
      
    } catch (error) {
      console.error("Error deleting user data:", error);
      showError("Failed to delete account. Please contact support for assistance.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <h3>Access Denied</h3>
          <p>You must be logged in to manage your data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <div>{ErrorToasts}</div>
      
      <div className="page-header">
        <h1 className="page-title">Data Management</h1>
        <p className="page-subtitle">
          Export or delete your personal data in compliance with privacy regulations
        </p>
      </div>

      {/* Data Export Section */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h3 className="card-title">Export Your Data</h3>
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Download a complete copy of your personal data including profile information, 
          videos, reviews, and activity history.
        </p>
        
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button 
            onClick={exportUserData}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Exporting..." : "Export Data"}
          </button>
          
          {exportData && (
            <button 
              onClick={downloadExportData}
              className="btn btn-success"
            >
              Download Export File
            </button>
          )}
        </div>

        {exportData && (
          <div style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "var(--background)",
            borderRadius: "8px",
            fontSize: "0.9rem"
          }}>
            <strong>Export Summary:</strong>
            <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
              <li>Profile data: {exportData.profile ? "Included" : "None"}</li>
              <li>Videos as client: {exportData.videosAsClient?.length || 0}</li>
              <li>Videos as coach: {exportData.videosAsCoach?.length || 0}</li>
              <li>Notifications: {exportData.notifications?.length || 0}</li>
            </ul>
            <small style={{ color: "var(--text-secondary)" }}>
              Exported on: {new Date(exportData.exportMetadata.exportedAt).toLocaleString()}
            </small>
          </div>
        )}
      </div>

      {/* Data Deletion Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ color: "var(--error-color)" }}>
            Delete Account
          </h3>
        </div>
        <div style={{
          padding: "1rem",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          marginBottom: "1.5rem"
        }}>
          <h4 style={{ color: "#dc2626", marginBottom: "0.5rem" }}>Warning: Irreversible Action</h4>
          <p style={{ color: "#7f1d1d", marginBottom: "0.5rem" }}>
            Deleting your account will permanently remove:
          </p>
          <ul style={{ color: "#7f1d1d", marginBottom: "0.5rem", paddingLeft: "1.5rem" }}>
            <li>Your profile and account information</li>
            <li>All uploaded videos and received reviews</li>
            <li>All coaching work and annotations</li>
            <li>Notification and activity history</li>
            <li>Subscription and payment history</li>
          </ul>
          <p style={{ color: "#7f1d1d", fontSize: "0.9rem" }}>
            This action cannot be undone. Consider exporting your data first.
          </p>
        </div>

        <button 
          onClick={deleteAllUserData}
          disabled={loading}
          className="btn btn-danger"
          style={{ width: "100%" }}
        >
          {loading ? "Deleting Account..." : "Delete My Account and All Data"}
        </button>
      </div>

      {/* Privacy Information */}
      <div style={{
        marginTop: "2rem",
        padding: "1rem",
        backgroundColor: "var(--background)",
        borderRadius: "8px",
        fontSize: "0.9rem",
        color: "var(--text-secondary)"
      }}>
        <h4>Your Privacy Rights</h4>
        <p>
          Under privacy regulations (GDPR, CCPA), you have the right to access, correct, 
          export, and delete your personal data. For questions about data processing or 
          to exercise additional rights, contact us at privacy@tape2tape.com.
        </p>
      </div>
    </div>
  );
}