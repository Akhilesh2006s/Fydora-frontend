"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ff_theme");
    if (saved === "dark") {
      setDark(true);
      return;
    }
    if (saved === "light") {
      setDark(false);
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("ff_theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      className="rounded border border-[#d4d5d9] px-2 py-1 text-[10px] font-semibold text-[#696e79] dark:border-[#6a5644] dark:text-[#f0e1cf]"
      onClick={() => setDark((prev) => !prev)}
      type="button"
    >
      {dark ? "LIGHT" : "DARK"}
    </button>
  );
}
