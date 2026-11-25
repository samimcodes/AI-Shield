'use client';

import React, { useState } from 'react';
import {
  Key,
  Code2,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Globe,
  Server,
  Cloud,
  CheckCheck,
} from 'lucide-react';

interface OnboardingWizardProps {
  apiKey?: string;
  onVerified?: () => void;
}

export default function OnboardingWizard({
  apiKey = 'as_live_8f3a992bc401e74a89d9e2',
  onVerified,
}: OnboardingWizardProps) {
  const [activeTab, setActiveTab] = useState<'website' | 'node' | 'cloudflare'>('website');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ai-shield-dev.vercel.app';

  const snippets = {
    website: `<!-- Place before </head> or </body> in WordPress, Webflow, Shopify, or plain HTML -->
<script src="${origin}/api/shield.js?key=${apiKey}" async></script>`,
    node: `// Express.js, Next.js (App Router / Pages), or Node.js server
import { aiShield } from '@samimcodes/ai-shield';

app.use(aiShield({
  apiKey: "${apiKey}",
  poisonContentType: "HTML"
}));`,
    cloudflare: `// Cloudflare Worker / Edge Gateway
import { aiShieldWorker } from '@samimcodes/ai-shield';

export default {
  fetch: aiShieldWorker({
    apiKey: "${apiKey}",
    origin: "https://origin.yourdomain.com"
  })
};`,
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (res.ok && data.connected) {
        setIsVerified(true);
        onVerified?.();
      } else {
        setVerifyError(data.error || 'Verification failed. Check your API key.');
      }
    } catch {
      setVerifyError('Network error while verifying API key.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl shadow-2xl p-6 sm:p-8 mb-8 transition-all">
      {/* Top Header & Collapse Toggle */}
      <div className="flex items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-[#06B6D4] border border-cyan-500/20">
              <Sparkles className="h-3 w-3" />
              <span>Quick Onboarding</span>
            </span>
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
                <Check className="h-3 w-3" />
                <span>Installation Verified</span>
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Install AI-Shield in 3 Simple Steps
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Follow the steps below to protect your website and start poisoning AI scrapers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 bg-zinc-950 flex items-center gap-1 shrink-0 transition-colors"
        >
          <span>{isCollapsed ? 'Show Guide' : 'Hide Guide'}</span>
          {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="pt-6 space-y-8">
          {/* Step 1: Auto-generated API Key */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400">
                1
              </div>
              <h3 className="text-sm font-semibold text-white">
                Your Secret Live API Key
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3 ml-7">
              Use this key to authenticate your site with the AI-Shield control plane.
            </p>

            <div className="ml-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-xl">
              <div className="flex-1 flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-2.5 font-mono text-xs text-zinc-200 select-all">
                <span className="text-emerald-400 truncate">{apiKey}</span>
                <span className="text-[10px] uppercase font-mono text-zinc-500 ml-2 shrink-0">Live Key</span>
              </div>
              <button
                type="button"
                onClick={handleCopyKey}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-2.5 text-xs transition-colors shrink-0"
              >
                {copiedKey ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5 text-[#10B981]" />
                    <span className="text-[#10B981]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Key</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Tabbed Integration Code Box */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400">
                2
              </div>
              <h3 className="text-sm font-semibold text-white">
                Choose Your Integration Method
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3 ml-7">
              Select your platform and paste the ready-to-use snippet into your project.
            </p>

            <div className="ml-7 rounded-xl border border-white/10 bg-zinc-950/90 overflow-hidden max-w-3xl">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/60 px-3 py-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('website')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'website'
                        ? 'bg-zinc-800 text-[#06B6D4] shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Website / WordPress (&lt;script&gt;)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('node')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'node'
                        ? 'bg-zinc-800 text-[#06B6D4] shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Server className="h-3.5 w-3.5" />
                    <span>Next.js / Node (npm)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('cloudflare')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'cloudflare'
                        ? 'bg-zinc-800 text-[#06B6D4] shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Cloud className="h-3.5 w-3.5" />
                    <span>Cloudflare Worker</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded transition-colors"
                  title="Copy Snippet"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#10B981]" />
                      <span className="text-[#10B981]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet */}
              <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-zinc-300 leading-relaxed">
                  {snippets[activeTab]}
                </pre>
              </div>
            </div>
          </div>

          {/* Step 3: Verify Installation */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400">
                3
              </div>
              <h3 className="text-sm font-semibold text-white">
                Verify Installation & Status
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3 ml-7">
              Ping the protection engine to confirm honeypots and bot traps are live.
            </p>

            <div className="ml-7 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="inline-flex items-center gap-2 rounded-xl bg-[#06B6D4] hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-semibold px-5 py-2.5 text-xs transition-all shadow-sm shadow-cyan-500/25 active:scale-[0.98]"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Connection...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verify Installation</span>
                  </>
                )}
              </button>

              {isVerified && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-[#10B981] animate-in fade-in duration-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Connected! AI-Shield is actively defending your site.</span>
                </div>
              )}

              {verifyError && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-medium text-red-300">
                  <span>{verifyError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
