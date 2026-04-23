"use client";

import { useEffect, useState } from "react";
import GoogleSignInButton from "./GoogleSignInButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function UserAuthGate({ title, description, children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("ff_user_token");
    if (!token) {
      setLoading(false);
      return;
    }
    setUserToken(token);

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.role === "USER" && data.profile) {
          setUser(data.profile);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <section className="card p-6 text-sm text-[#8d7966]">Loading...</section>;
  }

  if (!user) {
    return (
      <section className="card p-6">
        <h1 className="text-2xl font-semibold text-[#2f241b]">{title}</h1>
        <p className="mt-2 text-sm text-[#8d7966]">{description}</p>
        <div className="mt-4">
          <GoogleSignInButton buttonClassName="rounded-lg border border-[#decfbb] bg-white px-4 py-2 text-sm font-semibold text-[#3f2d1f] hover:bg-[#faf6f1]" />
        </div>
      </section>
    );
  }

  return children(user, userToken);
}
