'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#09090b] text-zinc-400 py-12 text-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-white/10">
              <Shield className="h-3.5 w-3.5 text-[#06B6D4]" />
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">AI-Shield</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Autonomous AI Crawler Defense</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <Link href="/#features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/#simulator" className="hover:text-white transition-colors">
              Simulator
            </Link>
            <Link href="/#how-it-works" className="hover:text-white transition-colors">
              How it Works
            </Link>
            <Link href="/#scanner" className="hover:text-white transition-colors">
              Scanner
            </Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-white transition-colors">
              Documentation
            </Link>
            <a
              href="https://github.com/samimcodes/AI-Shield"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Legal & Policy Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <div className="flex flex-wrap items-center gap-4">
            <span>© 2026 AI-Shield Inc.</span>
            <span className="text-zinc-700">•</span>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/refund" className="hover:text-zinc-300 transition-colors">
              Refund Policy
            </Link>
          </div>

          <div className="flex items-center gap-2 text-[#10B981] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Edge Protection Engine: Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
