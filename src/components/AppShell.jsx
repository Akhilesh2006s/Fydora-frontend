"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Header from "./Header";
import heroBanner from "../../Hero Banner.png";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const hideHeader = pathname === "/";
  const hideTopHeroBackground = hideHeader || pathname.startsWith("/shop") || pathname.startsWith("/products");

  return (
    <div className="relative min-h-screen">
      {!hideTopHeroBackground && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] overflow-hidden bg-[#201209]">
          <Image src={heroBanner} alt="FashionForge hero background" fill className="object-cover object-[center_12%] opacity-95" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a190f]/40 via-[#2a190f]/18 to-[#fffdf8]" />
        </div>
      )}
      {!hideHeader && <Header />}
      <main className={hideHeader ? "relative min-h-screen" : "relative mx-auto min-h-screen w-full max-w-7xl px-3 py-6 sm:px-4 sm:py-8"}>{children}</main>
    </div>
  );
}
