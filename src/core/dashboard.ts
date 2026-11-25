/**
 * @file src/core/dashboard.ts
 * @description Built-in live real-time security dashboard and SSE event broadcaster.
 *
 * Provides developers with an out-of-the-box, zero-dependency, ultra-sleek
 * admin monitoring interface to watch AI bots being intercepted, poisoned,
 * and trapped in real-time right on their own server.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  BotCategory,
  type DashboardAuthConfig,
  type DashboardSecurityEvent,
  type DashboardStats,
  type DetectionSignal,
} from '../types/index.js';

export interface DashboardManagerOptions {
  basePath?: string | undefined;
  auth?: DashboardAuthConfig | undefined;
  maxStoredEvents?: number | undefined;
  debug?: boolean | undefined;
}

export class DashboardManager {
  private readonly basePath: string;
  private readonly auth: DashboardAuthConfig | undefined;
  private readonly maxStoredEvents: number;
  private readonly debug: boolean;

  private events: DashboardSecurityEvent[] = [];
  private sseClients: Set<Response> = new Set();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  private stats: DashboardStats = {
    totalRequests: 0,
    botsIntercepted: 0,
    goodBotsAllowed: 0,
    honeypotTriggers: 0,
    poisonPayloadsServed: 0,
    estimatedFakeTokens: 0,
    topBots: {},
    topRoutes: {},
  };

  constructor(options: DashboardManagerOptions = {}) {
    this.basePath = options.basePath ?? '/admin/ai-shield';
    this.auth = options.auth;
    this.maxStoredEvents = options.maxStoredEvents ?? 100;
    this.debug = options.debug ?? false;

    // Keep SSE connections alive with periodic heartbeat
    this.heartbeatTimer = setInterval(() => {
      this.broadcastPing();
    }, 15_000);
    // Unref timer so it doesn't hold open Node process in unit tests
    if (this.heartbeatTimer.unref) {
      this.heartbeatTimer.unref();
    }
  }

  /**
   * Stop background timers and disconnect SSE clients (useful during teardown).
   */
  public close(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    for (const client of this.sseClients) {
      try {
        client.end();
      } catch {
        // ignore
      }
    }
    this.sseClients.clear();
  }

  /** Record a normal or bot request to update total counters. */
  public recordRequest(): void {
    this.stats.totalRequests++;
  }

  /** Record a legitimate search engine pass-through (Googlebot, Bingbot, etc). */
  public recordGoodBot(botName: string, path: string): void {
    this.stats.totalRequests++;
    this.stats.goodBotsAllowed++;
    this.stats.topBots[botName] = (this.stats.topBots[botName] ?? 0) + 1;
    this.stats.topRoutes[path] = (this.stats.topRoutes[path] ?? 0) + 1;
  }

  /**
   * Record an intercepted AI crawler or scraper, update stats,
   * prepend to event log, and push to all active SSE browser tabs.
   */
  public recordEvent(event: Omit<DashboardSecurityEvent, 'id' | 'timestamp'> & { timestamp?: string }): DashboardSecurityEvent {
    this.stats.totalRequests++;
    this.stats.botsIntercepted++;

    if (event.action === 'HONEYPOT_TRAP') {
      this.stats.honeypotTriggers++;
    } else {
      this.stats.poisonPayloadsServed++;
      this.stats.estimatedFakeTokens += 480; // average synthetic generated token count
    }

    this.stats.topBots[event.botName] = (this.stats.topBots[event.botName] ?? 0) + 1;
    this.stats.topRoutes[event.path] = (this.stats.topRoutes[event.path] ?? 0) + 1;

    const fullEvent: DashboardSecurityEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: event.timestamp ?? new Date().toISOString(),
      botName: event.botName,
      category: event.category,
      path: event.path,
      score: event.score,
      signals: event.signals,
      ipHash: event.ipHash,
      userAgent: event.userAgent,
      action: event.action,
    };

    this.events.unshift(fullEvent);
    if (this.events.length > this.maxStoredEvents) {
      this.events.length = this.maxStoredEvents;
    }

    this.broadcastEvent(fullEvent);
    return fullEvent;
  }

  /** Retrieve snapshot of current metrics. */
  public getStats(): DashboardStats {
    return { ...this.stats, topBots: { ...this.stats.topBots }, topRoutes: { ...this.stats.topRoutes } };
  }

  /** Retrieve recent security events. */
  public getEvents(): DashboardSecurityEvent[] {
    return [...this.events];
  }

  /** Broadcast SSE event to all connected dashboard tabs. */
  private broadcastEvent(event: DashboardSecurityEvent): void {
    const payload = `data: ${JSON.stringify({ type: 'event', event, stats: this.getStats() })}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(payload);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  /** Broadcast periodic ping to keep SSE connections open through proxies. */
  private broadcastPing(): void {
    if (this.sseClients.size === 0) return;
    const payload = `: ping\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(payload);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  /** Authenticate request if dashboardAuth is configured. */
  private checkAuth(req: Request, res: Response, next: NextFunction): void {
    if (!this.auth) {
      next();
      return;
    }

    // 1. Check token query or header
    if (this.auth.token) {
      const authHeader = req.headers['authorization'];
      const apiKeyHeader = req.headers['x-ai-shield-key'];
      const tokenQuery = req.query['token'] as string | undefined;

      if (tokenQuery === this.auth.token || apiKeyHeader === this.auth.token) {
        next();
        return;
      }
      if (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) === this.auth.token) {
        next();
        return;
      }
    }

    // 2. Check Basic Auth (username & password)
    if (this.auth.username && this.auth.password) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Basic ')) {
        const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf8');
        const [user, pass] = credentials.split(':');
        if (user === this.auth.username && pass === this.auth.password) {
          next();
          return;
        }
      }

      res.setHeader('WWW-Authenticate', 'Basic realm="AI Shield Security Dashboard"');
      res.status(401).send('401 Unauthorized: Invalid AI Shield dashboard credentials.');
      return;
    }

    if (this.auth.token) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
      return;
    }

    next();
  }

  /** Mount and return Express router serving the live dashboard and API. */
  public buildRouter(): Router {
    const router = Router();

    // Attach authentication guard
    router.use((req, res, next) => this.checkAuth(req, res, next));

    // 1. JSON stats API
    router.get('/api/stats', (_req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-store');
      res.json({
        success: true,
        stats: this.getStats(),
        recentEvents: this.getEvents(),
      });
    });

    // 2. Server-Sent Events (SSE) live stream
    router.get('/events', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (Nginx)

      res.flushHeaders?.();

      // Send initial snapshot
      res.write(`data: ${JSON.stringify({ type: 'init', stats: this.getStats(), events: this.getEvents() })}\n\n`);

      this.sseClients.add(res);

      req.on('close', () => {
        this.sseClients.delete(res);
      });
    });

    // 3. Simulated test attack endpoint for instant user testing
    router.post('/api/test-event', (_req: Request, res: Response) => {
      const defaultChoice = {
        name: 'GPTBot (OpenAI)',
        path: '/api/v1/products',
        cat: BotCategory.AI_CRAWLER,
        signals: ['UA_PATTERN_MATCH', 'MISSING_ACCEPT_LANGUAGE'] as DetectionSignal[],
      };
      const testBots = [
        defaultChoice,
        { name: 'Claude-Web (Anthropic)', path: '/catalog/pricing', cat: BotCategory.AI_CRAWLER, signals: ['UA_PATTERN_MATCH'] as DetectionSignal[] },
        { name: 'ByteSpider (TikTok)', path: '/content/articles', cat: BotCategory.SCRAPER, signals: ['UA_PATTERN_MATCH', 'SUSPICIOUS_UA'] as DetectionSignal[] },
        { name: 'Honeypot Trap Route', path: '/api/internal/telemetry-sync', cat: BotCategory.AI_CRAWLER, signals: ['HONEYPOT_TRIGGERED'] as DetectionSignal[] },
      ];

      const choice = testBots[Math.floor(Math.random() * testBots.length)] ?? defaultChoice;
      const event = this.recordEvent({
        botName: choice.name,
        category: choice.cat,
        path: choice.path,
        score: choice.name.includes('Honeypot') ? 100 : 95,
        signals: choice.signals,
        ipHash: Math.random().toString(16).slice(2, 10) + '...',
        userAgent: `Simulated/${choice.name.split(' ')[0]} Bot Simulator`,
        action: choice.name.includes('Honeypot') ? 'HONEYPOT_TRAP' : 'POISON_JSON',
      });

      res.json({ success: true, event });
    });

    // 4. Main live HTML dashboard
    router.get('/', (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.send(this.renderHtml());
    });

    return router;
  }

  /** Render self-contained, responsive, Obsidian dark-mode HTML dashboard. */
  public renderHtml(): string {
    const basePath = this.basePath;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Shield — Live Security Monitor</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #09090b;
      --card-bg: rgba(24, 24, 27, 0.72);
      --card-border: rgba(255, 255, 255, 0.09);
      --cyan: #06b6d4;
      --emerald: #10b981;
      --danger: #f43f5e;
      --warning: #f59e0b;
      --purple: #a855f7;
      --text: #fafafa;
      --text-muted: #a1a1aa;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      background-image:
        radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.14) 0%, rgba(16, 185, 129, 0.05) 35%, transparent 65%),
        linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
      background-size: 100% 100%, 36px 36px, 36px 36px;
    }
    header {
      padding: 0.9rem 1.5rem;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      background: rgba(9, 9, 11, 0.85);
      backdrop-filter: blur(18px);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-weight: 700;
      font-size: 1.05rem;
      letter-spacing: -0.02em;
    }
    .shield-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #18181b, #09090b);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 18px rgba(6, 182, 212, 0.2);
    }
    .ver-pill {
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.68rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .badge-live {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.25rem 0.7rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .header-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      align-items: center;
    }
    .btn {
      padding: 0.5rem 0.9rem;
      border-radius: 9px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      border: 1px solid transparent;
      text-decoration: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, #06b6d4, #10b981);
      color: #09090b;
      font-weight: 700;
      box-shadow: 0 0 18px rgba(6, 182, 212, 0.25);
    }
    .btn-primary:hover {
      opacity: 0.92;
      transform: translateY(-1px);
    }
    .btn-outline {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--card-border);
      color: var(--text);
    }
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(255, 255, 255, 0.18);
    }
    main {
      flex: 1;
      padding: 1.75rem 1.5rem;
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.2rem 1.35rem;
      backdrop-filter: blur(16px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      position: relative;
      overflow: hidden;
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.45), transparent);
    }
    .card-title {
      font-size: 0.72rem;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .card-val {
      font-size: 1.9rem;
      font-weight: 800;
      color: #fff;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    .card-sub {
      font-size: 0.74rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .text-emerald { color: #34d399; }
    .text-rose { color: #fb7185; }
    .text-amber { color: #fbbf24; }
    .text-cyan { color: #22d3ee; }

    /* Breakdown Grid (Top Bots & Top Routes) */
    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    .insight-list {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .insight-row {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      font-size: 0.78rem;
    }
    .insight-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }
    .bar-track {
      height: 6px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.06);
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, #06b6d4, #10b981);
      transition: width 0.35s ease;
    }

    /* Alert Banner Toast */
    #alert-toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      max-width: 420px;
      width: calc(100% - 3rem);
      background: rgba(9, 9, 11, 0.96);
      border: 1px solid rgba(244, 63, 94, 0.6);
      border-radius: 14px;
      padding: 1rem 1.2rem;
      box-shadow: 0 12px 40px rgba(244, 63, 94, 0.25);
      backdrop-filter: blur(20px);
      z-index: 100;
      display: none;
      animation: slideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideIn {
      from { transform: translateY(18px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .toast-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.3rem;
    }
    .toast-tag {
      font-size: 0.72rem;
      font-weight: 700;
      color: #fb7185;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .toast-body {
      font-size: 0.82rem;
      line-height: 1.45;
      color: #e4e4e7;
    }

    /* Feed Table */
    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      overflow: hidden;
      backdrop-filter: blur(16px);
    }
    .table-header {
      padding: 1rem 1.35rem;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
    }
    .table-title {
      font-size: 1rem;
      font-weight: 700;
    }
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.45rem;
    }
    .filter-btn {
      padding: 0.3rem 0.65rem;
      border-radius: 7px;
      border: 1px solid var(--card-border);
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-muted);
      font-size: 0.72rem;
      font-family: 'JetBrains Mono', monospace;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .filter-btn.active {
      background: rgba(6, 182, 212, 0.14);
      border-color: rgba(6, 182, 212, 0.4);
      color: #22d3ee;
    }
    .table-scroll {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.84rem;
    }
    th {
      padding: 0.8rem 1.25rem;
      background: rgba(255, 255, 255, 0.02);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.7rem;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--card-border);
      white-space: nowrap;
    }
    td {
      padding: 0.9rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #d4d4d8;
      white-space: nowrap;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255, 255, 255, 0.025); }
    .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }
    .badge-danger { background: rgba(244, 63, 94, 0.14); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }
    .badge-amber { background: rgba(245, 158, 11, 0.14); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-emerald { background: rgba(16, 185, 129, 0.14); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .empty-state {
      padding: 3.5rem 1.5rem;
      text-align: center;
      color: var(--text-muted);
    }
    @keyframes flashRow {
      0% { background: rgba(6, 182, 212, 0.22); }
      100% { background: transparent; }
    }
    .new-row {
      animation: flashRow 1.8s ease-out;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="shield-icon">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <span>AI-Shield</span>
      <span class="ver-pill">v0.3.5</span>
      <span style="font-weight:500; color:#71717a; font-size:0.85rem;">Live Monitor</span>
      <div class="badge-live">
        <div class="pulse-dot"></div>
        ACTIVE DEFENSE
      </div>
    </div>
    <div class="header-actions">
      <a class="btn btn-outline" href="https://ai-shield-dev.vercel.app/docs" target="_blank" rel="noreferrer">
        Docs
      </a>
      <button class="btn btn-outline" id="audioToggle">
        <span id="audioIcon">Sound ON</span>
      </button>
      <button class="btn btn-primary" id="testAttackBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        Simulate Bot Attack
      </button>
    </div>
  </header>

  <main>
    <!-- Metrics Row -->
    <div class="metrics-grid">
      <div class="card">
        <div class="card-title">Bots Intercepted</div>
        <div class="card-val text-rose" id="m-intercepted">0</div>
        <div class="card-sub text-rose">
          <span>●</span> Synthetic poison served (HTTP 200)
        </div>
      </div>
      <div class="card">
        <div class="card-title">Honeypot Traps Sprung</div>
        <div class="card-val text-amber" id="m-honeypot">0</div>
        <div class="card-sub text-amber">
          <span>●</span> Scrapers flagged via hidden traps
        </div>
      </div>
      <div class="card">
        <div class="card-title">Search Engines Allowed</div>
        <div class="card-val text-emerald" id="m-goodbots">0</div>
        <div class="card-sub text-emerald">
          <span>●</span> 100% SEO pass-through integrity
        </div>
      </div>
      <div class="card">
        <div class="card-title">Fake Tokens Injected</div>
        <div class="card-val text-cyan" id="m-tokens">0</div>
        <div class="card-sub text-cyan">
          <span>●</span> Synthetic noise fed to scrapers
        </div>
      </div>
    </div>

    <!-- Top Bots & Targeted Routes Breakdown -->
    <div class="insights-grid">
      <div class="card">
        <div class="card-title">Top Detected Bots</div>
        <div class="insight-list" id="top-bots-list">
          <div style="font-size:0.78rem; color:#71717a;">No bot activity recorded yet.</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Top Targeted Routes</div>
        <div class="insight-list" id="top-routes-list">
          <div style="font-size:0.78rem; color:#71717a;">No targeted routes recorded yet.</div>
        </div>
      </div>
    </div>

    <!-- Live Event Feed Table -->
    <div class="table-container">
      <div class="table-header">
        <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
          <div class="table-title">Real-Time Threat Interception Stream</div>
          <div class="badge-live" style="font-size: 0.68rem;">
            <span id="conn-status">Connecting to stream...</span>
          </div>
        </div>
        <div class="filter-bar">
          <button class="filter-btn active" data-filter="ALL">All</button>
          <button class="filter-btn" data-filter="POISON">Poisoned</button>
          <button class="filter-btn" data-filter="HONEYPOT">Honeypot</button>
        </div>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Bot / Persona</th>
              <th>Threat Score</th>
              <th>Route Attacked</th>
              <th>Defense Action</th>
              <th>Client Hash</th>
            </tr>
          </thead>
          <tbody id="event-rows">
            <tr>
              <td colspan="6" class="empty-state">
                Listening for incoming crawlers... Click "Simulate Bot Attack" to test live.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Live Pop-up Alert Toast -->
  <div id="alert-toast">
    <div class="toast-header">
      <span class="toast-tag">AI Crawler Intercepted</span>
      <span class="mono" style="font-size: 0.72rem; color: #a1a1aa;" id="toast-time">Just now</span>
    </div>
    <div class="toast-body" id="toast-body">
      <strong>GPTBot</strong> attempted to scrape <span class="mono">/api/products</span>.
      Synthetic poisoned JSON served with HTTP 200.
    </div>
  </div>

  <script>
    const basePath = '${basePath}';
    let soundEnabled = true;
    let audioCtx = null;
    let activeFilter = 'ALL';
    let cachedEvents = [];

    function playAlertChime() {
      if (!soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {
        console.warn('Audio notice:', e);
      }
    }

    document.getElementById('audioToggle').addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      document.getElementById('audioIcon').innerText = soundEnabled ? 'Sound ON' : 'Sound OFF';
    });

    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter') || 'ALL';
        renderRows(cachedEvents, false);
      });
    });

    document.getElementById('testAttackBtn').addEventListener('click', async () => {
      try {
        await fetch(basePath + '/api/test-event', { method: 'POST' });
      } catch (err) {
        console.error('Test attack failed:', err);
      }
    });

    function renderBreakdown(elId, mapObj, emptyText) {
      const container = document.getElementById(elId);
      if (!container) return;
      const entries = Object.entries(mapObj || {}).sort((a, b) => b[1] - a[1]).slice(0, 4);
      if (entries.length === 0) {
        container.innerHTML = '<div style="font-size:0.78rem; color:#71717a;">' + emptyText + '</div>';
        return;
      }
      const maxVal = Math.max(...entries.map((e) => Number(e[1]) || 0), 1);
      container.innerHTML = entries.map(([label, count]) => {
        const pct = Math.max(8, Math.round((Number(count) / maxVal) * 100));
        return '<div class="insight-row">' +
          '<div class="insight-meta">' +
            '<span class="mono" style="color:#e4e4e7;">' + escapeHtml(label) + '</span>' +
            '<span class="mono text-cyan">' + Number(count).toLocaleString() + '</span>' +
          '</div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
        '</div>';
      }).join('');
    }

    function updateStats(stats) {
      if (!stats) return;
      document.getElementById('m-intercepted').innerText = Number(stats.botsIntercepted || 0).toLocaleString();
      document.getElementById('m-honeypot').innerText = Number(stats.honeypotTriggers || 0).toLocaleString();
      document.getElementById('m-goodbots').innerText = Number(stats.goodBotsAllowed || 0).toLocaleString();
      document.getElementById('m-tokens').innerText = Number(stats.estimatedFakeTokens || 0).toLocaleString();
      renderBreakdown('top-bots-list', stats.topBots, 'No bot activity recorded yet.');
      renderBreakdown('top-routes-list', stats.topRoutes, 'No targeted routes recorded yet.');
    }

    let toastTimer = null;
    function triggerAlertToast(evt) {
      const toast = document.getElementById('alert-toast');
      const body = document.getElementById('toast-body');
      const time = document.getElementById('toast-time');

      time.innerText = new Date(evt.timestamp).toLocaleTimeString();
      body.innerHTML = '<strong>' + escapeHtml(evt.botName) + '</strong> targeted <span class="mono">' + escapeHtml(evt.path) + '</span>.<br>' +
        'Action: <span class="badge badge-danger">' + escapeHtml(evt.action) + '</span> (HTTP 200 OK)';

      toast.style.display = 'block';
      playAlertChime();

      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.style.display = 'none';
      }, 4500);
    }

    function escapeHtml(str) {
      return String(str || '').replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    function renderRows(events, isNew) {
      cachedEvents = Array.isArray(events) ? events : [];
      const tbody = document.getElementById('event-rows');
      const filtered = cachedEvents.filter((evt) => {
        if (activeFilter === 'HONEYPOT') return String(evt.action || '').includes('HONEYPOT');
        if (activeFilter === 'POISON') return !String(evt.action || '').includes('HONEYPOT');
        return true;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No matching interception events yet.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map((evt, idx) => {
        const timeStr = new Date(evt.timestamp).toLocaleTimeString();
        const badgeClass = String(evt.action || '').includes('HONEYPOT') ? 'badge-amber' : 'badge-danger';
        const flashClass = isNew && idx === 0 ? 'new-row' : '';

        return '<tr class="' + flashClass + '">' +
          '<td class="mono">' + timeStr + '</td>' +
          '<td><strong>' + escapeHtml(evt.botName) + '</strong></td>' +
          '<td><span class="mono">' + evt.score + '/100</span></td>' +
          '<td class="mono text-cyan">' + escapeHtml(evt.path) + '</td>' +
          '<td><span class="badge ' + badgeClass + '">' + escapeHtml(evt.action) + '</span></td>' +
          '<td class="mono" style="opacity:0.7;">' + escapeHtml(evt.ipHash) + '</td>' +
        '</tr>';
      }).join('');
    }

    function initSSE() {
      const connStatus = document.getElementById('conn-status');
      let es = null;

      try {
        es = new EventSource(basePath + '/events');

        es.onopen = () => {
          connStatus.innerText = '● Live EventSource Active';
          connStatus.style.color = '#34d399';
        };

        es.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            if (data.type === 'init') {
              updateStats(data.stats);
              renderRows(data.events, false);
            } else if (data.type === 'event') {
              updateStats(data.stats);
              triggerAlertToast(data.event);
              fetch(basePath + '/api/stats')
                .then(r => r.json())
                .then(res => {
                  if (res.recentEvents) renderRows(res.recentEvents, true);
                });
            }
          } catch (e) {
            console.error('SSE parse error:', e);
          }
        };

        es.onerror = () => {
          connStatus.innerText = '● Polling Fallback';
          connStatus.style.color = '#fbbf24';
          es.close();
          setInterval(fetchLatestStats, 3000);
        };
      } catch {
        connStatus.innerText = '● Polling Mode';
        setInterval(fetchLatestStats, 3000);
      }
    }

    async function fetchLatestStats() {
      try {
        const res = await fetch(basePath + '/api/stats');
        const data = await res.json();
        if (data.stats) updateStats(data.stats);
        if (data.recentEvents) renderRows(data.recentEvents, false);
      } catch {
        // silent
      }
    }

    initSSE();
  </script>
</body>
</html>`;
  }
}
