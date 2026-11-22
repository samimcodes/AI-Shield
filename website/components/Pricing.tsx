'use client';

import React from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function Pricing() {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      description: 'Essential protection for indie projects and personal sites.',
      features: [
        '5,000 bot hits / month',
        'Basic GPTBot block & poison',
        '24-hour log retention',
        'Community Discord support',
      ],
      cta: 'Start Free',
      popular: false,
      buttonClass:
        'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 hover:border-white/20',
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/mo',
      description: 'Comprehensive defense for high-value SaaS, blogs & digital media.',
      features: [
        '500,000 bot hits / month',
        'All AI bots blocked (GPTBot, Claude, ByteDance, Meta)',
        'Dynamic Data Poisoning (HTTP 200 synthetic data)',
        '90-day analytics & instant email alerts',
      ],
      cta: 'Upgrade to Pro',
      popular: true,
      buttonClass:
        'bg-[#06B6D4] hover:bg-cyan-400 text-zinc-950 font-semibold shadow-lg shadow-cyan-500/25',
    },
    {
      name: 'Business',
      price: '$99',
      period: '/mo',
      description: 'Enterprise scale, custom proxies & mission-critical reliability.',
      features: [
        'Unlimited bot hits / month',
        'Cloudflare Edge Proxy & custom rules',
        '99.99% uptime SLA guarantee',
        'Dedicated security architect & priority support',
      ],
      cta: 'Contact Sales',
      popular: false,
      buttonClass:
        'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 hover:border-white/20',
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#06B6D4] font-semibold">
            Predictable Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Simple, Transparent Tiers
          </h2>
          <p className="text-zinc-400 text-base mt-3 leading-relaxed">
            Protect your proprietary data today. Scale seamlessly as your traffic expands.
          </p>
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
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#06B6D4] px-3 py-0.5 text-xs font-bold text-zinc-950 shadow-md">
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
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Recommended
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  {tier.description}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-white/5">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                    {tier.price}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">{tier.period}</span>
                </div>

                {/* Crisp 4-5 Bullet Points */}
                <ul className="space-y-3.5 text-xs text-zinc-300 mb-8">
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
              <a
                href="https://github.com/samimcodes/ai-shield"
                className={`w-full py-2.5 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${tier.buttonClass}`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
