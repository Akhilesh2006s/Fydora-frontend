"use client";

import { useEffect, useState } from "react";
import UserAuthGate from "../../components/UserAuthGate";
import { apiGet } from "../../lib/api";

function OrdersContent({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      try {
        const data = await apiGet("/orders/mine", token);
        if (active) setOrders(Array.isArray(data) ? data : []);
      } catch (_error) {
        if (active) setError("Unable to load orders right now.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadOrders();
    return () => {
      active = false;
    };
  }, [token]);

  if (loading) {
    return <div className="card p-6 text-sm text-[#8d7966]">Loading your orders...</div>;
  }

  if (error) {
    return <div className="card p-6 text-sm text-[#b14c2f]">{error}</div>;
  }

  if (!orders.length) {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg font-semibold text-[#2f241b]">No orders yet</p>
        <p className="mt-2 text-sm text-[#8d7966]">Your placed orders will appear here with status and total.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article key={order._id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#2f241b]">Order #{order._id.slice(-6).toUpperCase()}</p>
            <span className="rounded-full bg-[#f6eee4] px-3 py-1 text-xs font-semibold text-[#6d3d20]">{order.status}</span>
          </div>
          <p className="mt-1 text-xs text-[#8d7966]">{new Date(order.createdAt).toLocaleString()}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-[#eadfce] bg-[#fffaf4] p-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#8d7966]">Items</p>
              <p className="mt-1 text-sm font-semibold text-[#2f241b]">{order.items?.length || 0}</p>
            </div>
            <div className="rounded-lg border border-[#eadfce] bg-[#fffaf4] p-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#8d7966]">Total</p>
              <p className="mt-1 text-sm font-semibold text-[#2f241b]">Rs. {Math.round(order.total || 0)}</p>
            </div>
            <div className="rounded-lg border border-[#eadfce] bg-[#fffaf4] p-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#8d7966]">Coupon</p>
              <p className="mt-1 text-sm font-semibold text-[#2f241b]">{order.couponCode || "None"}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <UserAuthGate title="Your Orders" description="Sign in with Google to see your order history.">
      {(user, token) => (
        <section className="myntra-container space-y-5 py-6 sm:py-8">
          <div className="rounded-2xl border border-[#eadfce] bg-gradient-to-r from-[#fdf7ef] via-[#fbf2e7] to-[#f9ecdc] p-4 shadow-[0_16px_36px_rgba(63,40,22,0.12)] sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a5a3b]">Your Orders</p>
            <h1 className="mt-1 text-2xl font-bold text-[#2f241b] sm:text-3xl">{user.name}&apos;s Order History</h1>
            <p className="mt-1 text-sm text-[#8d7966]">Track all your placed orders and current delivery status.</p>
          </div>
          <OrdersContent token={token} />
        </section>
      )}
    </UserAuthGate>
  );
}
