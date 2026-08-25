"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 inset-x-0 mx-auto w-[92%] max-w-5xl z-50 transition-all duration-300 ease-out ${
        scrolled
          ? "rounded-full bg-black/80 border border-white/15 shadow-2xl backdrop-blur-xl px-6 py-2.5"
          : "rounded-2xl bg-black/60 border border-white/10 shadow-lg backdrop-blur-md px-6 py-3"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Minimalist AutoDMs Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-white text-sm tracking-tight select-none"
        >
          <span className="w-2 h-2 rounded-full bg-white inline-block shadow-sm" />
          <span>AutoDMs</span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#preview" className="hover:text-white transition-colors">Preview</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-medium text-zinc-300 hover:text-white transition-colors px-2 py-1"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="h-8 px-4 bg-white hover:bg-zinc-200 text-black font-semibold rounded-full text-xs flex items-center transition-colors shadow-sm"
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  );
}

export default LandingNav;
