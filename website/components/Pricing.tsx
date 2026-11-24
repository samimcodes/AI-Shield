'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export default function Pricing() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; plan: string } | null>(null);
  const [loadingTier, setLoadingTier] = useState<'PRO' | 'BUSINESS' | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handlePlanClick = async (tierName: string) => {
    if (tierName === 'Free') {
      router.push(user ? '/dashboard' : '/login');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const plan = tierName === 'Business' ? 'BUSINESS' : 'PRO';
    setLoadingTier(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email: user.email,
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
    } catch {
      // Fallback to settings page
    } finally {
      setLoadingTier(null);
    }
    router.push('/dashboard/settings');
  };

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      billedNote: 'Free forever for indie hackers',
      description: 'Essential defense for personal blogs, developer docs, and side projects.',
      features: [
        '5,000 bot validations / month',
        'Basic GPTBot interception',
        '24-hour incident log retention',
        'Community Discord & GitHub support',
      ],
      cta: 'Start Free',
      popular: false,
      href: '/dashboard',
      buttonClass:
        'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 hover:border-white/20',
    },
    {
      name: 'Pro',
      price: isAnnual ? '$23' : '$29',
      period: '/mo',
      billedNote: isAnnual ? 'Billed annually ($276/yr)' : 'Billed monthly, cancel anytime',
      description: 'Comprehensive active defense for SaaS apps, digital media, and high-traffic APIs.',
      features: [
        '500,000 bot validations / month',
        'All 50+ AI crawlers blocked & poisoned',
        'Dynamic Synthetic Hallucinations engine',
        '90-day forensic analytics & instant email alerts',
        'Priority architectural email support',
      ],
      cta: 'Upgrade to Pro',
      popular: true,
      href: '/dashboard/settings',
      buttonClass:
        'bg-gradient-to-r from-[#06B6D4] to-[#10B981] hover:opacity-95 text-zinc-950 font-bold shadow-lg shadow-cyan-500/25',
    },
    {
      name: 'Business',
      price: isAnnual ? '$79' : '$99',
      period: '/mo',
      billedNote: isAnnual ? 'Billed annually ($948/yr)' : 'Billed monthly, cancel anytime',
      description: 'Enterprise scale, custom data models, and dedicated edge SLAs.',
      features: [
        'Unlimited bot validations / month',
        'Zero-day bot signatures & domain models',
        'Managed Cloudflare Edge Proxy routing',
        '1-year attack retention & custom SLA',
        'Dedicated security architect & Slack channel',
      ],
      cta: 'Get Business',
      popular: false,
      href: '/dashboard/settings',
      buttonClass:
        'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 hover:border-white/20',
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#06B6D4] font-semibold">
            Predictable Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Simple, Transparent Tiers
          </h2>
          <p className="text-zinc-400 text-base mt-3 leading-relaxed">
            Protect your proprietary data today. Scale seamlessly as your traffic expands.
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full border border-white/10 bg-zinc-900/80 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !isAnnual
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isAnnual
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/20 text-[#10B981] border border-emerald-500/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3-Tier Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl flex flex-col justify-between p-7 backdrop-blur-xl transition-all duration-300 ${
                tier.popular
                  ? 'border-2 border-[#06B6D4] bg-zinc-900/80 shadow-[0_0_50px_-12px_rgba(6,182,212,0.3)] md:-translate-y-2'
                  : 'border border-white/10 bg-zinc-900/60 hover:border-white/20'
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#06B6D4] to-[#10B981] px-3.5 py-0.5 text-xs font-bold text-zinc-950 shadow-md">
                    <Sparkles className="h-3 w-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  {tier.name === 'Pro' && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                      Recommended
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  {tier.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-white/5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
                      {tier.price}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">{tier.period}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-1">
                    {tier.billedNote}
                  </div>
                </div>

                {/* Crisp Bullet Points */}
                <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-[#10B981]" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action CTA Button */}
              <button
                type="button"
                onClick={() => handlePlanClick(tier.name)}
                disabled={loadingTier !== null}
                className={`w-full py-2.5 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 ${tier.buttonClass}`}
              >
                {loadingTier === (tier.name === 'Business' ? 'BUSINESS' : 'PRO') ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Connecting to Polar...</span>
                  </>
                ) : (
                  <>
                    <span>{tier.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Guarantee and MoR Trust Badge */}
        <div className="mt-14 max-w-xl mx-auto rounded-2xl border border-white/5 bg-zinc-900/40 p-4 sm:p-5 backdrop-blur-md text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4" />
              14-Day Money-Back Guarantee
            </span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span>1-Click Portal Cancellation</span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span>Polar.sh MoR Security</span>
          </div>
        </div>
      </div>
    </section>
  );
}
