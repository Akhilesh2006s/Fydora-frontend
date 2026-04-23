"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GoogleSignInButton from "./GoogleSignInButton";
import { apiPost } from "../lib/api";
import loginVisual from "../../Login.png";

const inputClass = "w-full rounded-lg border border-[#e3d8ca] bg-[#fffefc] px-3 py-2.5 text-sm text-[#3b2b1f] outline-none transition placeholder:text-[#a2907d] focus:border-[#8a5a3b] focus:ring-2 focus:ring-[#8a5a3b]/15";

export default function LandingAuth() {
  const router = useRouter();
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });
  const [adminStatus, setAdminStatus] = useState("");

  async function handleAdminLogin(e) {
    e.preventDefault();
    try {
      const res = await apiPost("/auth/admin/login", adminForm);
      localStorage.setItem("ff_admin_token", res.token);
      router.push("/admin");
    } catch (_error) {
      setAdminStatus("Invalid admin credentials.");
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#fffefb] to-[#fffdf7] px-3 py-4 sm:px-6 sm:py-6 md:py-10">
      <div className="mx-auto grid min-h-[84vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-[#ece4d8] bg-[#fffdf8] shadow-[0_24px_50px_rgba(66,47,24,0.12)] lg:grid-cols-2">
        <div className="relative hidden bg-[#2a190f] lg:block">
          <Image src={loginVisual} alt="FYDORA FORGE lifestyle visual" fill className="object-contain" priority />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1e1108]/55 via-transparent to-[#1e1108]/20" />
        </div>

        <div className="flex items-center bg-[#fffdf9] px-4 py-7 sm:px-8 sm:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-md">
            <p className="text-center text-3xl font-semibold tracking-tight text-[#2f2116] sm:text-4xl">Welcome Back</p>
            <p className="mt-2.5 text-center text-sm text-[#7a6856] sm:mt-3 sm:text-base">Sign in to continue to FYDORA FORGE</p>

            <form onSubmit={handleAdminLogin} className="mt-8 space-y-3">
              <input
                className={inputClass}
                placeholder="Enter your email"
                value={adminForm.email}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <input
                className={inputClass}
                type="password"
                placeholder="Enter your password"
                value={adminForm.password}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              <button type="submit" className="w-full rounded-lg bg-[#6d3d20] py-2.5 text-sm font-semibold text-white transition hover:bg-[#5a3219]">
                Login with Email
              </button>
              {adminStatus && <p className="text-sm text-[#c63d35]">{adminStatus}</p>}
            </form>

            <div className="my-5 flex items-center gap-3 text-sm text-[#a0907f]">
              <span className="h-px flex-1 bg-[#e4d8c8]" />
              <span>OR</span>
              <span className="h-px flex-1 bg-[#e4d8c8]" />
            </div>

            <GoogleSignInButton
              onSuccess={() => router.push("/shop")}
              buttonClassName="w-full rounded-lg border border-[#e0d6c8] bg-white px-4 py-2.5 text-sm font-semibold text-[#3b2b1f] hover:bg-[#faf6f1]"
              statusClassName="mt-2 text-sm text-[#6f5d4d]"
            />

          </div>
        </div>
      </div>
    </section>
  );
}
