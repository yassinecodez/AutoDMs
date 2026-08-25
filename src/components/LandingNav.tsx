"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY >= 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 mx-auto z-50 transition-all duration-300 ease-out flex items-center justify-between ${
        scrolled
          ? "top-4 w-[90%] max-w-4xl h-13 py-2 px-6 rounded-full bg-black/80 backdrop-blur-3xl border border-white/15 shadow-2xl"
          : "top-6 w-[94%] max-w-7xl h-16 px-6 sm:px-8 rounded-2xl backdrop-blur-2xl bg-white/[0.04] border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] shadow-2xl"
      }`}
    >
      {/* Left: Minimalist AutoDMs Logo */}
      <Link
        href="/"
        className="flex items-center gap-2.5 font-bold text-white text-base tracking-tight select-none shrink-0"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-white inline-block shadow-sm" />
        <span>AutoDMs</span>
      </Link>

      {/* Center: Navigation Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#preview" className="hover:text-white transition-colors">Preview</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-3.5 shrink-0">
        <Link
          href="/login"
          className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors px-2 py-1"
        >
          Log in
        </Link>
        <Link
          href="/login"
          className="h-9 px-4 sm:px-5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-full text-xs sm:text-sm flex items-center transition-colors shadow-md"
        >
          Get started free
        </Link>
      </div>
    </header>
  );
}

export default LandingNav;
