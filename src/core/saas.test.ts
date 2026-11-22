import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { type Request, type Response } from 'express';
import supertest from 'supertest';
import { SaasClient, SAAS_TIER_LIMITS } from './saas.js';
import { createAiShield } from '../middleware.js';
import { BotCategory } from '../types/index.js';

describe('SaasClient Multi-Tenant SaaS Subsystem', () => {
  let client: SaasClient;

  beforeEach(() => {
    client = new SaasClient({
      apiKey: 'as_live_test_pro_123',
      validationUrl: 'https://test-saas.ai-shield.dev/api/v1/validate',
      cacheTtlMs: 60_000,
    });
  });

  describe('In-Memory Cache & Latency Guarantees', () => {
    it('returns default free result immediately when no apiKey is configured', () => {
      const freeClient = new SaasClient({});
      const res = freeClient.getDefaultFreeResult();

      expect(res.valid).toBe(true);
      expect(res.plan).toBe('FREE');
      expect(res.allowedBots).toEqual(['gptbot']);
      expect(res.dynamicPoisoning).toBe(false);
      expect(res.limitExceeded).toBe(false);
      expect(res.monthlyLimit).toBe(5_000);
    });

    it('returns cached entry in sub-2ms on cache hits', () => {
      client.setCachedResult('as_live_test_pro_123', {
        valid: true,
        plan: 'PRO',
        allowedBots: SAAS_TIER_LIMITS.PRO.allowedBots,
        dynamicPoisoning: true,
        limitExceeded: false,
        requestsThisMonth: 120,
        monthlyLimit: 500_000,
        remainingRequests: 499_880,
      });

      const start = performance.now();
      const cached = client.getCachedValidation('as_live_test_pro_123');
      const durationMs = performance.now() - start;

      expect(cached).not.toBeNull();
      expect(cached?.plan).toBe('PRO');
      expect(cached?.cached).toBe(true);
      expect(durationMs).toBeLessThan(2.0); // Strict sub-2ms latency requirement
    });

    it('invalidates cache entry after TTL expires', () => {
      // Set cache with 1ms TTL
      client.setCachedResult(
        'as_live_test_pro_123',
        {
          valid: true,
          plan: 'PRO',
          allowedBots: ['*'],
          dynamicPoisoning: true,
          limitExceeded: false,
          requestsThisMonth: 0,
          monthlyLimit: 500_000,
          remainingRequests: 500_000,
        },
        -100 // already expired
      );

      const cached = client.getCachedValidation('as_live_test_pro_123');
      expect(cached).toBeNull();
    });
  });

  describe('Tier Bot Coverage & Capabilities', () => {
    it('FREE tier strictly allows only GPTBot', () => {
      // GPTBot should be intercepted
      expect(client.isBotCoveredByPlan('gptbot', 'FREE', ['gptbot'])).toBe(true);
      expect(client.isBotCoveredByPlan('GPTBot/1.0', 'FREE', ['gptbot'])).toBe(true);

      // Advanced bots must NOT be intercepted on Free tier
      expect(client.isBotCoveredByPlan('claude-web', 'FREE', ['gptbot'])).toBe(false);
      expect(client.isBotCoveredByPlan('perplexitybot', 'FREE', ['gptbot'])).toBe(false);
      expect(client.isBotCoveredByPlan('bytespider', 'FREE', ['gptbot'])).toBe(false);
      expect(client.isBotCoveredByPlan('meta-externalagent', 'FREE', ['gptbot'])).toBe(false);
    });

    it('PRO tier allows all AI crawlers & commercial scrapers', () => {
      const proBots = SAAS_TIER_LIMITS.PRO.allowedBots;

      expect(client.isBotCoveredByPlan('gptbot', 'PRO', proBots)).toBe(true);
      expect(client.isBotCoveredByPlan('claude-web', 'PRO', proBots)).toBe(true);
      expect(client.isBotCoveredByPlan('anthropic-ai', 'PRO', proBots)).toBe(true);
      expect(client.isBotCoveredByPlan('perplexitybot', 'PRO', proBots)).toBe(true);
      expect(client.isBotCoveredByPlan('bytespider', 'PRO', proBots)).toBe(true);
      expect(client.isBotCoveredByPlan('meta-externalagent', 'PRO', proBots)).toBe(true);
    });

    it('BUSINESS tier covers wildcard [*]', () => {
      expect(client.isBotCoveredByPlan('any-custom-scraper', 'BUSINESS', ['*'])).toBe(true);
    });
  });

  describe('Graceful Fallback on Network Error / Unreachable Endpoint', () => {
    it('falls back to FREE plan without throwing an exception when fetch fails', async () => {
      // Point client to a non-existent port to simulate network failure
      const offlineClient = new SaasClient({
        apiKey: 'as_live_offline_key',
        validationUrl: 'http://127.0.0.1:59999/api/v1/validate',
        timeoutMs: 100,
      });

      const res = await offlineClient.validate();

      expect(res.valid).toBe(true);
      expect(res.plan).toBe('FREE');
      expect(res.fallback).toBe(true);
      expect(res.allowedBots).toContain('gptbot');
    });
  });

  describe('Asynchronous Bot Event Logging', () => {
    it('emits non-blocking fire-and-forget bot reports without throwing', () => {
      expect(() => {
        client.reportBotEvent({
          apiKey: 'as_live_test_pro_123',
          botName: 'GPTBot',
          path: '/api/v1/pricing',
          actionTaken: 'POISONED',
          bandwidthSavedBytes: 1542,
        });
      }).not.toThrow();
    });
  });
});

