'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 group-hover:border-cyan-500/50 transition-colors shadow-sm">
            <Shield className="h-4 w-4 text-[#06B6D4] transition-transform group-hover:scale-110" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight text-white">
              AI-Shield
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
              v0.3.2
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          <a
            href="#features"
            className="hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#simulator"
            className="hover:text-white transition-colors"
          >
            Live Simulator
          </a>
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors"
          >
            How it Works
          </a>
          <a
            href="#scanner"
            className="hover:text-white transition-colors"
          >
            Scanner
          </a>
          <a
            href="#pricing"
            className="hover:text-white transition-colors"
          >
            Pricing
          </a>
          <Link
            href="/docs"
            className="hover:text-white transition-colors"
          >
            Docs
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/dashboard"
            className="px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Log in
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#06B6D4] hover:bg-cyan-400 text-zinc-950 font-semibold px-4 py-1.5 text-sm shadow-sm hover:shadow-cyan-500/25 transition-all"
          >
            <span>Start Free</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#09090b]/95 backdrop-blur-2xl px-5 py-4 space-y-3">
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-300 hover:text-white"
          >
            How it Works
          </a>
          <a
            href="#scanner"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-300 hover:text-white"
          >
            Vulnerability Scanner
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-300 hover:text-white"
          >
            Pricing
          </a>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <a
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 text-sm text-zinc-300 hover:text-white"
            >
              Log in
            </a>
            <a
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 text-sm font-semibold rounded-lg bg-[#06B6D4] text-zinc-950"
            >
              Start Free
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
