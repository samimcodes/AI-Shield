import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express, { type Request, type Response } from 'express';
import request from 'supertest';
import { DashboardManager } from './dashboard.js';
import { BotCategory } from '../types/index.js';
import { createAiShield } from '../middleware.js';

describe('DashboardManager', () => {
  let manager: DashboardManager;

  beforeEach(() => {
    manager = new DashboardManager({ basePath: '/admin/ai-shield' });
  });

  afterEach(() => {
    manager.close();
  });

  it('initializes with zeroed statistics and empty events', () => {
    const stats = manager.getStats();
    expect(stats.totalRequests).toBe(0);
    expect(stats.botsIntercepted).toBe(0);
    expect(stats.goodBotsAllowed).toBe(0);
    expect(stats.honeypotTriggers).toBe(0);
    expect(manager.getEvents()).toEqual([]);
  });

  it('records normal requests', () => {
    manager.recordRequest();
    manager.recordRequest();
    expect(manager.getStats().totalRequests).toBe(2);
  });

  it('records legitimate search engines (good bots)', () => {
    manager.recordGoodBot('Googlebot', '/blog/post-1');
    const stats = manager.getStats();
    expect(stats.totalRequests).toBe(1);
    expect(stats.goodBotsAllowed).toBe(1);
    expect(stats.topBots['Googlebot']).toBe(1);
    expect(stats.topRoutes['/blog/post-1']).toBe(1);
  });

  it('records intercepted bot events and prepends to recent events', () => {
    const event = manager.recordEvent({
      botName: 'GPTBot',
      category: BotCategory.AI_CRAWLER,
      path: '/api/products',
      score: 100,
      signals: ['UA_PATTERN_MATCH'],
      ipHash: 'abc12345',
      userAgent: 'Mozilla/5.0 (compatible; GPTBot/1.0)',
      action: 'POISON_JSON',
    });

    expect(event.id).toMatch(/^evt_/);
    expect(event.botName).toBe('GPTBot');

    const stats = manager.getStats();
    expect(stats.botsIntercepted).toBe(1);
    expect(stats.poisonPayloadsServed).toBe(1);
    expect(stats.estimatedFakeTokens).toBeGreaterThan(0);
    expect(stats.topBots['GPTBot']).toBe(1);

    const events = manager.getEvents();
    expect(events.length).toBe(1);
    expect(events[0].id).toBe(event.id);
  });

  it('records honeypot trap triggers', () => {
    manager.recordEvent({
      botName: 'HoneypotTrap:Secret bait',
      category: BotCategory.AI_CRAWLER,
      path: '/api/internal/telemetry-sync',
      score: 100,
      signals: ['HONEYPOT_TRIGGERED'],
      ipHash: 'deadbeef',
      userAgent: 'ScraperBot/2.0',
      action: 'HONEYPOT_TRAP',
    });

    const stats = manager.getStats();
    expect(stats.botsIntercepted).toBe(1);
    expect(stats.honeypotTriggers).toBe(1);
    expect(stats.poisonPayloadsServed).toBe(0);
  });

  it('respects maxStoredEvents cap', () => {
    const smallManager = new DashboardManager({ maxStoredEvents: 3 });
    for (let i = 0; i < 5; i++) {
      smallManager.recordEvent({
        botName: `Bot-${i}`,
        category: BotCategory.SCRAPER,
        path: `/path-${i}`,
        score: 80,
        signals: ['SUSPICIOUS_UA'],
        ipHash: `hash-${i}`,
        userAgent: `BotUA-${i}`,
        action: 'POISON_HTML',
      });
    }

    const events = smallManager.getEvents();
    expect(events.length).toBe(3);
    expect(events[0].botName).toBe('Bot-4');
    expect(events[2].botName).toBe('Bot-2');
    smallManager.close();
  });

  describe('HTTP endpoints', () => {
    let app: express.Express;

    beforeEach(() => {
      app = express();
      app.use('/admin/ai-shield', manager.buildRouter());
    });

    it('GET /admin/ai-shield returns HTML dashboard with UTF-8 charset', async () => {
      const res = await request(app).get('/admin/ai-shield');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.text).toContain('AI Shield — Live Security Monitor');
      expect(res.text).toContain('ACTIVE DEFENSE');
      expect(res.text).toContain('Simulate Bot Attack');
    });

    it('GET /admin/ai-shield/api/stats returns JSON metrics', async () => {
      manager.recordGoodBot('Bingbot', '/');
      const res = await request(app).get('/admin/ai-shield/api/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.goodBotsAllowed).toBe(1);
      expect(Array.isArray(res.body.recentEvents)).toBe(true);
    });

    it('POST /admin/ai-shield/api/test-event triggers a simulated test attack', async () => {
      const res = await request(app).post('/admin/ai-shield/api/test-event');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.event.id).toBeDefined();

      const stats = manager.getStats();
      expect(stats.botsIntercepted).toBe(1);
    });

    it('enforces authentication when dashboardAuth is configured with token', async () => {
      const secureManager = new DashboardManager({
        auth: { token: 'secret-shield-key-123' },
      });
      const secureApp = express();
      secureApp.use('/admin/ai-shield', secureManager.buildRouter());

      // Unauthorized without token
      const unauth = await request(secureApp).get('/admin/ai-shield/api/stats');
      expect(unauth.status).toBe(401);

      // Authorized with header
      const authHeader = await request(secureApp)
        .get('/admin/ai-shield/api/stats')
        .set('x-ai-shield-key', 'secret-shield-key-123');
      expect(authHeader.status).toBe(200);
      expect(authHeader.body.success).toBe(true);

      // Authorized with query param
      const authQuery = await request(secureApp)
        .get('/admin/ai-shield/api/stats?token=secret-shield-key-123');
      expect(authQuery.status).toBe(200);

      secureManager.close();
    });
  });

  describe('Middleware Integration with Dashboard', () => {
    it('serves dashboard and tracks live bot interceptions through aiShield middleware', async () => {
      const app = express();
      const shield = createAiShield({
        enableDashboard: true,
        dashboardPath: '/security/monitor',
      });

      app.use(shield);
      app.get('/api/secret', (_req, res) => res.json({ secret: 'real-human-data' }));

      // 1. Visit dashboard HTML
      const dashRes = await request(app).get('/security/monitor');
      expect(dashRes.status).toBe(200);
      expect(dashRes.text).toContain('AI Shield — Live Security Monitor');

      // 2. Normal human request to /api/secret
      const humanRes = await request(app).get('/api/secret');
      expect(humanRes.status).toBe(200);
      expect(humanRes.body).toEqual({ secret: 'real-human-data' });

      // 3. AI Crawler (GPTBot) attack to /api/secret
      const botRes = await request(app)
        .get('/api/secret')
        .set('User-Agent', 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)')
        .set('Accept', 'application/json');

      expect(botRes.status).toBe(200);
      // Poisoned response
      expect(botRes.body).not.toEqual({ secret: 'real-human-data' });

      // 4. Check dashboard stats API
      const statsRes = await request(app).get('/security/monitor/api/stats');
      expect(statsRes.status).toBe(200);
      expect(statsRes.body.stats.botsIntercepted).toBe(1);
      expect(statsRes.body.stats.topBots['GPTBot']).toBe(1);
      expect(statsRes.body.recentEvents[0].botName).toBe('GPTBot');

      shield.dashboard?.close();
    });
  });
});
