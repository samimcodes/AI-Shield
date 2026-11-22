import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | AI-Shield',
  description: 'Terms of Service and Customer Agreement for AI-Shield autonomous bot protection platform.',
};

export default function TermsPage() {
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
          <span className="text-xs font-mono uppercase tracking-wider text-[#06B6D4]">Legal Documentation</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Terms of Service
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            Last Updated: March 2026 • Effective Date: March 1, 2026
          </p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using the services provided by AI-Shield (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), including our website at getaishield.dev, API endpoints, npm package (<code className="text-[#06B6D4]">@samimcodes/ai-shield</code>), CDN script (<code className="text-[#06B6D4]">shield.js</code>), and related software, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Description of Service</h2>
            <p>
              AI-Shield provides an autonomous AI crawler defense and data protection engine designed to identify, block, and poison unauthorized automated scrapers (such as GPTBot, ClaudeBot, PerplexityBot, ByteDance, and CCBot) traversing web applications. The service is provided across Free, Pro, and Business subscription tiers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Accounts and API Keys</h2>
            <p>
              To access protected features and SaaS quota validation, you must obtain a valid API key prefixed with <code className="text-zinc-200">as_live_</code>. You are solely responsible for maintaining the confidentiality of your API keys and account credentials. Any activity conducted using your API key will be deemed authorized by you. We reserve the right to revoke any API key found to be engaged in abuse, reverse-engineering, or unauthorized redistribution.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Subscriptions, Payments & Merchant of Record</h2>
            <p>
              Our order process and recurring billing are conducted by our Merchant of Record, <strong>Lemon Squeezy</strong> (Lemon Squeezy LLC). Lemon Squeezy provides customer service inquiries and handles all payment processing, currency conversion, VAT, and sales tax compliance.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li><strong>Billing Cycle:</strong> Subscriptions are billed on a recurring monthly or annual basis unless cancelled prior to the renewal date.</li>
              <li><strong>Plan Upgrades:</strong> Upgrades take effect immediately, unlocking higher request limits and advanced features (such as dynamic data poisoning).</li>
              <li><strong>Cancellation:</strong> You may cancel your subscription at any time via the Lemon Squeezy Customer Portal accessible directly inside your Dashboard Settings.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Acceptable Use Policy</h2>
            <p>
              You agree not to use AI-Shield to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Interfere with, disrupt, or launch denial-of-service attacks against our edge validation infrastructure.</li>
              <li>Attempt to circumvent subscription usage limits or manipulate bot count reporting metrics.</li>
              <li>Transmit unlawful, defamatory, or infringing content through poisoning response payloads.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">6. Service Level and Fair Usage</h2>
            <p>
              We strive for 99.9% uptime on our edge validation endpoints. Free plans are capped at 5,000 requests per monthly billing window. When limits are reached, the SDK gracefully falls back to basic protection without breaking customer websites. Pro plans include 500,000 monthly validations with guaranteed edge prioritization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, AI-Shield and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">8. Contact Information</h2>
            <p>
              If you have any questions or concerns regarding these Terms, please contact our support team at <a href="mailto:support@getaishield.dev" className="text-[#06B6D4] hover:underline">support@getaishield.dev</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
