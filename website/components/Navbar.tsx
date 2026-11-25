'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Simulator', href: '/#simulator' },
  { label: 'Scanner', href: '/#scanner' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Docs', href: '/docs' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email: string; plan: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser({ email: data.user.email, plan: data.user.plan });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-[#09090b]/85 backdrop-blur-2xl shadow-lg shadow-black/20'
          : 'border-b border-white/[0.06] bg-[#09090b]/60 backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/15 group-hover:border-cyan-500/50 transition-all shadow-sm">
            <Shield className="h-4 w-4 text-[#06B6D4] transition-transform group-hover:scale-110" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white">
              AI-Shield
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium font-mono bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
              v0.3.4
            </span>
          </div>
        </Link>

        {/* Center Floating Pill Navigation (Linear / Vercel Style) */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-zinc-900/60 px-1.5 py-1 backdrop-blur-md">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3.5 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.07] transition-all"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <a
            href="https://github.com/samimcodes/AI-Shield"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg border border-white/10 bg-zinc-900/70 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>

          {user ? (
            <>
              <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                <span className="truncate max-w-[140px]">{user.email}</span>
              </span>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#06B6D4] to-[#10B981] hover:opacity-95 text-zinc-950 font-bold px-4 py-1.5 text-xs shadow-sm shadow-cyan-500/20 transition-all active:scale-[0.98]"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#06B6D4] to-[#10B981] hover:opacity-95 text-zinc-950 font-bold px-4 py-1.5 text-xs shadow-sm shadow-cyan-500/20 transition-all active:scale-[0.98]"
              >
                <span>Start Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg border border-white/10 bg-zinc-900/70 text-zinc-400 hover:text-white focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#09090b]/95 backdrop-blur-2xl px-5 py-4 space-y-2">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-bold rounded-lg bg-gradient-to-r from-[#06B6D4] to-[#10B981] text-zinc-950"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm text-zinc-300 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-bold rounded-lg bg-gradient-to-r from-[#06B6D4] to-[#10B981] text-zinc-950"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
