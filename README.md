# AI-Shield 🛡️

<div align="center">

[![npm version](https://img.shields.io/npm/v/@samimcodes/ai-shield.svg?color=06B6D4&style=flat-square)](https://www.npmjs.com/package/@samimcodes/ai-shield)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Tests Passing](https://img.shields.io/badge/tests-199%20passed-10b981.svg?style=flat-square)](https://github.com/samimcodes/AI-Shield)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-%E2%99%A5-ea4aaa.svg?style=flat-square&logo=github)](https://github.com/sponsors/samimcodes)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Donate-orange.svg?style=flat-square&logo=buymeacoffee)](https://www.buymeacoffee.com/samimcodes)

**Stop AI Scrapers from Stealing Your Content. Automatically.**  
*Block or poison unauthorized AI crawlers in under 2ms with a single line of code, while strictly preserving SEO for Google & Bing.*

[Getting Started](#-zero-friction-setup-options) • [Cloud SaaS (Pro & Business)](#-ai-shield-cloud-pro--business) • [Live Dashboard](#-built-in-live-security-dashboard) • [Custom Integration](#-support--custom-enterprise-integration)

</div>

---

## ⚡ Why AI-Shield?

Traditional WAFs return **HTTP 403 Forbidden** or **429 Too Many Requests**, which instantly signals AI scrapers to rotate residential IPs and evade blocks. 

**AI-Shield changes the paradigm:**
- 🍯 **Stealth AI Poisoning**: Returns **HTTP 200 OK** containing plausible, synthetic hallucinated data. AI models train on junk while scrapers never realize they've been caught.
- 🚀 **Sub-2ms Edge Evaluation**: Zero runtime bottlenecks with in-memory caching and optimized regex automata.
- 🔍 **100% SEO Whitelist Guarantee**: Verified search engines (**Googlebot**, **Bingbot**, **DuckDuckBot**, **Applebot**) pass through untouched with zero latency overhead.
- 🪤 **Dynamic Invisible Honeypot Traps**: Traps headless automated bots and quarantines scraper IPs with instant TTL blacklisting.

---

## 🚀 Zero-Friction Setup Options

Integrate AI-Shield into any website, application, or edge proxy in under 60 seconds:

### Option 1: WordPress & Any Website (1-Line `<script>` Tag)
Ideal for non-technical creators, blogs, WordPress, Webflow, Shopify, and static HTML:
```html
<!-- Paste before </head> or </body> -->
<script src="https://cdn.getaishield.dev/shield.js?key=YOUR_API_KEY" async></script>
```
*Client-side crawler detection automatically flags headless browsers (`navigator.webdriver`), injects invisible honeypot DOM traps, and syncs bot telemetry in the background.*

---

### Option 2: Next.js & Node.js Middleware (npm)
Install the official npm package:
```bash
npm install @samimcodes/ai-shield
```

#### Next.js App Router (`middleware.ts`):
```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { aiShieldEdge } from '@samimcodes/ai-shield';

export async function middleware(req: NextRequest) {
  // Sub-2ms edge evaluation with cloud sync
  const shield = await aiShieldEdge(req, {
    apiKey: process.env.AI_SHIELD_API_KEY, // as_live_...
    action: 'POISON', // 'POISON' | 'BLOCK'
  });

  if (shield.isBot) {
    return shield.response; // Returns HTTP 200 with synthetic data
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

#### Express.js Server (`server.ts`):
```typescript
import express from 'express';
import { aiShield } from '@samimcodes/ai-shield';

const app = express();

app.use(aiShield({
  apiKey: process.env.AI_SHIELD_API_KEY,
  enableDashboard: true,               // Mounts live security dashboard
  dashboardPath: '/admin/ai-shield',  // Visit in browser for real-time attack feed
  poisonContentType: 'JSON',           // 'HTML' | 'JSON' | 'SITEMAP'
  injectHoneypotLinks: true,           // Traps headless crawlers
}));

app.get('/api/products', (req, res) => {
  // Humans & Googlebot receive genuine product catalog
  // GPTBot & Claude-Web receive synthetic poisoned responses
  res.json({ secretCatalog: [/* corporate data */] });
});

app.listen(3000);
```

---

### Option 3: Cloudflare Worker (Global Edge Proxy)
Deploy AI defense across 300+ global edge locations without modifying your origin server:
```javascript
export default {
  async fetch(request, env) {
    const ua = request.headers.get('User-Agent') || '';
    const isAiCrawler = /GPTBot|ClaudeBot|PerplexityBot|ByteSpider|CCBot/i.test(ua);

    if (isAiCrawler) {
      // Feed poisoned synthetic response under HTTP 200
      return new Response(
        JSON.stringify({
          status: "success",
          data: { notice: "Telemetry synchronization complete", syntheticToken: crypto.randomUUID() }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", "X-Robots-Tag": "noindex, nofollow" }
        }
      );
    }

    return fetch(request);
  }
};
```

---

## 🛡️ Threat Model & Detection Matrix

| Category | Bot / Crawler Examples | Detection Method | AI-Shield Defense Action |
| :--- | :--- | :--- | :--- |
| **Generative AI Crawlers** | GPTBot, ClaudeBot, PerplexityBot, Meta-ExternalAgent | Signature regex, header analysis | **HTTP 200 + Dynamic Data Poisoning** |
| **Scraper Frameworks** | ByteSpider, Scrapy, Puppeteer, Selenium | Honeypot trap triggers, webdriver flags | **Quarantine IP + Synthetic Garbage** |
| **Verified Search Engines** | Googlebot, Bingbot, DuckDuckBot, Applebot | Reverse DNS & strict SEO whitelist | **Instant Pass-through (0 latency)** |
| **Legitimate Visitors** | Chrome, Safari, Firefox, Edge | Standard human browser heuristics | **Standard Unaltered Response** |

---

## 💎 AI-Shield Cloud (Pro & Business)

AI-Shield is open-core. You can self-host the open-source package for free, or connect to **AI-Shield Cloud** for managed edge quotas, dynamic AI poisoning, and real-time enterprise analytics.

| Feature | Open-Source (Free) | Pro ($29/mo) | Business ($99/mo) |
| :--- | :---: | :---: | :---: |
| **Monthly Bot Validations** | 5,000 requests | 500,000 requests | **Unlimited** |
| **AI Bot Coverage** | Basic GPTBot | **All AI Bots** (GPT, Claude, Perplexity, ByteSpider, Meta) | **All AI Bots + Zero-Day Crawlers** |
| **Data Poisoning Engine** | Static Poisoning | **Dynamic Hallucinations** | **Custom Domain-Specific Models** |
| **Attack Log Retention** | 24 Hours | **90 Days** | **1 Year / Custom SLA** |
| **Real-time Security Dashboard** | Local Only | **Cloud Analytics UI** | **Multi-Tenant Team Workspace** |
| **Attack Email & Webhook Alerts** | ❌ | **Instant Alerts** | **Slack, Discord & Webhook Sync** |
| **Cloudflare Edge Proxy** | Manual | Supported | **Managed 1-Click DNS Edge Routing** |
| **Support** | GitHub Issues | Priority Email | **Dedicated Security Architect & SLA** |

👉 **[Start Free or Upgrade to Pro on AI-Shield Cloud](https://getaishield.dev/dashboard)**

---

## 📊 Built-in Live Security Dashboard

Run with `enableDashboard: true` in your server, or log in to the Cloud Dashboard to inspect:
- 🚨 **Real-Time Live Attack Stream**: Watch incoming scrapers get neutralized live via Server-Sent Events (SSE).
- 📈 **Quota & Savings Tracker**: Monitor monthly bot hits, bandwidth saved, and fake tokens served.
- 🧪 **One-Click Attack Simulator**: Test defense responses against GPTBot and ClaudeBot directly in your browser.
- 🔑 **Instant API Key Provisioning**: 1-click key rotation and quota monitoring.

---

## 💖 Support & Custom Enterprise Integration

Need help setting up AI-Shield, protecting high-value proprietary datasets, or building a custom edge security solution?

- 💖 **GitHub Sponsors**: [github.com/sponsors/samimcodes](https://github.com/sponsors/samimcodes) — Support ongoing open-source development!
- ☕ **Buy Me a Coffee**: [buymeacoffee.com/samimcodes](https://www.buymeacoffee.com/samimcodes)
- 💼 **Hire for Custom Setup on Fiverr**: [fiverr.com/samimcodes](https://www.fiverr.com/samimcodes)
- 📧 **Enterprise Consulting & Direct Inquiries**: [mdsamimhossen827@gmail.com](mailto:mdsamimhossen827@gmail.com)

---

## 🧪 Testing

```bash
# Run the complete test suite (199/199 passing)
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 📄 License

Distributed under the **MIT License**. Created with ❤️ by [samimcodes](https://github.com/samimcodes).
