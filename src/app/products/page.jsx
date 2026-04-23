import ProductCard from "../../components/ProductCard";
import { apiGet } from "../../lib/api";

export default async function ProductsPage({ searchParams }) {
  const qs = new URLSearchParams(searchParams || {});
  const data = await apiGet(`/catalog/products?${qs.toString()}`).catch(() => ({ items: [], total: 0 }));
  const brands = await apiGet("/catalog/brands").catch(() => []);
  const activeSort = searchParams?.sort || "newest";

  function queryWith(next) {
    const params = new URLSearchParams(searchParams || {});
    Object.entries(next).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  }

  return (
    <div className="myntra-container space-y-5 py-6 sm:space-y-6 sm:py-8">
      <section className="rounded-xl border border-[#eadfce] bg-[#fffdfa] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-bold text-[#2f241b]">All Products</h1>
          <span className="rounded-full bg-[#f6eee4] px-3 py-1 text-xs font-semibold text-[#6d3d20]">{data.total || data.items.length} items</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <a href={queryWith({ brand: "" })} className={`rounded-full border px-3 py-1 text-xs ${!searchParams?.brand ? "border-[#8a5a3b] bg-[#f6eee4] text-[#6d3d20]" : "border-[#decfbb] text-[#7a6552]"}`}>
            All Brands
          </a>
          {brands.map((brand) => (
            <a
              key={brand._id}
              href={queryWith({ brand: brand._id })}
              className={`rounded-full border px-3 py-1 text-xs ${searchParams?.brand === brand._id ? "border-[#8a5a3b] bg-[#f6eee4] text-[#6d3d20]" : "border-[#decfbb] text-[#7a6552]"}`}
            >
              {brand.name}
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#eadfce] bg-[#fffdfa] p-4">
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs md:text-sm">
          <a href={queryWith({ sort: "newest" })} className={activeSort === "newest" ? "rounded-full border border-[#8a5a3b] bg-[#f6eee4] px-3 py-1 text-[#6d3d20]" : "rounded-full border border-[#decfbb] px-3 py-1 text-[#7a6552]"}>
            Recommended
          </a>
          <a href={queryWith({ sort: "popularity" })} className={activeSort === "popularity" ? "rounded-full border border-[#8a5a3b] bg-[#f6eee4] px-3 py-1 text-[#6d3d20]" : "rounded-full border border-[#decfbb] px-3 py-1 text-[#7a6552]"}>
            Popularity
          </a>
          <a href={queryWith({ sort: "priceAsc" })} className={activeSort === "priceAsc" ? "rounded-full border border-[#8a5a3b] bg-[#f6eee4] px-3 py-1 text-[#6d3d20]" : "rounded-full border border-[#decfbb] px-3 py-1 text-[#7a6552]"}>
            Price Low
          </a>
          <a href={queryWith({ sort: "priceDesc" })} className={activeSort === "priceDesc" ? "rounded-full border border-[#8a5a3b] bg-[#f6eee4] px-3 py-1 text-[#6d3d20]" : "rounded-full border border-[#decfbb] px-3 py-1 text-[#7a6552]"}>
            Price High
          </a>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {data.items.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </section>
    </div>
  );
}
