"use client";

import { useEffect, useMemo, useState } from "react";
import { addCartItem } from "../lib/cart";
import { isWishlisted, toggleWishlistItem } from "../lib/wishlist";

export default function ProductDetailsClient({ product }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedImage, setSelectedImage] = useState("");
  const [status, setStatus] = useState("");
  const [wishlisted, setWishlisted] = useState(false);

  const discounted = Math.max(0, product.price - (product.price * (product.discount || 0)) / 100);
  const allImages = product.images?.length ? product.images : ["https://placehold.co/700x900?text=Product"];

  const visibleImages = useMemo(() => {
    const match = (product.colorImageMap || []).find((entry) => entry.color?.toLowerCase() === selectedColor?.toLowerCase());
    const colorImages = match?.images || [];
    const merged = [...colorImages, ...allImages];
    return Array.from(new Set(merged)).slice(0, 8);
  }, [product.colorImageMap, selectedColor, allImages]);

  const activeImage = selectedImage || visibleImages[0];

  useEffect(() => {
    setWishlisted(isWishlisted(product._id));
  }, [product._id]);

  function handleAddToBag() {
    if (product.sizes?.length && !selectedSize) {
      setStatus("Please select a size.");
      return;
    }
    if (product.colors?.length && !selectedColor) {
      setStatus("Please select a color.");
      return;
    }

    addCartItem({
      productId: product._id,
      name: product.name,
      brand: product?.brand?.name || "Brand",
      image: activeImage,
      price: discounted,
      originalPrice: product.price,
      size: selectedSize || "Free",
      color: selectedColor || "Default",
      qty: 1
    });
    setStatus("Added to bag.");
  }

  function handleWishlistToggle() {
    const { added } = toggleWishlistItem({
      productId: product._id,
      name: product.name,
      brand: product?.brand?.name || "Brand",
      image: activeImage,
      price: discounted,
      originalPrice: product.price
    });
    setWishlisted(added);
    setStatus(added ? "Added to wishlist." : "Removed from wishlist.");
  }

  return (
    <div className="myntra-container space-y-5 py-8">
      <div className="text-sm text-[#9a8470]">
        Home / Clothing / {product?.category?.name || "Category"} / <span className="font-semibold text-[#5f4a37]">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[58%_42%]">
        <div className="grid gap-4 lg:grid-cols-[80px_1fr]">
          <div className="grid max-h-[560px] gap-2 overflow-auto rounded-xl border border-[#eadfce] bg-white p-2 shadow-[0_10px_24px_rgba(63,40,22,0.08)]">
            {visibleImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={activeImage === image ? "overflow-hidden rounded-lg border-2 border-[#8a5a3b]" : "overflow-hidden rounded-lg border border-[#eadfce]"}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-[0_18px_38px_rgba(63,40,22,0.12)]">
            <img src={activeImage} alt={product.name} className="h-[560px] w-full object-cover" />
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-[#eadfce] bg-[#fffdfa] p-6 shadow-[0_14px_32px_rgba(63,40,22,0.1)]">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a5a3b]">{product?.brand?.name || "Brand"}</p>
            <h1 className="text-3xl font-bold text-[#2f241b]">{product.name}</h1>
            <span className="inline-flex rounded-full bg-[#f6eee4] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#6d3d20]">Premium Drop</span>
          </div>

          <div className="border-y border-[#ecdfcf] py-3">
            <div className="flex items-center gap-2">
              <p className="text-[28px] font-bold text-[#2f241b]">Rs. {Math.round(discounted)}</p>
              {product.discount > 0 && <p className="text-lg text-[#9b8673] line-through">Rs. {Math.round(product.price)}</p>}
              {product.discount > 0 && <p className="text-lg font-semibold text-[#8a5a3b]">({product.discount}% OFF)</p>}
            </div>
            <p className="text-sm font-semibold text-[#7f6a57]">inclusive of all taxes</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#2f241b]">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {(product.sizes || []).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={
                    selectedSize === size
                      ? "h-11 min-w-11 rounded-full border border-[#8a5a3b] bg-[#f8f0e7] px-4 text-sm font-semibold text-[#6d3d20]"
                      : "h-11 min-w-11 rounded-full border border-[#d8c8b5] px-4 text-sm font-semibold text-[#2f241b] hover:border-[#8a5a3b] hover:text-[#6d3d20]"
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#2f241b]">Colors</p>
            <div className="flex flex-wrap gap-2">
              {(product.colors || []).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedImage("");
                  }}
                  className={
                    selectedColor?.toLowerCase() === color.toLowerCase()
                      ? "inline-flex items-center gap-2 rounded-full border border-[#8a5a3b] bg-[#f8f0e7] px-2.5 py-1.5 text-xs font-semibold uppercase text-[#6d3d20]"
                      : "inline-flex items-center gap-2 rounded-full border border-[#decfbb] px-2.5 py-1.5 text-xs font-semibold uppercase text-[#6a5644]"
                  }
                >
                  <span className="h-4 w-4 rounded-full border border-black/10" style={getColorSwatchStyle(color)} />
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleAddToBag} className="btn-primary flex-1 py-4 text-base">
              Add to Bag
            </button>
            <button type="button" onClick={handleWishlistToggle} className="btn-outline flex-1 py-4 text-base">
              {wishlisted ? "Wishlisted" : "Wishlist"}
            </button>
          </div>

          {status && <p className="text-sm font-semibold text-[#6d3d20]">{status}</p>}

          <div className="space-y-1 text-sm text-[#6a5644]">
            <p className="font-semibold">Delivery options</p>
            <p>100% Original Products</p>
            <p>Pay on delivery might be available</p>
            <p>Easy 14 days returns and exchanges</p>
          </div>

          <p className="text-sm text-[#6a5644]">{product.description || "Comfort fit, clean finish and premium quality fabric."}</p>
        </div>
      </div>
    </div>
  );
}

function getColorSwatchStyle(color) {
  if (!color) return { backgroundColor: "#d1d5db" };
  const value = color.trim();
  if (value.startsWith("#")) return { backgroundColor: value };
  return { backgroundColor: value.toLowerCase() };
}
