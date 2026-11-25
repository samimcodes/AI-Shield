import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Refund Policy | AI-Shield',
  description: '14-Day Money Back Guarantee and Refund Policy for AI-Shield subscriptions.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-300">
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
          <span className="text-xs font-mono uppercase tracking-wider text-[#06B6D4]">Customer Guarantee</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            Clear, transparent 14-day money-back guarantee.
          </p>
        </div>

        {/* Guarantee Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:p-6 mb-10 flex items-start gap-4 backdrop-blur-xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-300">14-Day Money-Back Guarantee</h3>
            <p className="text-xs text-emerald-400/90 mt-1 leading-relaxed">
              We stand behind AI-Shield. If you are not completely satisfied with our bot mitigation or dynamic data poisoning capabilities within the first 14 days of your initial paid subscription, we will issue a full refund — no hassle.
            </p>
          </div>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Eligibility for Refunds</h2>
            <p>
              Refund requests apply to initial purchases of paid subscription tiers (<strong>Pro Plan</strong> at $29/mo or <strong>Business Plan</strong> at $99/mo) made within 14 calendar days of the original transaction date. Subsequent renewal billing cycles are eligible for cancellation at any time to prevent future charges.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. How to Request a Refund</h2>
            <p>You can request a refund through either of the following methods:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>
                <strong>Direct Email:</strong> Email <a href="mailto:mdsamimhosen827@gmail.com" className="text-[#06B6D4] hover:underline">mdsamimhosen827@gmail.com</a> with your account email address and order number. Our support team typically responds within 24 business hours.
              </li>
              <li>
                <strong>Polar.sh Customer Portal:</strong> Click &quot;Manage Orders&quot; on your official Polar receipt email or access the <a href="/api/portal" target="_blank" rel="noreferrer" className="text-[#06B6D4] hover:underline">Polar.sh Customer Portal</a> to submit a dispute or refund request directly.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Processing Time</h2>
            <p>
              Once approved, refunds are credited back to your original payment method (Credit Card, Debit Card, or PayPal) via Polar.sh within <strong>3 to 5 business days</strong>, depending on your card issuer or banking institution.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Subscription Cancellations</h2>
            <p>
              You may cancel your recurring subscription at any moment without penalty. Upon cancellation, your Pro or Business features and quota will remain active until the end of your paid billing period, after which your account automatically reverts to the Free tier.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Abuse or Chargeback Policy</h2>
            <p>
              We encourage you to reach out to our team first before filing an unauthorized chargeback with your bank so we can resolve any issues directly and quickly. Accounts engaged in fraudulent activity or repeated abuse of the guarantee may be subject to termination.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
