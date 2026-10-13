'use client';

import React from 'react';
import { Check, Zap, Sparkles, Shield, ArrowRight } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Developer',
      price: '$0',
      period: 'forever free',
      description: 'Ideal for open-source projects, indie hackers, and small web applications.',
      features: [
        'Up to 10,000 intercepted requests / mo',
        'Basic synthetic poison generator (HTML & JSON)',
        'Built-in SEO whitelist (Googlebot, Bingbot)',
        'Core user-agent & header heuristic rules',
        'Standard in-memory honeypot registry',
        'Community Discord & GitHub support',
      ],
      cta: 'Install Open Source',
      highlight: false,
      badge: 'Free Tier',
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'For growing SaaS and high-traffic businesses defending proprietary data.',
      features: [
        'Unlimited bot interceptions & data poisoning',
        'Contextual academic & financial poison engines',
        'Custom Telemetry API & real-time webhook flusher',
        'Priority weekly AI crawler fingerprint updates',
        'Multi-route honeypot trap network generator',
        'Dashboard metrics & attack analytics',
        'Standard email & priority support',
      ],
      cta: 'Start 14-Day Free Trial',
      highlight: true,
      badge: 'Most Popular',
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      description: 'For mission-critical digital media, e-commerce, and high-frequency data publishers.',
      features: [
        'Custom fine-tuned synthetic hallucination LLM',
        'Reverse DNS cryptographic Googlebot verification',
        'Global distributed Redis/Valkey IP trap sync',
        'Dedicated Slack channel & security architect',
        '99.99% uptime SLA guarantee',
        'SOC2 Type II & HIPAA compliance assistance',
      ],
      cta: 'Contact Architecture Team',
      highlight: false,
      badge: 'Custom Scale',
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Stop Scraping Without Breaking Your Budget
          </h2>
          <p className="mt-3 text-slate-300 text-base sm:text-lg">
            Start for free in development. Scale with enterprise threat feeds and centralized telemetry.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl p-8 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between ${
                plan.highlight
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-2 border-cyan-500/60 shadow-2xl shadow-cyan-500/15 lg:-translate-y-2'
                  : 'bg-slate-900/40 border border-white/10 hover:border-white/20'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 px-3.5 py-0.5 text-xs font-extrabold text-slate-950 uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  {!plan.highlight && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/{plan.period}</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/10">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <a
                  href="#simulator"
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 active:scale-[0.98]'
                      : 'border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 active:scale-[0.98]'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
