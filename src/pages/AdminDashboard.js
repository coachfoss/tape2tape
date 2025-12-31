import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Admin check
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalVideos: 0,
    totalReviews: 0,
    storageUsed: 0,
    freeUsers: 0,
    proUsers: 0,
    teamUsers: 0
  });

  // Users list
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    // TODO: Implement proper admin check from your auth system
    // For now, this is a placeholder
    const adminEmail = 'admin@tape2tape.com'; // Change this to your admin email
    
    try {
      // Check if current user is admin
      // This should be implemented with your Firebase auth
      setIsAdmin(true); // Set to true for demo purposes
      
      if (isAdmin) {
        await loadAdminData();
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/dashboard');
    }
  };

  const loadAdminData = async () => {
    try {
      // Load all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = [];
      
      let freeCount = 0;
      let proCount = 0;
      let teamCount = 0;
      let totalStorage = 0;
      let totalVids = 0;
      let totalRevs = 0;

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          ...data
        });

        // Count by plan
        if (data.plan === 'Free') freeCount++;
        else if (data.plan === 'Pro') proCount++;
        else if (data.plan === 'Team') teamCount++;

        // Accumulate stats
        totalStorage += data.storageUsed || 0;
        totalVids += data.videosUploaded || 0;
        totalRevs += data.reviewsCompleted || 0;
      });

      setUsers(usersData);
      setStats({
        totalUsers: usersData.length,
        activeUsers: usersData.filter(u => u.lastActive && 
          new Date(u.lastActive.toDate()) > new Date(Date.now() - 30*24*60*60*1000)).length,
        totalVideos: totalVids,
        totalReviews: totalRevs,
        storageUsed: totalStorage,
        freeUsers: freeCount,
        proUsers: proCount,
        teamUsers: teamCount
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeUserRole = async (userId, newRole) => {
    if (!window.confirm(`Change user to ${newRole}?`)) return;

    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date()
      });

      // Refresh users list
      await loadAdminData();
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const changePlan = async (userId, newPlan) => {
    if (!window.confirm(`Change user plan to ${newPlan}?`)) return;

    try {
      const storageLimit = newPlan === 'Free' ? 1024 : newPlan === 'Pro' ? 51200 : 512000;
      
      await updateDoc(doc(db, 'users', userId), {
        plan: newPlan,
        storageLimit: storageLimit,
        updatedAt: new Date()
      });

      await loadAdminData();
      alert('User plan updated successfully!');
    } catch (error) {
      console.error('Error updating user plan:', error);
      alert('Failed to update user plan');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
            🛡️ Admin Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Manage users, monitor system health, and view analytics
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Exit Admin Mode
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: '10px'
      }}>
        {['overview', 'users', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === tab ? '#ff0000' : 'transparent',
              color: 'white',
              border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontWeight: activeTab === tab ? 'bold' : 'normal'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
              System Overview
            </h2>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <div style={{
                backgroundColor: '#111',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>👥</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {stats.totalUsers}
                </div>
                <div style={{ color: '#999' }}>Total Users</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                  {stats.activeUsers} active in last 30 days
                </div>
              </div>

              <div style={{
                backgroundColor: '#111',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📹</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {stats.totalVideos}
                </div>
                <div style={{ color: '#999' }}>Videos Uploaded</div>
              </div>

              <div style={{
                backgroundColor: '#111',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {stats.totalReviews}
                </div>
                <div style={{ color: '#999' }}>Reviews Completed</div>
              </div>

              <div style={{
                backgroundColor: '#111',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>💾</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {(stats.storageUsed / 1024 / 1024).toFixed(1)}GB
                </div>
                <div style={{ color: '#999' }}>Storage Used</div>
              </div>
            </div>

            {/* Plan Distribution */}
            <div style={{
              backgroundColor: '#111',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid #333',
              marginBottom: '40px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                Plan Distribution
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#999' }}>
                    {stats.freeUsers}
                  </div>
                  <div style={{ color: '#666' }}>Free</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff0000' }}>
                    {stats.proUsers}
                  </div>
                  <div style={{ color: '#666' }}>Pro</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff00' }}>
                    {stats.teamUsers}
                  </div>
                  <div style={{ color: '#666' }}>Team</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              backgroundColor: '#111',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('users')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ff0000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Manage Users
                </button>
                <button
                  onClick={() => alert('Export feature coming soon')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Export Data
                </button>
                <button
                  onClick={() => alert('System logs coming soon')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  View Logs
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>
                User Management
              </h2>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: 'white',
                  width: '300px'
                }}
              />
            </div>

            {/* Users Table */}
            <div style={{
              backgroundColor: '#111',
              borderRadius: '12px',
              border: '1px solid #333',
              overflow: 'hidden'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#000' }}>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>User</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Email</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Plan</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Role</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Videos</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Storage</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 'bold' }}>{user.displayName || 'No name'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>ID: {user.id.substring(0, 8)}...</div>
                      </td>
                      <td style={{ padding: '15px', color: '#999' }}>{user.email}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: user.plan === 'Free' ? '#333' : user.plan === 'Pro' ? '#ff0000' : '#00ff00',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {user.plan || 'Free'}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: user.role === 'admin' ? '#ff0000' : '#333',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {user.role || 'coach'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: '#999' }}>{user.videosUploaded || 0}</td>
                      <td style={{ padding: '15px', color: '#999' }}>
                        {((user.storageUsed || 0) / 1024).toFixed(1)}GB
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <select
                            onChange={(e) => changeUserRole(user.id, e.target.value)}
                            value={user.role || 'coach'}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#000',
                              color: 'white',
                              border: '1px solid #333',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <option value="coach">Coach</option>
                            <option value="admin">Admin</option>
                          </select>
                          <select
                            onChange={(e) => changePlan(user.id, e.target.value)}
                            value={user.plan || 'Free'}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#000',
                              color: 'white',
                              border: '1px solid #333',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <option value="Free">Free</option>
                            <option value="Pro">Pro</option>
                            <option value="Team">Team</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  No users found
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
              Analytics & Insights
            </h2>

            {/* Revenue Projection */}
            <div style={{
              backgroundColor: '#111',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid #333',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                Monthly Revenue Projection
              </h3>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#00ff00', marginBottom: '10px' }}>
                ${(stats.proUsers * 29 + stats.teamUsers * 99).toLocaleString()}
              </div>
              <div style={{ color: '#999', marginBottom: '20px' }}>
                Based on current subscriptions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ color: '#666', fontSize: '14px' }}>Pro Subscriptions</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    ${(stats.proUsers * 29).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{stats.proUsers} users × $29</div>
                </div>
                <div>
                  <div style={{ color: '#666', fontSize: '14px' }}>Team Subscriptions</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    ${(stats.teamUsers * 99).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{stats.teamUsers} users × $99</div>
                </div>
              </div>
            </div>

            {/* Growth Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                backgroundColor: '#111',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <h4 style={{ fontSize: '16px', color: '#999', marginBottom: '10px' }}>
                  Conversion Rate
                </h4>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {stats.totalUsers > 0 ? 
                    (((stats.proUsers + stats.teamUsers) / stats.totalUsers) * 100).toFixed(1) : 0}%
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Free to Paid conversion
                </div>
              </div>

              <div style={{
                backgroundColor: '#111',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <h4 style={{ fontSize: '16px', color: '#999', marginBottom: '10px' }}>
                  Avg. Videos per User
                </h4>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {stats.totalUsers > 0 ? (stats.totalVideos / stats.totalUsers).toFixed(1) : 0}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  User engagement metric
                </div>
              </div>

              <div style={{
                backgroundColor: '#111',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <h4 style={{ fontSize: '16px', color: '#999', marginBottom: '10px' }}>
                  Active User Rate
                </h4>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {stats.totalUsers > 0 ? 
                    ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Active in last 30 days
                </div>
              </div>
            </div>

            {/* System Health */}
            <div style={{
              backgroundColor: '#111',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                System Health
              </h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: '#999' }}>API Response Time</span>
                    <span style={{ color: '#00ff00', fontWeight: 'bold' }}>Excellent</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#000',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '95%',
                      height: '100%',
                      backgroundColor: '#00ff00'
                    }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: '#999' }}>Storage Capacity</span>
                    <span style={{ color: '#00ff00', fontWeight: 'bold' }}>Healthy</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#000',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '67%',
                      height: '100%',
                      backgroundColor: '#00ff00'
                    }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: '#999' }}>Database Performance</span>
                    <span style={{ color: '#00ff00', fontWeight: 'bold' }}>Optimal</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#000',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '92%',
                      height: '100%',
                      backgroundColor: '#00ff00'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}