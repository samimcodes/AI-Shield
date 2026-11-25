'use client';

import React, { useEffect, useState } from 'react';
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
  SlidersHorizontal,
  Webhook,
  FlaskConical,
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

const NAV_GROUPS = [
  {
    title: 'Getting Started',
    items: [
      { id: 'overview', label: 'Overview & Threat Model', icon: BookOpen },
      { id: 'cli', label: 'Zero-Config CLI', icon: Terminal },
      { id: 'verify-setup', label: 'Verify Your Setup', icon: FlaskConical },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { id: 'script-tag', label: 'Website & WordPress', icon: Globe },
      { id: 'nextjs', label: 'Next.js Edge Middleware', icon: Server },
      { id: 'express', label: 'Express.js Middleware', icon: Code2 },
      { id: 'cloudflare', label: 'Cloudflare Worker', icon: Cloud },
    ],
  },
  {
    title: 'Reference',
    items: [
      { id: 'options', label: 'SDK Options', icon: SlidersHorizontal },
      { id: 'rest-api', label: 'REST API Reference', icon: Webhook },
      { id: 'seo-safety', label: 'SEO Whitelist Guarantee', icon: ShieldCheck },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const QUICKSTART_CARDS = [
  {
    id: 'express',
    title: 'Express / Node.js',
    desc: 'Drop-in middleware with honeypots & live admin monitor.',
    badge: 'NPM SDK',
    icon: Code2,
  },
  {
    id: 'nextjs',
    title: 'Next.js Edge',
    desc: 'Zero-cold-start App Router & middleware protection.',
    badge: 'Edge',
    icon: Server,
  },
  {
    id: 'script-tag',
    title: 'WordPress / HTML',
    desc: '1-line <script> tag with dynamic traps & telemetry.',
    badge: 'No Code',
    icon: Globe,
  },
  {
    id: 'cloudflare',
    title: 'Cloudflare Worker',
    desc: 'Reverse-proxy gateway in front of any origin server.',
    badge: 'Proxy',
    icon: Cloud,
  },
];

const SDK_OPTIONS = [
  {
    name: 'apiKey',
    type: 'string',
    defaultVal: 'undefined',
    desc: 'Live key (as_live_...) for SaaS quota sync and dashboard telemetry.',
  },
  {
    name: 'scoreThreshold',
    type: 'number',
    defaultVal: '50',
    desc: 'Minimum fused bot score [0–100] required before serving poison.',
  },
  {
    name: 'poisonContentType',
    type: "'HTML' | 'JSON' | 'AUTO'",
    defaultVal: "'HTML'",
    desc: 'Format of synthetic poisoned payloads returned to detected scrapers.',
  },
  {
    name: 'injectHoneypotLinks',
    type: 'boolean',
    defaultVal: 'true',
    desc: 'Inject hidden <a> traps into poisoned HTML responses.',
  },
  {
    name: 'honeypotTtlMs',
    type: 'number | null',
    defaultVal: '86400000',
    desc: 'Duration (24h default) an IP stays flagged after hitting a trap.',
  },
  {
    name: 'excludePaths',
    type: '(string | RegExp)[]',
    defaultVal: '[]',
    desc: 'Routes that bypass AI-Shield evaluation completely (e.g. /health).',
  },
  {
    name: 'customFingerprints',
    type: 'BotFingerprint[]',
    defaultVal: '[]',
    desc: 'Additional User-Agent regex rules merged into the detector.',
  },
  {
    name: 'enableDashboard',
    type: 'boolean',
    defaultVal: 'false',
    desc: 'Mount the self-contained local monitor inside your Express app.',
  },
  {
    name: 'dashboardPath',
    type: 'string',
    defaultVal: "'/admin/ai-shield'",
    desc: 'Route prefix for the built-in Express security dashboard.',
  },
  {
    name: 'debug',
    type: 'boolean',
    defaultVal: 'false',
    desc: 'Enable verbose detection logging to stdout (keep false in prod).',
  },
];

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string>('overview');

  useEffect(() => {
    const ids = ALL_NAV_ITEMS.map((item) => item.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0 && visible[0]?.target?.id) {
          setActiveNav(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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

  const verifySnippet = `# 1. Simulate an unauthorized AI scraper (Expect HTTP 200 OK + synthetic poison)
curl -i -A "GPTBot/1.0" http://localhost:3000/

# 2. Simulate Googlebot (Expect your real, untouched SEO content)
curl -i -A "Googlebot/2.1 (+http://www.google.com/bot.html)" http://localhost:3000/`;

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

  const validateApiSnippet = `curl -X POST https://ai-shield-dev.vercel.app/api/v1/validate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: as_live_YOUR_KEY" \\
  -d '{
    "botName": "GPTBot",
    "path": "/pricing",
    "actionTaken": "POISONED",
    "bandwidthSavedBytes": 4096
  }'

# Response (200 OK)
{
  "valid": true,
  "plan": "PRO",
  "limitExceeded": false,
  "requestsThisMonth": 142,
  "monthlyLimit": 100000,
  "remainingRequests": 99858
}`;

  const verifyApiSnippet = `curl -X POST https://ai-shield-dev.vercel.app/api/v1/verify \\
  -H "Content-Type: application/json" \\
  -d '{ "apiKey": "as_live_YOUR_KEY" }'

# Response (200 OK)
{
  "connected": true,
  "registeredInDb": true,
  "status": "ACTIVE",
  "latencyMs": 1.2,
  "honeypotActive": true,
  "seoSafe": true
}`;

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

      {/* Compact Docs Hero Banner */}
      <div className="border-b border-white/10 bg-grid-pattern radial-spotlight py-5 sm:py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-cyan-400 mb-2">
                <BookOpen className="h-3 w-3" />
                <span>Developer Documentation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Deploy Autonomous AI Crawler Defense in 60 Seconds
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Integrate via 1-line script, Express, Next.js Edge, or Cloudflare Workers—100% SEO safe.
              </p>
            </div>

            {/* Compact Quick Stat Pills */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/70 px-2.5 py-1.5 text-[11px]">
                <Zap className="h-3 w-3 text-[#06B6D4]" />
                <span className="font-mono text-white font-semibold">&lt; 1.8ms</span>
                <span className="text-zinc-400">Edge</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/70 px-2.5 py-1.5 text-[11px]">
                <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
                <span className="font-mono text-white font-semibold">100%</span>
                <span className="text-zinc-400">SEO Safe</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/70 px-2.5 py-1.5 text-[11px]">
                <ShieldCheck className="h-3 w-3 text-purple-400" />
                <span className="font-mono text-white font-semibold">50+</span>
                <span className="text-zinc-400">Bots</span>
              </div>
            </div>
          </div>

          {/* Compact Quickstart Selector Strip */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {QUICKSTART_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <a
                  key={card.id}
                  href={`#${card.id}`}
                  onClick={() => setActiveNav(card.id)}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-zinc-950/70 hover:bg-zinc-900/90 hover:border-cyan-500/40 px-3 py-2.5 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 shrink-0 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:border-cyan-500/30">
                      <Icon className="h-3.5 w-3.5 text-[#06B6D4]" />
                    </div>
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {card.title}
                    </span>
                  </div>
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-zinc-400 border border-white/10">
                    {card.badge}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Docs Grid */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-7 sm:py-8">
        {/* Mobile Quick Jump Pills */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-white/10">
          {ALL_NAV_ITEMS.map((item) => (
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
          {/* Left Sticky Sidebar with Groups */}
          <aside className="hidden md:block sticky top-24 space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold px-3 mb-2">
                  {group.title}
                </div>
                {group.items.map((item) => {
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
              </div>
            ))}
          </aside>

          {/* Main Content Sections */}
          <div className="md:col-span-3 space-y-14">
            {/* Overview */}
            <section id="overview" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Overview &amp; Threat Model
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Traditional firewalls return{' '}
                <code className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                  403 Forbidden
                </code>
                , prompting scraper fleets to immediately rotate residential proxies. AI-Shield instead responds with{' '}
                <code className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  HTTP 200 OK
                </code>{' '}
                containing realistic synthetic poisoned payloads—silently degrading unauthorized LLM datasets while preserving real content for human visitors and search engines.
              </p>
            </section>

            {/* Zero-Config CLI */}
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

            {/* Verify Your Setup */}
            <section id="verify-setup" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <FlaskConical className="h-4 w-4 text-[#10B981]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  2. Verify Your Setup with curl
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                After integrating AI-Shield, run these two commands against your server to verify that AI bots receive synthetic poison while Googlebot receives your real page:
              </p>
              <CodeBlock
                id="verify-setup"
                filename="verify.sh"
                language="bash"
                code={verifySnippet}
                copiedId={copiedSection}
                onCopy={copyCode}
              />
            </section>

            {/* Script Tag */}
            <section id="script-tag" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  3. Website &amp; WordPress Setup (&lt;script&gt;)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                For non-Node sites (WordPress, Shopify, Webflow, or static HTML), paste this single script tag before{' '}
                <code className="text-cyan-400">&lt;/head&gt;</code> or{' '}
                <code className="text-cyan-400">&lt;/body&gt;</code>. Replace{' '}
                <code className="text-cyan-400">YOUR_API_KEY</code> with your live key from the Dashboard:
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

            {/* Next.js */}
            <section id="nextjs" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Server className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  4. Next.js Middleware Setup
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

            {/* Express.js */}
            <section id="express" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Code2 className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  5. Express.js Drop-in Middleware
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Protect all API routes and enable the built-in local security monitor at{' '}
                <code className="text-cyan-400">/admin/ai-shield</code>:
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

            {/* Cloudflare */}
            <section id="cloudflare" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Cloud className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  6. Cloudflare Worker Edge Gateway
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

            {/* SDK Options Table */}
            <section id="options" className="scroll-mt-24 space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <SlidersHorizontal className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  7. SDK Configuration Options
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                All fields in <code className="text-cyan-400">aiShield(options)</code> are optional and have production-safe defaults:
              </p>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/90 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 bg-zinc-900/70 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                      <tr>
                        <th className="px-4 py-3">Option</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Default</th>
                        <th className="px-4 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {SDK_OPTIONS.map((opt) => (
                        <tr key={opt.name} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold text-cyan-300 whitespace-nowrap">
                            {opt.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-purple-300 whitespace-nowrap">
                            {opt.type}
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-400 whitespace-nowrap">
                            {opt.defaultVal}
                          </td>
                          <td className="px-4 py-3 text-zinc-300 leading-relaxed">
                            {opt.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* REST API Reference */}
            <section id="rest-api" className="scroll-mt-24 space-y-6 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Webhook className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  8. REST API Reference
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-[#06B6D4] border border-cyan-500/20 font-semibold">
                    POST
                  </span>
                  <span className="text-white">/api/v1/validate</span>
                  <span className="text-zinc-500">— Validate API key quota &amp; record bot telemetry</span>
                </div>
                <CodeBlock
                  id="api-validate"
                  filename="validate.sh"
                  language="bash"
                  code={validateApiSnippet}
                  copiedId={copiedSection}
                  onCopy={copyCode}
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-[#10B981] border border-emerald-500/20 font-semibold">
                    POST
                  </span>
                  <span className="text-white">/api/v1/verify</span>
                  <span className="text-zinc-500">— Check live key connectivity &amp; active status</span>
                </div>
                <CodeBlock
                  id="api-verify"
                  filename="verify-key.sh"
                  language="bash"
                  code={verifyApiSnippet}
                  copiedId={copiedSection}
                  onCopy={copyCode}
                />
              </div>
            </section>

            {/* SEO Safety */}
            <section id="seo-safety" className="scroll-mt-24 space-y-6 pt-8 border-t border-white/10">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <ShieldCheck className="h-5 w-5 text-[#10B981]" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    9. Zero SEO Disruption Guarantee
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Verified search crawlers (<strong>Googlebot, Bingbot, DuckDuckBot, Applebot, Yahoo! Slurp, Baiduspider</strong>) are evaluated in an O(1) hash lookup set before any pattern matching or heuristic checks run. They pass through completely unintercepted with zero added latency.
                </p>
              </div>

              {/* Bottom CTA Card */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Ready to protect your site from AI scrapers?
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                    Generate your free API key in seconds and monitor live bot interceptions from your dashboard.
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#06B6D4] hover:bg-cyan-400 text-zinc-950 font-semibold px-4 py-2.5 text-xs transition-all shadow-sm shadow-cyan-500/20"
                >
                  <span>Get Free API Key</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
