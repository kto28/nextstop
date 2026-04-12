"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export function Navbar() {
  const { theme, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="text-xl">✈️</span>
          <span>Nextstop</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/#trips"
            className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
          >
            旅行清單
          </Link>
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-base"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </nav>
  );
}
