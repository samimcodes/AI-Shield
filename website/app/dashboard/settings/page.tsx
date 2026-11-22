'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Shield,
  ArrowLeft,
  CreditCard,
  Calendar,
  Sparkles,
  ExternalLink,
  Check,
  Zap,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

function SettingsContent() {
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get('checkout');
  const planQuery = searchParams.get('plan');

  const [currentPlan, setCurrentPlan] = useState<'FREE' | 'PRO' | 'BUSINESS'>('FREE');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [nextBillingDate, setNextBillingDate] = useState('April 15, 2026');
  const [loadingPlan, setLoadingPlan] = useState<'PRO' | 'BUSINESS' | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    if (checkoutStatus === 'success') {
      setShowSuccessBanner(true);
      if (planQuery === 'BUSINESS') {
        setCurrentPlan('BUSINESS');
      } else {
        setCurrentPlan('PRO');
      }
    }
  }, [checkoutStatus, planQuery]);

  const handleUpgrade = async (plan: 'PRO' | 'BUSINESS') => {
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email: 'mdsamimhossen827@gmail.com',
          userId: 'user_live_demo',
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleOpenCustomerPortal = () => {
    // Direct link to Polar.sh Customer Purchases & Subscription Portal
    window.open('https://sandbox.polar.sh/purchases', '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      {/* Success Alert Banner */}
      {showSuccessBanner && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 flex items-start justify-between gap-3 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-300">
                Subscription successfully activated!
              </h4>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Your account has been upgraded to {currentPlan}. Your API keys now have higher monthly quotas and full dynamic data poisoning enabled.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessBanner(false)}
            className="text-xs text-emerald-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings & Billing Management
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your subscription tier, billing portal, and quota limits powered by Polar.sh.
        </p>
      </div>

      {/* Current Plan Overview Card */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 sm:p-7 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Current Plan</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-cyan-500/10 text-[#06B6D4] border border-cyan-500/20">
                {currentPlan}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                {subscriptionStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {currentPlan === 'FREE'
                ? '5,000 monthly bot hits with basic GPTBot protection.'
                : currentPlan === 'PRO'
                ? '500,000 monthly hits with all AI bots blocked and dynamic poisoning.'
                : 'Unlimited monthly bot hits with custom Cloudflare Edge rules.'}
            </p>
          </div>

          {/* Customer Portal Button */}
          <button
            type="button"
            onClick={handleOpenCustomerPortal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-2 text-xs transition-colors shrink-0 shadow-sm"
          >
            <CreditCard className="h-3.5 w-3.5 text-[#06B6D4]" />
            <span>Manage Subscription / Customer Portal</span>
            <ExternalLink className="h-3 w-3 text-zinc-400 ml-0.5" />
          </button>
        </div>

        {/* Plan Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs">
          <div>
            <span className="text-zinc-500 font-mono text-[11px] uppercase">Next Renewal Date</span>
            <div className="flex items-center gap-1.5 text-zinc-200 font-medium mt-1">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>{currentPlan === 'FREE' ? 'Free Forever' : nextBillingDate}</span>
            </div>
          </div>

          <div>
            <span className="text-zinc-500 font-mono text-[11px] uppercase">Monthly Usage</span>
            <div className="text-zinc-200 font-medium mt-1 font-mono">
              {currentPlan === 'FREE' ? '4,200 / 5,000 (84%)' : '4,200 / 500,000 (0.8%)'}
            </div>
          </div>

          <div>
            <span className="text-zinc-500 font-mono text-[11px] uppercase">Payment Processor</span>
            <div className="text-zinc-200 font-medium mt-1">
              Polar.sh (Merchant of Record)
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade / Change Plan Options */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Available Subscription Tiers</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Upgrades take effect instantly through secure Polar.sh checkout.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pro Tier Card */}
          <div className="relative rounded-2xl border-2 border-[#06B6D4]/40 bg-zinc-900/80 p-6 backdrop-blur-xl flex flex-col justify-between shadow-[0_0_40px_-10px_rgba(6,182,212,0.25)]">
            <div className="absolute -top-3 right-6">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#06B6D4] text-zinc-950 uppercase tracking-wide">
                <Sparkles className="h-2.5 w-2.5" />
                Recommended
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Pro Tier</h3>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl font-extrabold text-white tracking-tight">$29</span>
                  <span className="text-xs text-zinc-400 font-mono">/mo</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mb-5">
                Ideal for production SaaS, blogs, and high-value data publishers.
              </p>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span><strong>500,000</strong> bot hits per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span>All AI crawlers blocked (GPTBot, Claude, ByteDance, Meta)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span><strong>Dynamic Data Poisoning</strong> (synthetic hallucinations)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span>90-day security analytics & instant attack email alerts</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleUpgrade('PRO')}
              disabled={loadingPlan === 'PRO' || currentPlan === 'PRO'}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#06B6D4] hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-[0.98]"
            >
              {loadingPlan === 'PRO' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Opening Checkout...</span>
                </>
              ) : currentPlan === 'PRO' ? (
                <span>Current Active Plan</span>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>Upgrade to Pro ($29/mo)</span>
                </>
              )}
            </button>
          </div>

          {/* Business Tier Card */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Business Tier</h3>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl font-extrabold text-white tracking-tight">$99</span>
                  <span className="text-xs text-zinc-400 font-mono">/mo</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mb-5">
                For enterprise digital media and high-frequency content platforms.
              </p>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span><strong>Unlimited</strong> bot hits & IP blacklisting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span>Cloudflare Edge Proxy integration & custom routing rules</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span>99.99% uptime SLA & dedicated security architect</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span>Dedicated Slack / Discord channel & priority support</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleUpgrade('BUSINESS')}
              disabled={loadingPlan === 'BUSINESS' || currentPlan === 'BUSINESS'}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-semibold text-xs transition-all active:scale-[0.98]"
            >
              {loadingPlan === 'BUSINESS' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Opening Checkout...</span>
                </>
              ) : currentPlan === 'BUSINESS' ? (
                <span>Current Active Plan</span>
              ) : (
                <>
                  <span>Upgrade to Business ($99/mo)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SettingsBillingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-white/10">
              <Shield className="h-3.5 w-3.5 text-[#06B6D4]" />
            </div>
            <span className="font-semibold text-sm text-white">AI-Shield Billing</span>
          </div>
        </div>
      </header>

      <Suspense fallback={
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center text-xs text-zinc-500 font-mono">
          Loading billing settings...
        </div>
      }>
        <SettingsContent />
      </Suspense>
    </div>
  );
}

