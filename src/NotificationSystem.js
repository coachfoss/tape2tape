// src/NotificationSystem.js - Enhanced version
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

export default function NotificationSystem() {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return unsubscribe;
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.videoId) {
      if (notification.type === "new_video") {
        navigate("/editor", { state: { videoId: notification.videoId } });
      } else if (notification.type === "review_completed") {
        navigate("/review", { state: { videoId: notification.videoId } });
      }
    }

    setShowDropdown(false);
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      const promises = unreadNotifs.map(n => 
        updateDoc(doc(db, "notifications", n.id), {
          read: true,
          readAt: serverTimestamp()
        })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!user) return null;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="notification-bell"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--primary-color)",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)" }}>
              No notifications yet
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`notification-item ${notification.read ? '' : 'unread'}`}
              >
                <div style={{ fontSize: "14px", marginBottom: "4px", fontWeight: notification.read ? "normal" : "500" }}>
                  {notification.message}
                </div>
                <div className="notification-time">
                  {formatTime(notification.createdAt)}
                  {notification.videoId && (
                    <span style={{ marginLeft: "8px", color: "var(--primary-color)" }}>
                      • Click to view
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Enhanced notification creation with better messaging
export const createNotification = async (userId, type, message, videoId = null, extraData = {}) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      message,
      videoId,
      read: false,
      createdAt: serverTimestamp(),
      ...extraData
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Enhanced notification for review completion with client notification
export const notifyReviewCompleted = async (videoId) => {
  try {
    // Get video data to find client
    const videoDoc = await getDoc(doc(db, "videos", videoId));
    if (!videoDoc.exists()) return;
    
    const videoData = videoDoc.data();
    const clientId = videoData.clientId;
    const videoName = videoData.name || "your video";
    
    // Get coach info
    const coachDoc = await getDoc(doc(db, "users", videoData.coachId));
    const coachName = coachDoc.exists() ? 
      (coachDoc.data().displayName || coachDoc.data().email) : "Your coach";
    
    // Notify client that review is complete
    await createNotification(
      clientId,
      "review_completed",
      `${coachName} has completed your review for "${videoName}"`,
      videoId,
      { coachId: videoData.coachId }
    );
    
    console.log("Review completion notification sent to client");
  } catch (error) {
    console.error("Error sending review completion notification:", error);
  }
};