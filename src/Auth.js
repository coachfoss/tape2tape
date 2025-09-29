import React from "react";
import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Auth() {
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h2>Video Review App</h2>
      <button onClick={signInWithGoogle}>Login with Google</button>
    </div>
  );
}
