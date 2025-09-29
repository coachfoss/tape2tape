// src/Profile.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Profile() {
  const [user, loadingUser] = useAuthState(auth);
  const [profile, setProfile] = useState({
    displayName: "",
    phoneNumber: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching profile for user:", user.uid);
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        console.log("Document snapshot:", docSnap);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Profile data found:", data);

          setProfile({
            displayName: data.displayName || user.displayName || "",
            phoneNumber: data.phoneNumber || "",
            bio: data.bio || "",
          });
        } else {
          console.log("No profile found. Creating default profile...");
          await setDoc(userRef, {
            email: user.email,
            role: "client",
            displayName: user.displayName || "",
            phoneNumber: "",
            bio: "",
            createdAt: new Date(),
          });

          setProfile({
            displayName: user.displayName || "",
            phoneNumber: "",
            bio: "",
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const userRef = doc(db, "users", user.uid);
      console.log("Saving profile data:", profile);

      await setDoc(
        userRef,
        {
          displayName: profile.displayName || "",
          phoneNumber: profile.phoneNumber || "",
          bio: profile.bio || "",
          updatedAt: new Date(),
        },
        { merge: true } // ✅ Create or update the doc
      );

      alert("Profile saved!");
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingUser || loading) return <div>Loading profile...</div>;

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Your Profile</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <label>
        Name:
        <input
          name="displayName"
          value={profile.displayName}
          onChange={handleChange}
          disabled={saving}
        />
      </label>
      <br />

      <label>
        Phone:
        <input
          name="phoneNumber"
          value={profile.phoneNumber}
          onChange={handleChange}
          disabled={saving}
        />
      </label>
      <br />

      <label>
        Bio:
        <textarea
          name="bio"
          value={profile.bio}
          onChange={handleChange}
          disabled={saving}
          rows={4}
        />
      </label>
      <br />

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
