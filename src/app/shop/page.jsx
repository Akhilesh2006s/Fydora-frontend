import { apiGet } from "../../lib/api";
import heroBanner from "../../../Hero Banner.png";

export default async function ShopPage({ searchParams }) {
  const brands = await apiGet("/catalog/brands").catch(() => []);
  const home = await apiGet("/catalog/homepage").catch(() => ({ banners: [] }));
  const promoBanners = home.banners || [];

  return (
    <div className="myntra-container space-y-6 py-6 sm:space-y-8 sm:py-8">
      <section
        className="relative overflow-hidden rounded-3xl border border-[#e2d5c3] bg-gradient-to-br from-[#2a170e] via-[#4a2d1a] to-[#24150d] shadow-[0_24px_52px_rgba(63,40,22,0.22)]"
        style={{ aspectRatio: `${heroBanner.width} / ${heroBanner.height}`, minHeight: "250px" }}
      >
        <img src={heroBanner.src} alt="FYDORA FORGE banner" className="absolute inset-0 h-full w-full object-cover object-center opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#120a05]/55 via-[#1a1008]/40 to-[#120a05]/50" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#8a5a3b]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#cda779]/20 blur-3xl" />
        <div className="absolute inset-x-4 top-4 flex flex-wrap items-center gap-2 sm:inset-x-6 sm:top-6">
          <span className="rounded-full border border-[#f0dcc0]/60 bg-[#2b1a11]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f8e8d2]">Members Exclusive</span>
          <span className="rounded-full border border-[#f0dcc0]/40 bg-[#2b1a11]/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f8e8d2]">New Season Edit</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:bottom-6 sm:left-6 sm:right-6 sm:gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f7e7d0]">Luxury Collection</p>
            <h1 className="mt-1.5 text-2xl font-bold leading-tight sm:mt-2 sm:text-3xl md:text-4xl">User Style Dashboard</h1>
            <p className="mt-1.5 text-xs text-[#f2e6d8] sm:mt-2 sm:text-sm">Discover premium fits, timeless tones, and refined essentials curated for your lifestyle.</p>
          </div>
          <div className="w-fit rounded-2xl border border-[#f0dcc0]/45 bg-[#2b1a11]/65 p-3 text-right text-[#f8e8d2] backdrop-blur-sm md:justify-self-end">
            <p className="text-[11px] uppercase tracking-[0.14em]">Curated Looks</p>
            <p className="mt-1 text-2xl font-bold">{brands.length}</p>
            <p className="text-[11px] uppercase tracking-[0.14em] opacity-85">Top Brands</p>
          </div>
        </div>
      </section>

      {promoBanners.length > 0 && (
        <section className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-[#e2d5c3] bg-gradient-to-br from-[#2f1d12] via-[#4a2d1a] to-[#2a170e] shadow-[0_24px_52px_rgba(63,40,22,0.22)]">
            <img src={promoBanners[0].image} alt={promoBanners[0].title || "Promotion"} className="h-[220px] w-full object-contain sm:h-[300px] md:h-[400px]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 max-w-xl text-white sm:bottom-6 sm:left-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Featured Drop</p>
              <h1 className="mt-1.5 text-2xl font-bold sm:mt-2 sm:text-3xl md:text-4xl">{promoBanners[0].title || "FYDORA FORGE Collection"}</h1>
              {promoBanners[0].subtitle && <p className="mt-1 text-sm text-white/90">{promoBanners[0].subtitle}</p>}
            </div>
          </div>
          {promoBanners.length > 1 && (
            <div className="grid gap-3 md:grid-cols-3">
              {promoBanners.slice(1, 4).map((banner) => (
                <div key={banner._id} className="overflow-hidden rounded-xl border border-[#e2d5c3] bg-gradient-to-br from-[#3d2617] to-[#24150d]">
                  <img src={banner.image} alt={banner.title || "Promotion"} className="h-36 w-full object-contain" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="rounded-xl border border-[#eadfce] bg-[#fffdfa] p-5 shadow-[0_10px_30px_rgba(63,40,22,0.08)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#3d2d20]">Top Brands</h2>
          <span className="rounded-full bg-[#f6eee4] px-3 py-1 text-xs font-semibold text-[#6d3d20]">{brands.length} brands</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
          {brands.map((brand) => (
            <a
              key={brand._id}
              href={`/products?brand=${brand._id}`}
              className="group flex h-24 flex-col items-center justify-center rounded-lg border border-[#ece1d3] bg-gradient-to-b from-[#fffaf4] to-[#fdf3e6] p-3 transition hover:-translate-y-0.5 hover:border-[#8a5a3b]"
            >
              <img src={brand.logo || "https://placehold.co/120x50?text=Brand"} alt={brand.name} className="max-h-12 w-full object-contain" />
              <span className="mt-1 line-clamp-1 text-[11px] font-semibold text-[#7f6a57] group-hover:text-[#6d3d20]">{brand.name}</span>
            </a>
          ))}
          {!brands.length && <p className="text-sm text-[#7e818c]">No brands available yet.</p>}
        </div>
      </section>

      <section className="space-y-4">
        <div className="sticky top-[68px] z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eadfce] bg-[#fffdfa]/95 px-4 py-3 shadow-[0_10px_24px_rgba(63,40,22,0.08)] backdrop-blur sm:top-[74px]">
          <div>
            <h1 className="text-base font-bold text-[#3d2d20]">FYDORA User Dashboard</h1>
            <p className="text-sm text-[#8f7a67]">Browse collections, brands, and latest banner drops.</p>
          </div>
          <a href="/products" className="rounded-full border border-[#8a5a3b] bg-[#f6eee4] px-4 py-2 text-xs font-semibold text-[#6d3d20]">
            View All Products
          </a>
        </div>
      </section>
    </div>
  );
}
