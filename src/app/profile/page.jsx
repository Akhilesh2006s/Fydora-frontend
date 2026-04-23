"use client";

import UserAuthGate from "../../components/UserAuthGate";

export default function ProfilePage() {
  return (
    <UserAuthGate title="Profile" description="Sign in with Google to access profile, cart, and wishlist.">
      {(user) => (
        <section className="myntra-container space-y-6 py-8">
          <div className="rounded-2xl border border-[#dfe6f4] bg-gradient-to-r from-[#f7faff] to-[#eef4ff] p-6 shadow-[0_16px_36px_rgba(20,40,90,0.1)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6078ad]">User Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold text-[#1f2b49]">Welcome back, {user.name}</h1>
            <p className="mt-1 text-sm text-[#67799f]">Manage your account, track activity, and continue your shopping journey.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <article className="rounded-2xl border border-[#e3e8f5] bg-white p-5 shadow-[0_12px_28px_rgba(20,40,90,0.07)]">
              <img src={user.picture || "https://placehold.co/220x220?text=User"} alt={user.name} className="h-28 w-28 rounded-full border border-[#e7ecf6] object-cover" />
              <h2 className="mt-4 text-xl font-bold text-[#1f2b49]">{user.name}</h2>
              <p className="text-sm text-[#7083ad]">{user.email}</p>
              <div className="mt-4 space-y-2 text-xs text-[#5f729a]">
                <p>UID: {user.uid || "Google linked"}</p>
                <p>Status: Active user</p>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard title="Saved Items" value="Wishlist Ready" />
              <MetricCard title="Shopping Bag" value="Cart Synced" />
              <MetricCard title="Account Security" value="Google OAuth" />
              <MetricCard title="Membership" value="Premium User" />
            </div>
          </div>
        </section>
      )}
    </UserAuthGate>
  );
}

function MetricCard({ title, value }) {
  return (
    <article className="rounded-2xl border border-[#e3e8f5] bg-white p-5 shadow-[0_12px_28px_rgba(20,40,90,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7286b1]">{title}</p>
      <h3 className="mt-2 text-lg font-bold text-[#1f2b49]">{value}</h3>
    </article>
  );
}
