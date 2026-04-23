import Link from "next/link";

export default function ProductCard({ product }) {
  const image = product?.images?.[0] || "https://placehold.co/400x500?text=FYDORA+FORGE";
  const discounted = Math.max(0, product.price - (product.price * product.discount) / 100);
  const discountPercent = product.discount || 0;

  return (
    <article className="group overflow-hidden rounded-xl border border-[#eadfce] bg-[#fffdfa] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(63,40,22,0.14)]">
      <Link href={`/product/${product._id}`} className="block">
        <div className="relative overflow-hidden">
          <img className="h-[330px] w-full object-cover transition duration-500 group-hover:scale-[1.04]" src={image} alt={product.name} />
          {discountPercent > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-[#8a5731] px-2.5 py-1 text-[10px] font-bold text-white">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </Link>
      <div className="space-y-1.5 p-3.5">
        <p className="line-clamp-1 text-sm font-bold text-[#2f241b]">{product?.brand?.name || "Fashion Brand"}</p>
        <h3 className="line-clamp-1 text-sm text-[#6a5644]">{product.name}</h3>
        {!!product?.colors?.length && (
          <div className="flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <span key={color} className="h-3.5 w-3.5 rounded-full border border-black/10" style={getColorSwatchStyle(color)} title={color} />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-[#2f241b]">Rs. {Math.round(discounted)}</span>
          {product.discount > 0 && <span className="text-[#9b8673] line-through">Rs. {Math.round(product.price)}</span>}
        </div>
        <Link
          href={`/product/${product._id}`}
          className="inline-flex items-center gap-1 rounded-full border border-[#e1d3bf] px-3 py-1 text-xs font-semibold text-[#6d3d20] transition hover:border-[#8a5a3b] hover:text-[#8a5a3b]"
        >
          View Product
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}

function getColorSwatchStyle(color) {
  if (!color) return { backgroundColor: "#d1d5db" };
  const value = color.trim();
  if (value.startsWith("#")) return { backgroundColor: value };
  return { backgroundColor: value.toLowerCase() };
}
