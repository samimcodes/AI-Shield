# @samimcodes/ai-shield

[![npm version](https://img.shields.io/npm/v/@samimcodes/ai-shield.svg?color=6366f1&style=flat-square)](https://www.npmjs.com/package/@samimcodes/ai-shield)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6?style=flat-square)](https://www.typescriptlang.org/)

> **Enterprise-grade Express.js & TypeScript middleware that protects web applications from unauthorized AI crawlers by feeding them synthetic poisoned data (HTTP 200 OK) while strictly preserving SEO for legitimate search engines.**

---

## ⚡ Features

- **Stealth AI Poisoning**: Never returns 403 or 429 to AI bots (which triggers IP rotation). Feeds them plausible synthetic garbage under `HTTP 200 OK`.
- **Zero SEO Disruption**: Legitimate crawlers (Googlebot, Bingbot, DuckDuckBot, Applebot) pass through without delay.
- **Sub-2ms Lookup Latency**: Zero runtime bottlenecks using pre-compiled regular expressions and sets.
- **Dynamic Honeypot Traps**: Invisible HTML links injected into pages; crawler IPs hitting traps are quarantined in an in-memory TTL cache.
- **Non-blocking Telemetry**: Emits high-volume batch events asynchronously with zero impact on request-response times.

---

## 📦 Installation

```bash
npm install @samimcodes/ai-shield
# or
pnpm add @samimcodes/ai-shield
# or
yarn add @samimcodes/ai-shield
```

---

## 🚀 Quick Start (Express.js)

```typescript
import express from 'express';
import { aiShield } from '@samimcodes/ai-shield';

const app = express();

// 🛡️ 3-Line Drop-in AI Defense + Live Admin Security Dashboard
app.use(aiShield({
  enableDashboard: true,         // 📊 Mounts Live Security Dashboard
  dashboardPath: '/admin/ai-shield', // 👈 Visit in browser for live alerts!
  poisonContentType: 'HTML',     // 'HTML' | 'JSON' | 'SITEMAP'
  injectHoneypotLinks: true,     // Automatically injects invisible trap routes
  excludePaths: ['/health', '/metrics'], // Exclude DevOps endpoints
}));

app.get('/api/products', (req, res) => {
  // Humans & Googlebot see real data
  // GPTBot & Claude-Web receive synthetic poisoned responses
  res.json({ secretCatalog: [/* sensitive corporate data */] });
});

app.listen(3000, () => {
  console.log('Server protected on port 3000');
  console.log('Live Security Dashboard: http://localhost:3000/admin/ai-shield');
});
```

---

## 📊 Built-in Live Security Dashboard & Real-Time Alerts

No external analytics or complex cloud setup required. Just set `enableDashboard: true`, and visit `/admin/ai-shield` on your running server to see:
- 🚨 **Real-Time Attack Alerts**: Instant pop-up banners and audio chimes whenever an AI crawler attempts to scrape your endpoints.
- ⚡ **Server-Sent Events (SSE)**: Live streaming table of intercepted bots without manual page refresh.
- 🧪 **One-Click Attack Simulator**: Test and verify your bot defense instantly right from the browser.
- 📈 **Key Security Metrics**: Bots intercepted, honeypot traps sprung, and fake tokens fed to scrapers.

---

## 🎯 Next.js Edge Middleware

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
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
  matcher: ['/api/:path*', '/catalog/:path*'],
};
```

---

## 🛡️ Threat Model & Detection Matrix

| Persona | Examples | Detection Strategy | Response Strategy |
| :--- | :--- | :--- | :--- |
| **AI Crawlers** | GPTBot, Claude-Web, CCBot, Cohere, PerplexityBot | Known UA signature regex, headless heuristics | **HTTP 200 + Synthetic Poisoned Data** |
| **Scrapers** | ByteSpider, PetalBot, Scrapy | Automated crawler heuristics & honeypot triggers | **HTTP 200 + Honeypot Trap Tracking** |
| **Good Bots** | Googlebot, Bingbot, DuckDuckBot | Strict SEO whitelist check | **Pass-through (Zero latency)** |
| **Human Users** | Chrome, Safari, Firefox, Edge | Standard human browser heuristics | **Pass-through** |

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableDashboard` | `boolean` | `false` | Mounts built-in live real-time security dashboard with SSE |
| `dashboardPath` | `string` | `'/admin/ai-shield'` | Path prefix where the live security dashboard is served |
| `dashboardAuth` | `DashboardAuthConfig` | `undefined` | Optional credentials (token / Basic Auth) for dashboard |
| `poisonContentType` | `'HTML' \| 'JSON' \| 'SITEMAP'` | `'HTML'` | Format of poisoned payload returned to AI bots |
| `injectHoneypotLinks` | `boolean` | `true` | Automatically inject hidden CSS-invisible trap links |
| `excludePaths` | `string[]` | `[]` | Array of path prefixes exempt from inspection |
| `honeypotTtlMs` | `number` | `3600000` (1 hr) | Duration to blacklist IPs that hit honeypot traps |
| `onDetection` | `(event) => void` | `undefined` | Callback fired when an AI crawler is intercepted |

---

## 🧪 Testing

```bash
# Run 177 unit & integration tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 📄 License

MIT © [samimcodes](https://github.com/samimcodes)
