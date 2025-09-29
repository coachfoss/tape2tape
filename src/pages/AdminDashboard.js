// src/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  addDoc
} from "firebase/firestore";

// Create notification function (inline to avoid import issues)
const createNotification = async (userId, type, message, videoId = null) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      message,
      videoId,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

export default function AdminDashboard() {
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAdminData = async () => {
      try {
        // Check if user is admin
        const userDoc = await getDocs(
          query(collection(db, "users"), where("email", "==", user.email))
        );
        
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setUserRole(userData.role);
          
          if (userData.role !== "admin") {
            return; // Not an admin, don't load admin data
          }
        }

        // Load all users
        const usersSnapshot = await getDocs(
          query(collection(db, "users"), orderBy("createdAt", "desc"))
        );
        setUsers(
          usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );

        // Load all videos
        const videosSnapshot = await getDocs(
          query(collection(db, "videos"), orderBy("createdAt", "desc"))
        );
        setVideos(
          videosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );

        // Load all notifications
        const notificationsSnapshot = await getDocs(
          query(collection(db, "notifications"), orderBy("createdAt", "desc"))
        );
        setNotifications(
          notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );

      } catch (error) {
        console.error("Error loading admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );

      // Notify the user about role change
      await createNotification(
        userId,
        "role_change",
        `Your role has been updated to ${newRole}`,
        null
      );

      alert("User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    }
  };

  const updateSubscriptionStatus = async (userId, newStatus) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        subscriptionStatus: newStatus,
        updatedAt: serverTimestamp(),
      });

      setUsers(prevUsers =>
        prevUsers.map(u => 
          u.id === userId ? { ...u, subscriptionStatus: newStatus } : u
        )
      );

      await createNotification(
        userId,
        "subscription_change",
        `Your subscription status has been updated to ${newStatus}`,
        null
      );

      alert("Subscription status updated successfully");
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Failed to update subscription status");
    }
  };

  const deleteVideo = async (videoId, videoName) => {
    if (!window.confirm(`Are you sure you want to delete "${videoName}"?`)) return;

    try {
      await deleteDoc(doc(db, "videos", videoId));
      setVideos(prevVideos => prevVideos.filter(v => v.id !== videoId));
      alert("Video deleted successfully");
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video");
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user "${userEmail}"?`)) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const sendBulkNotification = async () => {
    const message = window.prompt("Enter notification message:");
    if (!message) return;

    const targetRole = window.prompt("Send to which role? (all/client/coach):");
    if (!targetRole) return;

    try {
      let targetUsers = users;
      if (targetRole !== "all") {
        targetUsers = users.filter(u => u.role === targetRole);
      }

      const promises = targetUsers.map(u =>
        createNotification(u.id, "admin_announcement", message, null)
      );

      await Promise.all(promises);
      alert(`Notification sent to ${targetUsers.length} users`);
    } catch (error) {
      console.error("Error sending bulk notification:", error);
      alert("Failed to send notifications");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading admin dashboard...</div>;
  if (userRole !== "admin") {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  const tabStyle = (tabName) => ({
    padding: "12px 24px",
    border: "none",
    backgroundColor: activeTab === tabName ? "#007bff" : "#f8f9fa",
    color: activeTab === tabName ? "white" : "#333",
    cursor: "pointer",
    marginRight: "4px",
    borderRadius: "8px 8px 0 0"
  });

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>Admin Dashboard</h2>
        <button
          onClick={sendBulkNotification}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Send Bulk Notification
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: 20 }}>
        <button
          style={tabStyle("users")}
          onClick={() => setActiveTab("users")}
        >
          Users ({users.length})
        </button>
        <button
          style={tabStyle("videos")}
          onClick={() => setActiveTab("videos")}
        >
          Videos ({videos.length})
        </button>
        <button
          style={tabStyle("analytics")}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ border: "1px solid #ddd", borderRadius: "0 8px 8px 8px", padding: 20 }}>
        
        {activeTab === "users" && (
          <div>
            <h3>User Management</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Email</th>
                    <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Name</th>
                    <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Role</th>
                    <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Subscription</th>
                    <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>{u.email}</td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>{u.displayName || "-"}</td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        <select
                          value={u.role || "client"}
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                          style={{ padding: "4px 8px" }}
                        >
                          <option value="client">Client</option>
                          <option value="coach">Coach</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        {u.role === "coach" ? (
                          <select
                            value={u.subscriptionStatus || "inactive"}
                            onChange={(e) => updateSubscriptionStatus(u.id, e.target.value)}
                            style={{ padding: "4px 8px" }}
                          >
                            <option value="inactive">Inactive</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="trial">Trial</option>
                          </select>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        <button
                          onClick={() => deleteUser(u.id, u.email)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "videos" && (
          <div>
            <h3>Video Management</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Name</th>
                    <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Client</th>
                    <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Coach</th>
                    <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Created</th>
                    <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map(v => (
                    <tr key={v.id}>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>{v.name}</td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        {users.find(u => u.id === v.clientId)?.email || "Unknown"}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        {users.find(u => u.id === v.coachId)?.email || "Unassigned"}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        {v.createdAt?.toDate ? v.createdAt.toDate().toLocaleDateString() : "N/A"}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        <span style={{
                          padding: "2px 8px",
                          backgroundColor: v.reviewed ? "#d4edda" : "#fff3cd",
                          color: v.reviewed ? "#155724" : "#856404",
                          borderRadius: "4px",
                          fontSize: "12px"
                        }}>
                          {v.reviewed ? "Reviewed" : "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        <button
                          onClick={() => deleteVideo(v.id, v.name)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <h3>Platform Analytics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              <div style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#007bff" }}>Total Users</h4>
                <div style={{ fontSize: "32px", fontWeight: "bold" }}>{users.length}</div>
              </div>
              
              <div style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#28a745" }}>Active Coaches</h4>
                <div style={{ fontSize: "32px", fontWeight: "bold" }}>
                  {users.filter(u => u.role === "coach" && u.subscriptionStatus === "active").length}
                </div>
              </div>
              
              <div style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#ffc107" }}>Total Videos</h4>
                <div style={{ fontSize: "32px", fontWeight: "bold" }}>{videos.length}</div>
              </div>
              
              <div style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#dc3545" }}>Pending Reviews</h4>
                <div style={{ fontSize: "32px", fontWeight: "bold" }}>
                  {videos.filter(v => !v.reviewed).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}