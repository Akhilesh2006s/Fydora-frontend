"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import fashionForgeLogo from "../../FashionForge.png";

const navItems = [
  { href: "/shop", label: "Dashboard", icon: "grid" },
  { href: "/products", label: "Shop", icon: "shop" },
  { href: "/cart", label: "Cart", icon: "bag" },
  { href: "/wishlist", label: "Wishlist", icon: "heart" },
  { href: "/orders", label: "Orders", icon: "orders" },
  { href: "/profile", label: "Profile", icon: "person" }
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminRoute = pathname.startsWith("/admin");
  const brandHref = isAdminRoute ? "/admin" : "/shop";

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("ff_user_token");
    localStorage.removeItem("ff_admin_token");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#f3e7d8]/60 bg-[#fffdf9]/35 backdrop-blur-xl">
      <div className="myntra-container flex flex-wrap items-center justify-between gap-2 py-2.5 sm:gap-3 sm:py-3">
        <Link href={brandHref} className="flex items-center gap-3 text-lg font-bold tracking-tight text-[#3f2d1f]">
          <Image src={fashionForgeLogo} alt="FYDORA FORGE logo" className="h-10 w-auto object-contain" priority />
          <span className="hidden text-sm font-semibold text-[#3f2d1f] sm:block">FYDORA FORGE</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2d5c3] bg-[#fff8ef] px-3 py-1.5 text-xs font-semibold text-[#5f4936] sm:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <HeaderIcon name={mobileMenuOpen ? "close" : "menu"} className="h-4 w-4" />
          <span>{mobileMenuOpen ? "Close" : "Menu"}</span>
        </button>

        {!isAdminRoute && <div className="hidden min-w-[240px] flex-1 md:flex md:max-w-[380px]">
          <div className="flex w-full items-center rounded-xl border border-[#e1d3bf] bg-[#fff8ef] px-3 py-2 shadow-[0_8px_20px_rgba(63,40,22,0.08)]">
            <HeaderIcon name="search" className="h-4 w-4 text-[#8d7158]" />
            <input className="w-full bg-transparent px-2 text-sm text-[#4a3728] outline-none placeholder:text-[#a18972]" placeholder="Search premium styles..." />
          </div>
        </div>}

        <nav className="hidden w-full items-center gap-2 overflow-x-auto pb-0.5 sm:flex sm:w-auto sm:flex-wrap sm:overflow-visible sm:pb-0">
          {!isAdminRoute &&
            navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname.startsWith(item.href)
                  ? "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#8a5a3b] bg-gradient-to-r from-[#f5ede3] to-[#fff8f0] px-2.5 py-1.5 text-[11px] font-semibold text-[#6d3d20] shadow-[0_8px_16px_rgba(109,61,32,0.18)] sm:px-3 sm:text-xs"
                  : "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#e2d5c3] bg-[#fff8ef] px-2.5 py-1.5 text-[11px] font-semibold text-[#5f4936] transition hover:border-[#8a5a3b] hover:text-[#6d3d20] sm:px-3 sm:text-xs"
              }
            >
              <HeaderIcon name={item.icon} className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
            ))}
          {isAdminRoute && <span className="rounded-lg border border-[#d8c6af] bg-[#fff3e4] px-3 py-1.5 text-xs font-semibold text-[#6d3d20]">Admin Console</span>}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#e8cfc3] bg-[#fff6f2] px-2.5 py-1.5 text-[11px] font-semibold text-[#a04d32] transition hover:bg-[#fef0ea] sm:px-3 sm:text-xs"
          >
            <HeaderIcon name="logout" className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
          <ThemeToggle />
        </nav>

        {mobileMenuOpen && (
          <div className="sm:hidden w-full space-y-3 rounded-xl border border-[#eadfce] bg-[#fffdfa] p-3 shadow-[0_10px_24px_rgba(63,40,22,0.1)]">
            {!isAdminRoute && (
              <div className="flex w-full items-center rounded-xl border border-[#e1d3bf] bg-[#fff8ef] px-3 py-2">
                <HeaderIcon name="search" className="h-4 w-4 text-[#8d7158]" />
                <input className="w-full bg-transparent px-2 text-sm text-[#4a3728] outline-none placeholder:text-[#a18972]" placeholder="Search premium styles..." />
              </div>
            )}

            {!isAdminRoute ? (
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      pathname.startsWith(item.href)
                        ? "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#8a5a3b] bg-gradient-to-r from-[#f5ede3] to-[#fff8f0] px-3 py-2 text-xs font-semibold text-[#6d3d20]"
                        : "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e2d5c3] bg-[#fff8ef] px-3 py-2 text-xs font-semibold text-[#5f4936]"
                    }
                  >
                    <HeaderIcon name={item.icon} className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <span className="inline-flex rounded-lg border border-[#d8c6af] bg-[#fff3e4] px-3 py-1.5 text-xs font-semibold text-[#6d3d20]">Admin Console</span>
            )}

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e8cfc3] bg-[#fff6f2] px-3 py-2 text-xs font-semibold text-[#a04d32]"
              >
                <HeaderIcon name="logout" className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function HeaderIcon({ name, className }) {
  const paths = {
    shop: "M3 7h18l-1.5 12h-15L3 7z M9 7V5a3 3 0 0 1 6 0v2",
    heart: "M12 21s-7.5-4.35-9.5-8.25C.8 9.8 2.3 6.5 5.6 6.1c2-.2 3.2.8 4.4 2.2 1.2-1.4 2.4-2.4 4.4-2.2 3.3.4 4.8 3.7 3.1 6.65C19.5 16.65 12 21 12 21z",
    person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 20a8 8 0 0 1 16 0",
    bag: "M6 7h12l-1.2 12H7.2L6 7z M9 7V5a3 3 0 0 1 6 0v2",
    orders: "M6 3h12v18H6z M9 7h6 M9 11h6 M9 15h4",
    grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
    logout: "M16 17l5-5-5-5 M21 12H9 M12 19H5V5h7",
    search: "M11 18a7 7 0 1 1 4.95-2.05L21 21",
    menu: "M3 6h18 M3 12h18 M3 18h18",
    close: "M6 6l12 12 M18 6l-12 12"
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}
