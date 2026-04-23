"use client";

import { useState } from "react";
import { googleSignIn } from "../lib/firebase";
import { apiPost } from "../lib/api";

export default function GoogleSignInButton({ onSuccess, buttonClassName, statusClassName }) {
  const [status, setStatus] = useState("");

  async function handleGoogleSignIn() {
    try {
      const result = await googleSignIn();
      const user = result.user;
      const session = await apiPost("/auth/google/session", {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        picture: user.photoURL
      });
      localStorage.setItem("ff_user_token", session.token);
      setStatus("Signed in with Google.");
      if (onSuccess) onSuccess(session, user);
    } catch (_error) {
      setStatus("Google sign-in failed. Check Firebase config.");
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className={buttonClassName || "rounded-lg border border-[#decfbb] bg-white px-4 py-2 text-[#3f2d1f] hover:bg-[#faf6f1]"}
      >
        Continue with Google
      </button>
      {status && <p className={statusClassName || "text-sm opacity-80"}>{status}</p>}
    </div>
  );
}
