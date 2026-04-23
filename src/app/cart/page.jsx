"use client";

import { useEffect, useMemo, useState } from "react";
import UserAuthGate from "../../components/UserAuthGate";
import { getCartItems, setCartItems } from "../../lib/cart";
import { apiGet, apiPost } from "../../lib/api";

const CASHFREE_SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

/**
 * Cashfree SDK is loaded at runtime from the global script.
 * These local type hints keep integration readable and safer.
 */
function getCashfreeCheckoutResultError(result) {
  if (!result || typeof result !== "object") return "";
  if ("error" in result && result.error?.message) return result.error.message;
  if ("message" in result && result.message) return result.message;
  return "";
}

export default function CartPage() {
  const [cartItems, setLocalCartItems] = useState([]);
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India"
  });
  const [checkoutConfig, setCheckoutConfig] = useState({ deliveryChargeEnabled: false, deliveryChargeAmount: 0 });
  const [coupons, setCoupons] = useState([]);
  const [selectedCouponCode, setSelectedCouponCode] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    setLocalCartItems(getCartItems());
  }, []);

  useEffect(() => {
    async function loadCheckoutMeta() {
      try {
        const [config, activeCoupons] = await Promise.all([apiGet("/catalog/checkout-config"), apiGet("/catalog/coupons/active")]);
        setCheckoutConfig({
          deliveryChargeEnabled: Boolean(config?.deliveryChargeEnabled),
          deliveryChargeAmount: Number(config?.deliveryChargeAmount || 0)
        });
        setCoupons(Array.isArray(activeCoupons) ? activeCoupons : []);
      } catch (_error) {
        // Keep checkout functional even if config fetch fails.
      }
    }
    loadCheckoutMeta();
  }, []);

  function updateQty(index, delta) {
    const next = [...cartItems];
    next[index].qty = Math.max(1, next[index].qty + delta);
    setLocalCartItems(next);
    setCartItems(next);
  }

  function removeItem(index) {
    const next = cartItems.filter((_, i) => i !== index);
    setLocalCartItems(next);
    setCartItems(next);
  }

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const mrp = cartItems.reduce((sum, item) => sum + item.originalPrice * item.qty, 0);
    const productDiscount = Math.max(0, mrp - subtotal);
    const deliveryCharge = checkoutConfig.deliveryChargeEnabled ? Number(checkoutConfig.deliveryChargeAmount || 0) : 0;
    const coupon = coupons.find((item) => item.name === selectedCouponCode);
    const couponDiscount = coupon ? (subtotal * Number(coupon.discountPercent || 0)) / 100 : 0;
    const finalTotal = Math.max(0, subtotal + deliveryCharge - couponDiscount);
    return { subtotal, mrp, productDiscount, deliveryCharge, couponDiscount, finalTotal };
  }, [cartItems, checkoutConfig.deliveryChargeAmount, checkoutConfig.deliveryChargeEnabled, coupons, selectedCouponCode]);

  function loadCashfreeScript() {
    return new Promise((resolve, reject) => {
      if (window.Cashfree) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(`script[src="${CASHFREE_SDK_URL}"]`);
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Cashfree SDK load failed")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = CASHFREE_SDK_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Cashfree SDK load failed"));
      document.body.appendChild(script);
    });
  }

  async function handlePlaceOrder(user, token) {
    if (!cartItems.length) return;
    if (!token) {
      setCheckoutError("Please login again to continue checkout.");
      return;
    }
    const requiredFields = ["fullName", "phone", "line1", "city", "state", "postalCode", "country"];
    const missingField = requiredFields.find((field) => !String(checkoutForm[field] || "").trim());
    if (missingField) {
      setCheckoutError("Please fill full delivery details before checkout.");
      return;
    }

    if (checkoutForm.phone.replace(/\D/g, "").length < 10) {
      setCheckoutError("Enter a valid 10-digit phone number for payment.");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const session = await apiPost(
        "/orders/checkout/cashfree/session",
        {
          items: cartItems,
          customerPhone: checkoutForm.phone.replace(/\D/g, "").slice(-10),
          customerName: user.name,
          customerEmail: user.email,
          couponCode: selectedCouponCode || undefined,
          shippingAddress: {
            fullName: checkoutForm.fullName.trim(),
            phone: checkoutForm.phone.replace(/\D/g, "").slice(-10),
            line1: checkoutForm.line1.trim(),
            line2: checkoutForm.line2.trim(),
            city: checkoutForm.city.trim(),
            state: checkoutForm.state.trim(),
            postalCode: checkoutForm.postalCode.trim(),
            country: checkoutForm.country.trim() || "India"
          }
        },
        token
      );

      await loadCashfreeScript();
      if (!window.Cashfree) {
        throw new Error("Cashfree SDK unavailable");
      }

      const cashfree = window.Cashfree({
        mode: session.environment === "production" ? "production" : "sandbox"
      });

      const checkoutResult = await cashfree.checkout({
        paymentSessionId: session.paymentSessionId,
        redirectTarget: "_modal"
      });
      const checkoutError = getCashfreeCheckoutResultError(checkoutResult);
      if (checkoutError) {
        throw new Error(`Payment not completed: ${checkoutError}`);
      }
    } catch (error) {
      setCheckoutError(error?.message || "Payment initiation failed. Please check Cashfree setup and try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <UserAuthGate title="Cart" description="Sign in with Google to access your cart.">
      {(user, token) => {
        return (
          <section className="myntra-container py-6 sm:py-8">
            <div className="mb-5 rounded-xl border border-[#eadfce] bg-gradient-to-r from-[#fdf7ef] to-[#ffffff] px-4 py-4 shadow-[0_12px_30px_rgba(63,40,22,0.08)] sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a5a3b]">Checkout</p>
              <h1 className="text-xl font-semibold text-[#2f241b] sm:text-2xl">Bag - {user.name}</h1>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                {!cartItems.length && <div className="card rounded-xl p-6 text-sm text-[#6a7390]">Your bag is empty.</div>}
                {cartItems.map((item, index) => (
                  <article key={`${item.productId}-${item.size}-${item.color}-${index}`} className="card flex flex-col gap-4 rounded-xl p-4 sm:flex-row">
                    <img src={item.image} alt={item.name} className="h-44 w-full rounded-lg border border-[#ebedf3] object-cover sm:h-32 sm:w-24" />
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-[#2f241b]">{item.name}</h3>
                      <p className="text-sm text-[#7f6a57]">{item.brand}</p>
                      <p className="text-sm text-[#7f6a57]">
                        Size: <b>{item.size}</b> | Color: <b>{item.color}</b>
                      </p>
                      <p className="font-semibold text-[#2f241b]">Rs. {Math.round(item.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button type="button" onClick={() => updateQty(index, -1)} className="rounded-md border border-[#decfbb] bg-[#fff8ef] px-2">
                          -
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold">{item.qty}</span>
                        <button type="button" onClick={() => updateQty(index, 1)} className="rounded-md border border-[#decfbb] bg-[#fff8ef] px-2">
                          +
                        </button>
                        <button type="button" onClick={() => removeItem(index)} className="ml-3 text-xs font-semibold text-[#da3d4c]">
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="card h-fit rounded-xl p-4">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Price Details</h2>
                <div className="space-y-2 text-sm text-[#7a6552]">
                  <p className="flex justify-between">
                    <span>Total MRP</span>
                    <span>Rs. {Math.round(totals.mrp)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-[#03a685]">- Rs. {Math.round(totals.productDiscount)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span>{totals.deliveryCharge > 0 ? `Rs. ${Math.round(totals.deliveryCharge)}` : "Free"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Coupon Discount</span>
                    <span className="text-[#03a685]">- Rs. {Math.round(totals.couponDiscount)}</span>
                  </p>
                  <p className="flex justify-between border-t border-[#ecdfcf] pt-2 font-semibold text-[#2f241b]">
                    <span>Total Amount</span>
                    <span>Rs. {Math.round(totals.finalTotal)}</span>
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8a5a3b]">Cashfree Checkout</p>
                  <select
                    className="w-full rounded-lg border border-[#decfbb] bg-[#fffefb] px-3 py-2 text-sm outline-none focus:border-[#8a5a3b]"
                    value={selectedCouponCode}
                    onChange={(e) => setSelectedCouponCode(e.target.value)}
                  >
                    <option value="">Apply coupon (optional)</option>
                    {coupons.map((coupon) => (
                      <option key={coupon._id} value={coupon.name}>
                        {coupon.name} - {coupon.discountPercent}% OFF
                      </option>
                    ))}
                  </select>
                  <input
                    className="w-full rounded-lg border border-[#decfbb] bg-[#fffefb] px-3 py-2 text-sm outline-none focus:border-[#8a5a3b]"
                    placeholder="Full name"
                    value={checkoutForm.fullName}
                    onChange={(e) => setCheckoutForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  />
                  <input
                    className="w-full rounded-lg border border-[#decfbb] bg-[#fffefb] px-3 py-2 text-sm outline-none focus:border-[#8a5a3b]"
                    placeholder="Phone number for payment"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <input
                    className="w-full rounded-lg border border-[#decfbb] bg-[#fffefb] px-3 py-2 text-sm outline-none focus:border-[#8a5a3b]"
                    placeholder="Address line 1"
                    value={checkoutForm.line1}
                    onChange={(e) => setCheckoutForm((prev) => ({ ...prev, line1: e.target.value }))}
                  />
                  <input
                    className="w-full rounded-lg border border-[#decfbb] bg-[#fffefb] px-3 py-2 text-sm outline-none focus:border-[#8a5a3b]"
                    placeholder="Address line 2 (optional)"
                    value={checkoutForm.line2}
                    onChange={(e) => setCheckoutForm((prev) => ({ ...prev, line2: e.target.value }))}
                  />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      className="w-full rounded-lg border border-[#decfbb] bg-[#fffefb] px-3 py-2 text-sm outline-none focus:border-[#8a5a3b]"
                      placeholder="City"
                      value={checkoutForm.city}
                      onChange={(e) => setCheckoutForm((prev) => ({ ...prev, city: e.target.value }))}
                    />
                    <input
                      className="w-full rounded-lg border border-[#decfbb] bg-[#fffefb] px-3 py-2 text-sm outline-none focus:border-[#8a5a3b]"
                      placeholder="State"
                      value={checkoutForm.state}
                      onChange={(e) => setCheckoutForm((prev) => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      className="w-full rounded-lg border border-[#decfbb] bg-[#fffefb] px-3 py-2 text-sm outline-none focus:border-[#8a5a3b]"
                      placeholder="Postal code"
                      value={checkoutForm.postalCode}
                      onChange={(e) => setCheckoutForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                    />
                    <input
                      className="w-full rounded-lg border border-[#decfbb] bg-[#fffefb] px-3 py-2 text-sm outline-none focus:border-[#8a5a3b]"
                      placeholder="Country"
                      value={checkoutForm.country}
                      onChange={(e) => setCheckoutForm((prev) => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlaceOrder(user, token)}
                    disabled={checkoutLoading || !cartItems.length}
                    className="w-full rounded-lg bg-[#6d3d20] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5a3219] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutLoading ? "Starting Checkout..." : "Pay Securely via Cashfree"}
                  </button>
                  {checkoutError && <p className="text-xs font-semibold text-[#da3d4c]">{checkoutError}</p>}
                </div>
              </aside>
            </div>
          </section>
        );
      }}
    </UserAuthGate>
  );
}