describe('Express Middleware Multi-Tenant SaaS Integration', () => {
  it('FREE plan intercepts GPTBot but passes ClaudeBot through', async () => {
    const app = express();
    const shield = createAiShield({
      apiKey: 'as_live_free_customer',
      poisonContentType: 'JSON',
    });

    // Seed cache as FREE plan
    shield.saas?.setCachedResult('as_live_free_customer', {
      valid: true,
      plan: 'FREE',
      allowedBots: ['gptbot'],
      dynamicPoisoning: false,
      limitExceeded: false,
      requestsThisMonth: 10,
      monthlyLimit: 5_000,
      remainingRequests: 4_990,
    });

    app.use(shield);
    app.get('/api/data', (_req: Request, res: Response) => {
      res.json({ secret: 'real-production-data' });
    });

    // 1. GPTBot hitting -> MUST be poisoned
    const gptRes = await supertest(app)
      .get('/api/data')
      .set('User-Agent', 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)');

    expect(gptRes.status).toBe(200);
    expect(gptRes.body.secret).toBeUndefined(); // Poisoned data served
    expect(gptRes.body).toHaveProperty('status');

    // 2. ClaudeBot hitting on Free plan -> MUST pass through (Pro feature)
    const claudeRes = await supertest(app)
      .get('/api/data')
      .set('User-Agent', 'Claude-Web/1.0');

    expect(claudeRes.status).toBe(200);
    expect(claudeRes.body.secret).toBe('real-production-data'); // Passed through to real data
  });

  it('PRO plan intercepts and poisons both GPTBot and ClaudeBot', async () => {
    const app = express();
    const shield = createAiShield({
      apiKey: 'as_live_pro_customer',
      poisonContentType: 'JSON',
    });

    // Seed cache as PRO plan
    shield.saas?.setCachedResult('as_live_pro_customer', {
      valid: true,
      plan: 'PRO',
      allowedBots: SAAS_TIER_LIMITS.PRO.allowedBots,
      dynamicPoisoning: true,
      limitExceeded: false,
      requestsThisMonth: 1500,
      monthlyLimit: 500_000,
      remainingRequests: 498_500,
    });

    app.use(shield);
    app.get('/api/data', (_req: Request, res: Response) => {
      res.json({ secret: 'real-production-data' });
    });

    // 1. GPTBot -> Poisoned
    const gptRes = await supertest(app)
      .get('/api/data')
      .set('User-Agent', 'GPTBot/1.0');
    expect(gptRes.body.secret).toBeUndefined();

    // 2. ClaudeBot -> Poisoned (PRO tier feature)
    const claudeRes = await supertest(app)
      .get('/api/data')
      .set('User-Agent', 'Claude-Web/1.0');
    expect(claudeRes.body.secret).toBeUndefined();
  });

  it('gracefully falls back to basic free protection if monthly limit is exceeded', async () => {
    const app = express();
    const shield = createAiShield({
      apiKey: 'as_live_pro_limit_exceeded',
      poisonContentType: 'JSON',
    });

    // Seed cache with limit exceeded
    shield.saas?.setCachedResult('as_live_pro_limit_exceeded', {
      valid: true,
      plan: 'FREE', // degraded
      allowedBots: ['gptbot'],
      dynamicPoisoning: false,
      limitExceeded: true,
      requestsThisMonth: 500_001,
      monthlyLimit: 500_000,
      remainingRequests: 0,
    });

    app.use(shield);
    app.get('/api/data', (_req: Request, res: Response) => {
      res.json({ secret: 'real-production-data' });
    });

    // ClaudeBot is now passed through because quota exceeded (downgraded to Free)
    const claudeRes = await supertest(app)
      .get('/api/data')
      .set('User-Agent', 'Claude-Web/1.0');
    expect(claudeRes.body.secret).toBe('real-production-data');

    // GPTBot is still caught by basic fallback protection
    const gptRes = await supertest(app)
      .get('/api/data')
      .set('User-Agent', 'GPTBot/1.0');
    expect(gptRes.body.secret).toBeUndefined();
  });
});
