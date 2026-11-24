'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import {
  Shield,
  ArrowLeft,
  Copy,
  Check,
  Terminal,
  Globe,
  Server,
  Cloud,
  Code2,
  Zap,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface CodeBlockProps {
  id: string;
  filename: string;
  language: string;
  code: string;
  copiedId: string | null;
  onCopy: (id: string, code: string) => void;
}

function CodeBlock({ id, filename, language, code, copiedId, onCopy }: CodeBlockProps) {
  const isCopied = copiedId === id;
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/90 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/70 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-xs font-mono text-zinc-300 ml-1">{filename}</span>
          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-zinc-400 border border-white/5">
            {language}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onCopy(id, code)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          {isCopied ? (
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
      <pre className="p-4 sm:p-5 overflow-x-auto font-mono text-xs leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview & Threat Model', icon: BookOpen },
  { id: 'cli', label: '1. Zero-Config CLI', icon: Terminal },
  { id: 'script-tag', label: '2. Website & WordPress', icon: Globe },
  { id: 'nextjs', label: '3. Next.js Edge Middleware', icon: Server },
  { id: 'express', label: '4. Express.js Middleware', icon: Code2 },
  { id: 'cloudflare', label: '5. Cloudflare Worker', icon: Cloud },
  { id: 'seo-safety', label: '6. SEO Whitelist Guarantee', icon: ShieldCheck },
];

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string>('overview');

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const cliSnippet = `# Install the package
npm install @samimcodes/ai-shield

# Or run the automatic zero-config setup wizard
npx @samimcodes/ai-shield init

# Simulate a GPTBot attack against your server
npx @samimcodes/ai-shield test http://localhost:3000`;

  const scriptSnippet = `<!-- Place before </head> or </body> in WordPress, Webflow, Shopify, or HTML -->
<script src="https://ai-shield-dev.vercel.app/api/shield.js?key=YOUR_API_KEY" async></script>`;

  const nextjsSnippet = `import { NextResponse, type NextRequest } from 'next/server';
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
};`;

  const expressSnippet = `import express from 'express';
import { aiShield } from '@samimcodes/ai-shield';

const app = express();

app.use(aiShield({
  apiKey: 'as_live_YOUR_KEY',
  poisonContentType: 'HTML',
  injectHoneypotLinks: true,
  enableDashboard: true, // Opens live monitor at /admin/ai-shield
}));

app.get('/api/products', (req, res) => {
  res.json({ status: 'ok', data: 'Protected enterprise content' });
});

app.listen(3000);`;

  const cfSnippet = `export default {
  async fetch(request, env) {
    const userAgent = request.headers.get('User-Agent') || '';
    const isAiBot = /GPTBot|Claude-Web|ClaudeBot|ByteSpider|PerplexityBot/i.test(userAgent);

    if (isAiBot) {
      return new Response(JSON.stringify({ status: 200, synthetic: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
    }

    return fetch(request);
  },
};`;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Sticky Header */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-white/10">
                <Shield className="h-3.5 w-3.5 text-[#06B6D4]" />
              </div>
              <span className="font-semibold text-sm text-white">AI-Shield Docs</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
                v0.3.3
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-block text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#06B6D4] hover:bg-cyan-400 text-zinc-950 font-semibold px-3.5 py-1.5 text-xs transition-all shadow-sm shadow-cyan-500/20"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Docs Hero Banner */}
      <div className="border-b border-white/10 bg-grid-pattern radial-spotlight py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-mono font-semibold text-cyan-400 mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Developer Documentation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Deploy Autonomous AI Crawler Defense in 60 Seconds
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
              Integrate via 1-line HTML script, Express middleware, Next.js Edge, or Cloudflare Workers. Keep Googlebot happy while silently poisoning unauthorized LLM scrapers.
            </p>

            {/* Quick Stat Pills */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/70 px-3.5 py-2 text-xs">
                <Zap className="h-3.5 w-3.5 text-[#06B6D4]" />
                <span className="font-mono text-white font-semibold">&lt; 1.8ms</span>
                <span className="text-zinc-400">Edge Evaluation</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/70 px-3.5 py-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
                <span className="font-mono text-white font-semibold">100%</span>
                <span className="text-zinc-400">SEO Whitelisted</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/70 px-3.5 py-2 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                <span className="font-mono text-white font-semibold">50+</span>
                <span className="text-zinc-400">AI Bot Signatures</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Docs Grid */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-12">
        {/* Mobile Quick Jump Pills */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-white/10">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveNav(item.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeNav === item.id
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          {/* Left Sticky Sidebar */}
          <aside className="hidden md:block sticky top-24 space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold px-3 mb-3">
              Setup Guides
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white border border-white/10 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isActive ? 'text-[#06B6D4]' : 'text-zinc-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </a>
              );
            })}
          </aside>

          {/* Main Content Sections */}
          <div className="md:col-span-3 space-y-14">
            {/* Overview */}
            <section id="overview" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Overview &amp; Threat Model
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Traditional firewalls return <code className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">403 Forbidden</code>, prompting scraper fleets to immediately rotate residential proxies. AI-Shield instead responds with <code className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">HTTP 200 OK</code> containing realistic synthetic poisoned payloads—silently degrading unauthorized LLM datasets while preserving real content for human visitors and search engines.
              </p>
            </section>

            {/* 1. Zero-Config CLI */}
            <section id="cli" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Terminal className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  1. Zero-Config CLI &amp; NPM Package
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Install <code className="text-cyan-400">@samimcodes/ai-shield</code> or run our interactive setup wizard to inject middleware into your Node.js server automatically:
              </p>
              <CodeBlock
                id="cli"
                filename="terminal"
                language="bash"
                code={cliSnippet}
                copiedId={copiedSection}
                onCopy={copyCode}
              />
            </section>

            {/* 2. Script Tag */}
            <section id="script-tag" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  2. Website &amp; WordPress Setup (&lt;script&gt;)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                For non-Node sites (WordPress, Shopify, Webflow, or static HTML), paste this single script tag before <code className="text-cyan-400">&lt;/head&gt;</code> or <code className="text-cyan-400">&lt;/body&gt;</code>. Replace <code className="text-cyan-400">YOUR_API_KEY</code> with your live key from the Dashboard:
              </p>
              <CodeBlock
                id="script"
                filename="index.html"
                language="html"
                code={scriptSnippet}
                copiedId={copiedSection}
                onCopy={copyCode}
              />
            </section>

            {/* 3. Next.js */}
            <section id="nextjs" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Server className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  3. Next.js Middleware Setup
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Protect your Next.js App Router or Pages Router application at the edge:
              </p>
              <CodeBlock
                id="nextjs"
                filename="middleware.ts"
                language="typescript"
                code={nextjsSnippet}
                copiedId={copiedSection}
                onCopy={copyCode}
              />
            </section>

            {/* 4. Express.js */}
            <section id="express" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Code2 className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  4. Express.js Drop-in Middleware
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Protect all API routes and enable the built-in local security monitor at <code className="text-cyan-400">/admin/ai-shield</code>:
              </p>
              <CodeBlock
                id="express"
                filename="server.ts"
                language="typescript"
                code={expressSnippet}
                copiedId={copiedSection}
                onCopy={copyCode}
              />
            </section>

            {/* 5. Cloudflare */}
            <section id="cloudflare" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Cloud className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  5. Cloudflare Worker Edge Gateway
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Deploy as a zero-latency reverse proxy in front of any origin server:
              </p>
              <CodeBlock
                id="cf"
                filename="worker.ts"
                language="javascript"
                code={cfSnippet}
                copiedId={copiedSection}
                onCopy={copyCode}
              />
            </section>

            {/* 6. SEO Safety */}
            <section id="seo-safety" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <ShieldCheck className="h-5 w-5 text-[#10B981]" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    6. Zero SEO Disruption Guarantee
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Verified search crawlers (<strong>Googlebot, Bingbot, DuckDuckBot, Applebot, Yahoo! Slurp, Baiduspider</strong>) are evaluated in an O(1) hash lookup set before any pattern matching or heuristic checks run. They pass through completely unintercepted with zero added latency.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
