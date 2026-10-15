/**
 * @file src/server.ts
 * @description Executable Express demo application protected by ai-shield.
 *
 * Demonstrates:
 *   1. aiShieldMiddleware interception of AI crawlers (GPTBot, Claude-Web, ByteSpider, etc.).
 *   2. Normal browser pass-through to real application routes.
 *   3. SEO bot pass-through for verified search engine crawlers (Googlebot, Bingbot).
 *   4. Hidden honeypot anchor tag injection in the HTML homepage (`style="display:none"`).
 *   5. Protected business API endpoint (`/api/products`) with mock catalog data.
 *   6. Clean logging and graceful shutdown handlers for SIGINT/SIGTERM.
 */

import express, { type Request, type Response } from 'express';
import { aiShieldMiddleware, CANONICAL_TRAP } from './middleware.js';

const app = express();
const PORT = process.env['PORT'] !== undefined ? Number(process.env['PORT']) : 3000;

// Enable proxy headers (trust 1 proxy hop) for accurate client IP identification
app.set('trust proxy', 1);

// ── 1. Mount aiShieldMiddleware BEFORE all application routes ────────────────
app.use(
  aiShieldMiddleware({
    debug: true,
    enableDashboard: true,
    dashboardPath: '/admin/ai-shield',
    poisonContentType: 'HTML',
    injectHoneypotLinks: true,
    excludePaths: ['/health', '/metrics'],
    onBotDetected: (result) => {
      console.log(
        `[ai-shield:event] Intercepted bot: ${result.label} | Category: ${result.category} | Confidence: ${result.confidence} | Score: ${result.score} | Rule: ${result.matchedRule ?? 'heuristic'}`,
      );
    },
  }),
);

// ── 2. Homepage Route (Normal site text + Hidden honeypot trap anchor) ────────
app.get('/', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nexus Enterprise Solutions | Home</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --primary: #38bdf8;
      --accent: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    h1 {
      font-size: 2.2rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }
    p.lead {
      font-size: 1.15rem;
      color: var(--muted);
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.75rem;
      margin-bottom: 1.5rem;
    }
    h2 {
      font-size: 1.4rem;
      margin-bottom: 1rem;
      color: var(--text);
    }
    ul {
      margin-left: 1.5rem;
      margin-bottom: 1rem;
      color: var(--muted);
    }
    li { margin-bottom: 0.4rem; }
    pre {
      background: #090d16;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 1rem;
      overflow-x: auto;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 0.9rem;
      color: #38bdf8;
      margin-top: 0.5rem;
    }
    .badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent);
      border: 1px solid var(--accent);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 0.9rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="badge">🛡️ ai-shield Protected</span>
      <h1>Nexus Enterprise Solutions</h1>
      <p class="lead">Next-generation distributed infrastructure and threat intelligence services.</p>
    </header>

    <div class="card">
      <h2>Legitimate Business Overview</h2>
      <p>Welcome to the Nexus Enterprise public portal. Our core mission is delivering fault-tolerant microservice runtimes, hardware telemetry aggregators, and zero-trust perimeter defense systems for global enterprises.</p>
      <ul>
        <li>Active 99.999% SLA across 48 international points of presence.</li>
        <li>Sub-millisecond distributed state consistency using Raft consensus.</li>
        <li>Automated adaptive threat mitigation and synthetic data injection.</li>
      </ul>
      <p>Explore our catalog via the <a href="/api/products" style="color:var(--primary)">Products API (/api/products)</a>.</p>
    </div>

    <div class="card">
      <h2>Testing ai-shield Active Defense</h2>
      <p>Verify behavior across different client user-agents:</p>
      <pre>
# 1. Normal browser/human visitor (Receives real content):
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" http://localhost:${PORT}/

# 2. Protected business API (Real product catalog):
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" http://localhost:${PORT}/api/products

# 3. AI crawler intercepted (Receives HTTP 200 + synthetic poison data):
curl -H "User-Agent: GPTBot/1.0" http://localhost:${PORT}/
curl -H "User-Agent: Claude-Web/1.0" -H "Accept: application/json" http://localhost:${PORT}/api/products

