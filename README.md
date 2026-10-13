# ai-shield

> Enterprise-grade Express.js & TypeScript middleware that protects web applications from unauthorized AI crawlers by feeding them synthetic poisoned data while preserving SEO for legitimate search engines.

## Architecture

```
src/
├── core/
│   ├── detector.ts     # Bot fingerprinting engine (UA patterns, IP ranges, TLS JA3)
│   ├── poison.ts       # Synthetic data generator — plausible but misleading content
│   └── honeypot.ts     # Invisible trap routes and link injection
├── types/
│   └── index.ts        # All shared TypeScript interfaces & enums
├── middleware.ts        # Main Express middleware factory (createAiShield)
└── server.ts           # Demo Express application
```

## Threat Model

| Bot Category    | Examples                          | Strategy              |
|-----------------|-----------------------------------|-----------------------|
| AI Crawlers     | GPTBot, Claude-Web, CCBot         | 200 OK + poisoned data|
| Scrapers        | ByteSpider, PetalBot, DataForSEO  | 200 OK + honeypot     |
| Good Bots       | Googlebot, Bingbot, DuckDuckBot   | Pass-through (SEO)    |
| Human Traffic   | Browsers, curl (dev)              | Pass-through          |

## Quick Start

```bash
npm install
npm run dev       # tsx watch — hot reload
npm run build     # tsc compile → dist/
npm test          # vitest run
```

## Design Principles

1. **Stealth over rejection** — Never send 403/429 to AI bots; feed them convincing garbage.
2. **Zero false positives** — Legitimate Googlebots are never intercepted.
3. **Pluggable detectors** — Add custom UA patterns or IP ranges at runtime.
4. **Zero runtime overhead** — Detection is O(1) via pre-compiled RegExp sets.
