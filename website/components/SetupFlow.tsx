'use client';

import React, { useState } from 'react';
import { Key, Code2, ShieldCheck, Copy, Check, Terminal, Radio } from 'lucide-react';

export default function SetupFlow() {
  const [activeTab, setActiveTab] = useState<'express' | 'nextjs' | 'cloudflare' | 'html'>('express');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const codeSnippets = {
    express: `import express from 'express';
import { aiShield } from '@samimcodes/ai-shield';

const app = express();
app.use(aiShield({ apiKey: 'as_live_7x89c4...' }));`,
    nextjs: `// middleware.ts
import { aiShield } from '@samimcodes/ai-shield';

export const middleware = aiShield({
  apiKey: 'as_live_7x89c4...',
});`,
    cloudflare: `// worker.ts
import { aiShieldWorker } from '@samimcodes/ai-shield';

export default aiShieldWorker({
  apiKey: 'as_live_7x89c4...',
});`,
    html: `<!-- Paste before </head> in WordPress, Shopify, Webflow or HTML -->
<script src="https://ai-shield-dev.vercel.app/api/shield.js?key=as_live_7x89c4..." async></script>`,
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('as_live_7x89c49120e5ff38a');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="how-it-works" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#06B6D4] font-semibold">
            Seamless Setup
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Up and Running in 3 Steps
          </h2>
          <p className="text-zinc-400 text-base mt-3 leading-relaxed">
            Protect your website from unauthorized AI scrapers with zero architectural friction.
          </p>
        </div>

        {/* 3-Step Visual Setup Flow (Clean Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-white/20 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-zinc-500 tracking-wider">
                  STEP 01
                </span>
                <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center">
                  <Key className="h-4 w-4 text-[#06B6D4]" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Create a free account & get your API key
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate your secret <code className="text-cyan-400 font-mono">as_live_</code> production key instantly. No credit card required.
              </p>
            </div>

            {/* Simulated Key Card */}
            <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950/80 p-3.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  Live API Key
                </span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="text-zinc-400 hover:text-white transition-colors"
                  title="Copy Key"
                >
                  {copiedKey ? <Check className="h-3 w-3 text-[#10B981]" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <div className="font-mono text-xs text-zinc-200 select-all truncate">
                as_live_7x89c49120e5ff38a
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-white/20 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-zinc-500 tracking-wider">
                  STEP 02
                </span>
                <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center">
                  <Code2 className="h-4 w-4 text-[#06B6D4]" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Paste 1 line of code
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Plug into Express, Next.js, or Cloudflare Workers. It intercepts crawlers before they touch your application.
              </p>
            </div>

            {/* Interactive Code Switcher */}
            <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950/80 p-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 text-[10px] font-mono">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('express')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      activeTab === 'express'
                        ? 'bg-zinc-800 text-cyan-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Express
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('nextjs')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      activeTab === 'nextjs'
                        ? 'bg-zinc-800 text-cyan-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Next.js
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cloudflare')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      activeTab === 'cloudflare'
                        ? 'bg-zinc-800 text-cyan-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Cloudflare
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('html')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      activeTab === 'html'
                        ? 'bg-zinc-800 text-cyan-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    HTML / Script
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-zinc-400 hover:text-white"
                  title="Copy Snippet"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-[#10B981]" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <pre className="font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">
                {codeSnippets[activeTab]}
              </pre>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-white/20 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-zinc-500 tracking-wider">
                  STEP 03
                </span>
                <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-[#10B981]" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Watch AI bots get blocked & poisoned
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Feed AI crawlers synthetic hallucinations under HTTP 200 OK while strictly preserving SEO for Googlebot.
              </p>
            </div>

            {/* Live Ticker Feed */}
            <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950/80 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <Radio className="h-3 w-3 text-[#10B981] animate-pulse" />
                  <span className="text-zinc-300 font-mono">GPTBot (OpenAI)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
                  200 Poisoned
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <Radio className="h-3 w-3 text-[#10B981] animate-pulse" />
                  <span className="text-zinc-300 font-mono">ClaudeBot</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
                  200 Poisoned
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span className="text-zinc-300 font-mono">Googlebot</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  SEO Allowed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
