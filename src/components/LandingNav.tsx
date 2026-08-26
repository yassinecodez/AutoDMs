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
          ? "top-4 w-[90%] max-w-4xl py-2.5 px-6 rounded-full bg-black/90 backdrop-blur-3xl border border-white/15 shadow-2xl"
          : "top-5 w-[94%] max-w-[1360px] px-6 sm:px-8 py-3.5 rounded-2xl backdrop-blur-2xl bg-black/85 border border-white/12 shadow-2xl"
      }`}
    >
      {/* Left: Official AutoDMs Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-white text-base tracking-tight select-none shrink-0"
      >
        <img src="/logo.png" alt="AutoDMs" className="h-7 w-auto object-contain" />
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
