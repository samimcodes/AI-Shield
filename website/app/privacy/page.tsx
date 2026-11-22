import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Lock, Database, EyeOff, UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | AI-Shield',
  description: 'Privacy Policy and data protection practices for AI-Shield.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-white/10">
              <Shield className="h-3.5 w-3.5 text-[#06B6D4]" />
            </div>
            <span className="font-semibold text-sm text-white">AI-Shield Legal</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 pb-8 border-b border-white/10">
          <span className="text-xs font-mono uppercase tracking-wider text-[#10B981]">Data Privacy & Security</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            Last Updated: March 2026 • GDPR & CCPA Compliant
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-2 text-[#10B981] font-semibold text-sm mb-1">
              <EyeOff className="h-4 w-4" />
              <span>Zero PII Logging</span>
            </div>
            <p className="text-xs text-zinc-400">
              We never inspect, log, or store personal visitor data, request bodies, or browsing histories.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-2 text-[#06B6D4] font-semibold text-sm mb-1">
              <Lock className="h-4 w-4" />
              <span>Cryptographic Hashing</span>
            </div>
            <p className="text-xs text-zinc-400">
              Bot identifiers and IP signatures are salted and SHA-256 hashed before edge analysis.
            </p>
          </div>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Introduction</h2>
            <p>
              AI-Shield (&quot;we&quot;, &quot;us&quot;) is committed to protecting your privacy and maintaining the highest standard of data security. This Privacy Policy explains what information we collect when you use our website, dashboard, SDK, or edge API, and how that information is handled.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. What Information We Collect</h2>
            <p>We believe in radical data minimization. We only collect the minimal technical data required to authenticate subscriptions and prevent bot attacks:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>
                <strong>Customer Account Information:</strong> When you sign up or subscribe, we receive your email address and name. Payment details (credit cards, billing addresses) are handled exclusively by Polar.sh; we never see or store your full card details.
              </li>
              <li>
                <strong>API Keys & Usage Counters:</strong> We store your randomly generated API keys (<code className="text-zinc-200">as_live_...</code>), associated plan tier, and monthly validation request count.
              </li>
              <li>
                <strong>Bot Mitigation Logs:</strong> When an AI crawler is blocked or poisoned, we record the crawler name (e.g., GPTBot), target path, action taken (<code className="text-[#10B981]">BLOCKED</code> or <code className="text-[#06B6D4]">POISONED</code>), estimated bandwidth saved, and timestamp.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. What We Do NOT Collect</h2>
            <p>
              We do not track end-user browsing habits, cookie identifiers, or request payloads of regular human visitors. AI-Shield operates as an edge gatekeeper solely distinguishing AI bot agents from legitimate human web traffic.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Payment Processing with Polar.sh</h2>
            <p>
              All customer transactions are processed through <strong>Polar Software Inc. (Polar.sh)</strong>, acting as our Merchant of Record. Polar adheres to PCI-DSS Level 1 compliance standards. Please refer to <a href="https://polar.sh/legal/privacy" target="_blank" rel="noreferrer" className="text-[#06B6D4] hover:underline">Polar.sh Privacy Policy</a> for full details on transaction data handling.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Data Retention & Deletion</h2>
            <p>
              Bot log entries are retained based on your subscription tier (24 hours for Free, 90 days for Pro, custom retention for Business). You may request full account and data deletion at any time by contacting our privacy team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">6. Contact Us</h2>
            <p>
              For privacy-related inquiries, data access, or deletion requests, email us at <a href="mailto:privacy@getaishield.dev" className="text-[#06B6D4] hover:underline">privacy@getaishield.dev</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
