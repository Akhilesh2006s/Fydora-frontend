"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserAuthGate from "../../components/UserAuthGate";
import { addCartItem } from "../../lib/cart";
import { getWishlistItems, removeWishlistItem } from "../../lib/wishlist";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    setWishlistItems(getWishlistItems());
  }, []);

  function handleRemove(productId) {
    setWishlistItems(removeWishlistItem(productId));
  }

  function handleMoveToBag(item) {
    addCartItem({
      productId: item.productId,
      name: item.name,
      brand: item.brand,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      size: "Free",
      color: "Default",
      qty: 1
    });
    setWishlistItems(removeWishlistItem(item.productId));
  }

  return (
    <UserAuthGate title="Wishlist" description="Sign in with Google to view your saved items.">
      {(user) => (
        <section className="myntra-container space-y-5 py-6 sm:py-8">
          <div className="rounded-2xl border border-[#e0e7f5] bg-gradient-to-r from-[#fff9fb] to-[#f3f7ff] p-4 shadow-[0_14px_30px_rgba(20,40,90,0.08)] sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7187b4]">Wishlist</p>
            <h1 className="mt-1 text-2xl font-bold text-[#1f2b49] sm:text-3xl">{user.name}&apos;s Curated Picks</h1>
            <p className="mt-1 text-sm text-[#6b7ea7]">Save products you love and move them to bag anytime.</p>
          </div>

          {!wishlistItems.length ? (
            <div className="rounded-2xl border border-dashed border-[#d4ddec] bg-white p-10 text-center shadow-[0_12px_26px_rgba(20,40,90,0.05)]">
              <p className="text-lg font-semibold text-[#1f2b49]">No wishlist items yet</p>
              <p className="mt-2 text-sm text-[#7083ad]">Tap the wishlist button on product pages to build your collection.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistItems.map((item) => (
                <article key={item.productId} className="rounded-xl border border-[#eadfce] bg-[#fffdfa] p-3">
                  <img src={item.image} alt={item.name} className="h-52 w-full rounded-lg object-cover" />
                  <p className="mt-3 text-sm font-bold text-[#2f241b]">{item.brand}</p>
                  <h3 className="line-clamp-1 text-sm text-[#6a5644]">{item.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-[#2f241b]">Rs. {Math.round(item.price)}</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => handleMoveToBag(item)} className="flex-1 rounded-md bg-[#6d3d20] px-3 py-2 text-xs font-semibold text-white">
                      Move to Bag
                    </button>
                    <button type="button" onClick={() => handleRemove(item.productId)} className="flex-1 rounded-md border border-[#d98f7b] bg-[#fff1ed] px-3 py-2 text-xs font-semibold text-[#b14c2f]">
                      Remove
                    </button>
                  </div>
                  <Link href={`/product/${item.productId}`} className="mt-2 inline-block text-xs font-semibold text-[#6d3d20]">
                    View Product
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </UserAuthGate>
  );
}