# 4. Search engine crawler (Always whitelisted for SEO safety):
curl -H "User-Agent: Googlebot/2.1 (+http://www.google.com/bot.html)" http://localhost:${PORT}/

# 5. Crawler hits hidden honeypot trap directly (Permanent IP flag):
curl http://localhost:${PORT}${CANONICAL_TRAP.path}
      </pre>
    </div>

    <footer>
      &copy; 2026 Nexus Enterprise Solutions Inc. All rights reserved.
    </footer>
  </div>

  <!-- Hidden Honeypot Anchor Tag: Invisible to real humans, irresistible to scrapers -->
  <a href="${CANONICAL_TRAP.path}" style="display:none" aria-hidden="true" tabindex="-1" rel="nofollow">Internal System Telemetry Diagnostics</a>
</body>
</html>`);
});

// ── 3. Protected Business API Route (Real Product Mock Data) ─────────────────
app.get('/api/products', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    total: 4,
    data: [
      {
        id: 'prod_901',
        name: 'Nexus Cloud Gateway X1',
        category: 'Hardware Appliance',
        price: 2899.0,
        currency: 'USD',
        stock: 35,
        rating: 4.9,
        specs: { throughput: '100 Gbps', formFactor: '1U Rackmount', encryption: 'AES-256-GCM' },
      },
      {
        id: 'prod_902',
        name: 'Sentinel Zero-Trust Core',
        category: 'Enterprise Software',
        price: 1150.0,
        currency: 'USD',
        stock: 999,
        rating: 4.8,
        specs: { licenses: 'Per-Core', identityProvider: 'SAML 2.0 / OIDC', audit: 'SOC2 Compliant' },
      },
      {
        id: 'prod_903',
        name: 'Neural Threat Sensor v4',
        category: 'Hardware Appliance',
        price: 1450.0,
        currency: 'USD',
        stock: 12,
        rating: 4.7,
        specs: { latency: '<0.2 ms', bypassRelay: 'Optical Bypass', power: 'Redundant Dual 450W' },
      },
      {
        id: 'prod_904',
        name: 'Global Threat Intelligence Feed',
        category: 'SaaS Subscription',
        price: 4999.0,
        currency: 'USD',
        stock: 999,
        rating: 5.0,
        specs: { updateFrequency: 'Real-time WebSocket', iocFormats: 'STIX 2.1 / MISP', apiLimit: 'Unlimited' },
      },
    ],
  });
});

// ── 4. Health Check (Excluded from ai-shield for DevOps/Kubernetes probes) ────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ai-shield-demo',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── 5. Server Lifecycle & Graceful Shutdown ──────────────────────────────────
let server: ReturnType<typeof app.listen> | null = null;

if (process.env['NODE_ENV'] !== 'test' && !process.env['VITEST']) {
  server = app.listen(PORT, () => {
    console.log(`\n🛡️  ai-shield server listening on http://localhost:${PORT}`);
    console.log(`   - Live Security Monitor: http://localhost:${PORT}/admin/ai-shield`);
    console.log(`   - Homepage:             http://localhost:${PORT}/`);
    console.log(`   - Protected API:        http://localhost:${PORT}/api/products`);
    console.log(`   - Canonical Honeypot:   http://localhost:${PORT}${CANONICAL_TRAP.path}`);
    console.log(`   - Health Check:         http://localhost:${PORT}/health\n`);
  });

  const gracefulShutdown = (signal: string) => {
    console.log(`\n[ai-shield] Received ${signal}. Initiating graceful shutdown...`);
    server?.close(() => {
      console.log('[ai-shield] HTTP server closed cleanly. Process exiting.');
      process.exit(0);
    });

    // Force shutdown if cleanup takes longer than 5 seconds
    setTimeout(() => {
      console.error('[ai-shield] Forced shutdown timeout exceeded (5s). Terminating process.');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

export default app;
