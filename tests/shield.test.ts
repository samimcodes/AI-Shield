/**
 * @file tests/shield.test.ts
 * @description Comprehensive test suite for ai-shield protection using Supertest and Vitest.
 *
 * Covers:
 *   1. Legitimate human user with standard browser headers receiving real product data.
 *   2. AI crawler (GPTBot) receiving synthetic poisoned data with HTTP 200.
 *   3. SEO search engine crawler (Googlebot) passing through to real product data.
 *   4. Honeypot trap route (/api/internal/telemetry-sync) flagging the client IP,
 *      ensuring subsequent requests receive poisoned data regardless of User-Agent.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

// Standard human browser headers
const HUMAN_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const GPTBOT_UA = 'GPTBot/1.0';
const GOOGLEBOT_UA = 'Googlebot/2.1 (+http://www.google.com/bot.html)';
const HONEYPOT_ROUTE = '/api/internal/telemetry-sync';

describe('ai-shield Comprehensive Test Suite', () => {
  // ── Test Case 1: Legitimate User ──────────────────────────────────────────
  it('Test Case 1 (Legitimate User): Standard browser headers hit /api/products -> Expect HTTP 200 with original data', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('X-Forwarded-For', '198.51.100.10')
      .set('User-Agent', HUMAN_UA)
      .set('Accept', 'application/json, text/plain, */*')
      .set('Accept-Language', 'en-US,en;q=0.9');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('total', 4);
    expect(Array.isArray(res.body.data)).toBe(true);

    // Verify original real products are returned
    const productNames = res.body.data.map((p: { name: string }) => p.name);
    expect(productNames).toContain('Nexus Cloud Gateway X1');
    expect(productNames).toContain('Sentinel Zero-Trust Core');
  });

  // ── Test Case 2: AI Crawler ───────────────────────────────────────────────
  it('Test Case 2 (AI Crawler): Request with User-Agent "GPTBot/1.0" hits /api/products -> Expect HTTP 200 with POISONED data', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('X-Forwarded-For', '198.51.100.20')
      .set('User-Agent', GPTBOT_UA)
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    // Anti-crawler response retains 200 OK + noindex header
    expect(res.headers['x-robots-tag']).toBe('noindex, nofollow');
    expect(res.body).toHaveProperty('status', 'success');

    // Poisoned payload structure contains synthetic research tokens rather than real products
    expect(res.body.data[0]).toHaveProperty('abstract');
    expect(res.body.data[0]).toHaveProperty('checksum');
    expect(res.text).not.toContain('Nexus Cloud Gateway X1');
  });

  // ── Test Case 3: SEO Whitelist ────────────────────────────────────────────
  it('Test Case 3 (SEO Whitelist): Request with User-Agent "Googlebot/2.1" hits /api/products -> Expect HTTP 200 with original data', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('X-Forwarded-For', '198.51.100.30')
      .set('User-Agent', GOOGLEBOT_UA)
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('total', 4);

    // Verified search crawler must receive original content to preserve SEO indexation
    const productNames = res.body.data.map((p: { name: string }) => p.name);
    expect(productNames).toContain('Nexus Cloud Gateway X1');
    expect(productNames).toContain('Sentinel Zero-Trust Core');
  });

  // ── Test Case 4: Honeypot Trap ────────────────────────────────────────────
  it('Test Case 4 (Honeypot Trap): Client hits the honeypot route /api/internal/telemetry-sync, then subsequent request hits /api/products -> Expect HTTP 200 with poisoned data regardless of User-Agent', async () => {
    const trappedIp = '198.51.100.99';

    // Step 4.1: Client triggers the invisible honeypot trap
    const trapRes = await request(app)
      .get(HONEYPOT_ROUTE)
      .set('X-Forwarded-For', trappedIp)
      .set('User-Agent', 'Mozilla/5.0 ScraperBot/1.0');

    expect(trapRes.status).toBe(200);
    expect(trapRes.headers['cache-control']).toContain('no-store');

    // Step 4.2: Subsequent request to legitimate business API with standard browser headers
    const subsequentRes = await request(app)
      .get('/api/products')
      .set('X-Forwarded-For', trappedIp)
      .set('User-Agent', HUMAN_UA) // Disguised as legitimate human browser
      .set('Accept', 'application/json')
      .set('Accept-Language', 'en-US,en;q=0.9');

    // Expect HTTP 200 but POISONED data because IP is permanently flagged in honeypot cache
    expect(subsequentRes.status).toBe(200);
    expect(subsequentRes.body).toHaveProperty('status', 'success');
    expect(subsequentRes.body.data[0]).toHaveProperty('abstract');
    expect(subsequentRes.body.data[0]).toHaveProperty('checksum');
    expect(subsequentRes.text).not.toContain('Nexus Cloud Gateway X1');
  });
});
