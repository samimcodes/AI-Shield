'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Copy, Check, Terminal, Globe, Server, Cloud, Code2, ExternalLink } from 'lucide-react';

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono text-zinc-300">Documentation</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#06B6D4] hover:bg-cyan-400 text-zinc-950 font-semibold px-3.5 py-1.5 text-xs transition-colors"
            >
              <span>Open Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Docs Layout */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          {/* Left Sticky Navigation */}
          <aside className="hidden md:block sticky top-24 space-y-1 text-xs font-medium text-zinc-400">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-2">
              Setup Guides
            </div>
            <a href="#overview" className="block py-1.5 hover:text-white transition-colors">
              Overview & Threat Model
            </a>
            <a href="#script-tag" className="block py-1.5 hover:text-white transition-colors">
              1. Website & WordPress (&lt;script&gt;)
            </a>
            <a href="#nextjs" className="block py-1.5 hover:text-white transition-colors">
              2. Next.js App Router
            </a>
            <a href="#express" className="block py-1.5 hover:text-white transition-colors">
              3. Express.js Middleware
            </a>
            <a href="#cloudflare" className="block py-1.5 hover:text-white transition-colors">
              4. Cloudflare Worker Edge
            </a>
            <a href="#seo-safety" className="block py-1.5 hover:text-white transition-colors">
              5. SEO Whitelist Guarantee
            </a>
          </aside>

          {/* Main Docs Content */}
          <div className="md:col-span-3 space-y-12">
            {/* Overview */}
            <section id="overview" className="space-y-4">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                AI-Shield Integration Guide
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                AI-Shield protects web applications and websites against unauthorized AI training scrapers (GPTBot, ClaudeBot, ByteSpider, Perplexity) by serving them plausible synthetic poisoned data under <strong>HTTP 200 OK</strong> while strictly preserving SEO for verified search engines (Googlebot, Bingbot).
              </p>
            </section>

            {/* Guide 1: Script Tag */}
            <section id="script-tag" className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#06B6D4]" />
                <h2 className="text-xl font-bold text-white tracking-tight">
                  1. Website & WordPress Setup (&lt;script&gt;)
                </h2>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                For non-technical creators and sites powered by WordPress, Webflow, Shopify, or plain HTML, install AI-Shield with a single script tag before your <code className="text-cyan-400">&lt;/head&gt;</code> or <code className="text-cyan-400">&lt;/body&gt;</code> tag:
              </p>

              <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 relative font-mono text-xs text-zinc-300">
                <button
                  type="button"
                  onClick={() =>
                    copyCode(
                      'script',
                      '<script src="https://ai-shield.dev/api/shield.js?key=YOUR_API_KEY" async></script>'
                    )
                  }
                  className="absolute top-3 right-3 text-zinc-400 hover:text-white"
                >
                  {copiedSection === 'script' ? (
                    <Check className="h-4 w-4 text-[#10B981]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <pre className="overflow-x-auto pr-8">
                  {`<script src="https://ai-shield.dev/api/shield.js?key=YOUR_API_KEY" async></script>`}
                </pre>
              </div>
            </section>

            {/* Guide 2: Next.js */}
            <section id="nextjs" className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-[#06B6D4]" />
                <h2 className="text-xl font-bold text-white tracking-tight">
                  2. Next.js Middleware Setup
                </h2>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Protect your Next.js application at the edge. Create or update <code className="text-cyan-400">middleware.ts</code> in your project root:
              </p>

              <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 relative font-mono text-xs text-zinc-300">
                <button
                  type="button"
                  onClick={() =>
                    copyCode(
                      'nextjs',
                      `import { NextResponse, type NextRequest } from 'next/server';
import { BotDetector, PoisonEngine } from '@samimcodes/ai-shield';

const detector = new BotDetector();
const poison = new PoisonEngine('JSON');

export function middleware(req: NextRequest) {
  const detection = detector.detect(Object.fromEntries(req.headers.entries()));

  if (detection.category === 'AI_CRAWLER' || detection.score >= 50) {
    const payload = poison.generate(req.nextUrl.pathname, 'JSON');
    return new NextResponse(payload.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};`
                    )
                  }
                  className="absolute top-3 right-3 text-zinc-400 hover:text-white"
                >
                  {copiedSection === 'nextjs' ? (
                    <Check className="h-4 w-4 text-[#10B981]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <pre className="overflow-x-auto pr-8">
{`import { NextResponse, type NextRequest } from 'next/server';
import { BotDetector, PoisonEngine } from '@samimcodes/ai-shield';

const detector = new BotDetector();
const poison = new PoisonEngine('JSON');

export function middleware(req: NextRequest) {
  const detection = detector.detect(Object.fromEntries(req.headers.entries()));

  if (detection.category === 'AI_CRAWLER' || detection.score >= 50) {
    const payload = poison.generate(req.nextUrl.pathname, 'JSON');
    return new NextResponse(payload.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return NextResponse.next();
}`}
                </pre>
              </div>
            </section>

            {/* Guide 3: Express.js */}
            <section id="express" className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-[#06B6D4]" />
                <h2 className="text-xl font-bold text-white tracking-tight">
                  3. Express.js Drop-in Middleware
                </h2>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Add AI-Shield to your Node.js / Express backend with 3 lines of code:
              </p>

              <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 relative font-mono text-xs text-zinc-300">
                <button
                  type="button"
                  onClick={() =>
                    copyCode(
                      'express',
                      `import express from 'express';
import { aiShield } from '@samimcodes/ai-shield';

const app = express();

app.use(aiShield({
  apiKey: 'as_live_YOUR_KEY',
  poisonContentType: 'HTML',
  injectHoneypotLinks: true,
}));

app.listen(3000);`
                    )
                  }
                  className="absolute top-3 right-3 text-zinc-400 hover:text-white"
                >
                  {copiedSection === 'express' ? (
                    <Check className="h-4 w-4 text-[#10B981]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <pre className="overflow-x-auto pr-8">
{`import express from 'express';
import { aiShield } from '@samimcodes/ai-shield';

const app = express();

app.use(aiShield({
  apiKey: 'as_live_YOUR_KEY',
  poisonContentType: 'HTML',
  injectHoneypotLinks: true,
}));

app.listen(3000);`}
                </pre>
              </div>
            </section>

            {/* Guide 4: Cloudflare Workers */}
            <section id="cloudflare" className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-[#06B6D4]" />
                <h2 className="text-xl font-bold text-white tracking-tight">
                  4. Cloudflare Worker Edge Gateway
                </h2>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Deploy as a reverse proxy in front of any domain without changing your origin server code:
              </p>

              <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 relative font-mono text-xs text-zinc-300">
                <button
                  type="button"
                  onClick={() =>
                    copyCode(
                      'cf',
                      `export default {
  async fetch(request, env) {
    const userAgent = request.headers.get('User-Agent') || '';
    const isAiBot = /GPTBot|Claude-Web|ByteSpider|PerplexityBot/i.test(userAgent);

    if (isAiBot) {
      return new Response(JSON.stringify({ status: 200, synthetic: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex' },
      });
    }

    return fetch(request);
  },
};`
                    )
                  }
                  className="absolute top-3 right-3 text-zinc-400 hover:text-white"
                >
                  {copiedSection === 'cf' ? (
                    <Check className="h-4 w-4 text-[#10B981]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <pre className="overflow-x-auto pr-8">
{`export default {
  async fetch(request, env) {
    const userAgent = request.headers.get('User-Agent') || '';
    const isAiBot = /GPTBot|Claude-Web|ByteSpider|PerplexityBot/i.test(userAgent);

    if (isAiBot) {
      return new Response(JSON.stringify({ status: 200, synthetic: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex' },
      });
    }

    return fetch(request);
  },
};`}
                </pre>
              </div>
            </section>

            {/* Guide 5: SEO Whitelist Guarantee */}
            <section id="seo-safety" className="space-y-4 pt-6 border-t border-white/5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                5. Zero SEO Disruption Guarantee
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Legitimate search engine bots (Googlebot, Bingbot, DuckDuckBot, Applebot, Yahoo! Slurp, Baiduspider) are evaluated in an O(1) hash lookup set before any pattern matching or heuristic checks run. They are guaranteed to pass through completely unintercepted with zero added latency.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
