'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ExternalLink, Zap, CreditCard, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  plan?: string;
  requestsUsed?: number;
  requestsMax?: number;
  userEmail?: string;
}

export default function DashboardHeader({
  plan = 'Free',
  requestsUsed = 0,
  requestsMax = 5000,
  userEmail,
}: DashboardHeaderProps) {
  const router = useRouter();
  const percentUsed = requestsMax > 0 ? Math.round((requestsUsed / requestsMax) * 100) : 0;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 group-hover:border-cyan-500/50 transition-colors shadow-sm">
              <Shield className="h-4 w-4 text-[#06B6D4]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-white tracking-tight">AI-Shield</span>
              <span className="text-zinc-600">/</span>
              <span className="text-xs font-mono text-zinc-400">Dashboard</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/80 border border-white/5 text-[11px] font-mono text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Control Plane: Active</span>
          </div>
        </div>

        {/* Right: Environment, Quota pill & Upgrade CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs">
            <span className="text-zinc-400">Plan:</span>
            <span className="font-semibold text-white">{plan}</span>
            <span className="text-zinc-500 font-mono">({percentUsed}%)</span>
          </div>

          {percentUsed >= 80 && (
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#06B6D4] hover:bg-cyan-400 text-zinc-950 font-semibold px-3.5 py-1.5 text-xs shadow-sm shadow-cyan-500/25 transition-all"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Upgrade to Pro</span>
            </Link>
          )}

          <Link
            href="/docs"
            className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            title="Documentation"
          >
            Docs
          </Link>

          <Link
            href="/dashboard/settings"
            className="p-1.5 rounded-lg border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            title="Settings & Billing"
          >
            <CreditCard className="h-4 w-4 text-[#06B6D4]" />
          </Link>

          <a
            href="https://github.com/samimcodes/AI-Shield"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          {userEmail && (
            <span className="hidden lg:inline-block text-xs text-zinc-400 font-mono truncate max-w-[160px]">
              {userEmail}
            </span>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg border border-white/10 bg-zinc-900 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
