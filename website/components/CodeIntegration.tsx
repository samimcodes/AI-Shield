'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, Code, Sparkles } from 'lucide-react';

export default function CodeIntegration() {
  const [activeTab, setActiveTab] = useState<'express' | 'nextjs' | 'fastify'>('express');
  const [copied, setCopied] = useState(false);

  const snippets = {
    express: `import express from 'express';
import { aiShield } from '@samimcodes/ai-shield';

const app = express();

// 🛡️ 3-Line Drop-in AI Defense
app.use(aiShield({
  poisonContentType: 'HTML',    // 'HTML' | 'JSON' | 'SITEMAP'
  injectHoneypotLinks: true,    // Injects invisible trap links
  excludePaths: ['/health'],    // Exclude DevOps health checks
}));

// Real routes are completely protected from AI scrapers
app.get('/api/products', (req, res) => res.json({ secretCatalog: [...] }));
app.listen(3000);`,

    nextjs: `// middleware.ts (Next.js App Router & Edge)
import { NextResponse, type NextRequest } from 'next/server';
import { BotDetector, PoisonEngine } from '@samimcodes/ai-shield';

const detector = new BotDetector();
const poison = new PoisonEngine('JSON');

export function middleware(req: NextRequest) {
  // 🛡️ Sub-2ms Edge Interception
  const detection = detector.detect(Object.fromEntries(req.headers.entries()));
  
  if (detection.category === 'AI_CRAWLER' || detection.score >= 50) {
    const payload = poison.generate(req.nextUrl.pathname, 'JSON');
    return new NextResponse(payload.body, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex' },
    });
  }

  return NextResponse.next();
}

export const config = { matcher: ['/api/:path*', '/catalog/:path*'] };`,

    fastify: `import Fastify from 'fastify';
import { createAiShield } from '@samimcodes/ai-shield';

const fastify = Fastify();

// 🛡️ Middleware hook integration
fastify.addHook('onRequest', async (req, reply) => {
  const shield = createAiShield();
  shield(req.raw, reply.raw, (err) => {
    if (err) reply.send(err);
  });
});

fastify.get('/api/data', async () => ({ proprietaryAssets: [...] }));
await fastify.listen({ port: 3000 });`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="integration" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3">
            <Code className="h-3.5 w-3.5" />
            <span>Developer Friendly</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Drop-in Integration in Under 3 Minutes
          </h2>
          <p className="mt-3 text-slate-300 text-base sm:text-lg">
            No reverse proxy reconfiguration or cloud WAF vendor lock-in. Just install the npm package
            and mount the middleware.
          </p>
        </div>

        {/* Code Box Container */}
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#0b101d] shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Tabs Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-3 gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('express')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-all ${
                  activeTab === 'express'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Express.js (Node.js)
              </button>
              <button
                onClick={() => setActiveTab('nextjs')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-all ${
                  activeTab === 'nextjs'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Next.js (App Router / Edge)
              </button>
              <button
                onClick={() => setActiveTab('fastify')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-all ${
                  activeTab === 'fastify'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Fastify
              </button>
            </div>

            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Window */}
          <div className="p-6 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed bg-black/60 text-slate-200">
            <pre className="text-cyan-100 font-mono">
              <code>{snippets[activeTab]}</code>
            </pre>
          </div>

          {/* Quick highlight bar */}
          <div className="flex items-center justify-between border-t border-white/10 bg-slate-900/60 px-6 py-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              TypeScript strict mode ESM & CJS dual exports ready
            </span>
            <span className="font-mono text-emerald-400">0 dependencies needed for edge runtime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
