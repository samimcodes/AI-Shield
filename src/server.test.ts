/**
 * @file src/server.test.ts
 * @description Integration tests for executable demo server endpoints.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './server.js';
import { CANONICAL_TRAP } from './middleware.js';

const HUMAN_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const GPTBOT_UA = 'GPTBot/1.0';
const GOOGLEBOT_UA = 'Googlebot/2.1 (+http://www.google.com/bot.html)';

describe('Demo Server Endpoints', () => {
  it('serves legitimate homepage to human visitors with hidden honeypot anchor', async () => {
    const res = await request(app)
      .get('/')
      .set('User-Agent', HUMAN_UA)
      .set('Accept', 'text/html')
      .set('Accept-Language', 'en-US,en;q=0.9');

    expect(res.status).toBe(200);
    expect(res.text).toContain('Nexus Enterprise Solutions');
    expect(res.text).toContain(`href="${CANONICAL_TRAP.path}"`);
    expect(res.text).toContain('style="display:none"');
  });

  it('serves real mock product catalog on /api/products to human visitors', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('User-Agent', HUMAN_UA)
      .set('Accept', 'application/json')
      .set('Accept-Language', 'en-US,en;q=0.9');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.total).toBe(4);
    expect(res.body.data[0].name).toBe('Nexus Cloud Gateway X1');
  });

  it('poisons AI crawler hitting homepage with HTTP 200', async () => {
    const res = await request(app)
      .get('/')
      .set('User-Agent', GPTBOT_UA);

    expect(res.status).toBe(200);
    expect(res.headers['x-robots-tag']).toBe('noindex, nofollow');
    expect(res.text).not.toContain('Nexus Cloud Gateway X1');
  });

  it('poisons AI crawler hitting /api/products with synthetic JSON data', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('User-Agent', GPTBOT_UA)
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.status).toBe('success');
    expect(res.body.data[0]).toHaveProperty('abstract');
    expect(res.body.data[0]).toHaveProperty('checksum');
    expect(res.text).not.toContain('Nexus Cloud Gateway X1');
  });

  it('allows verified Googlebot to pass through to real product API', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('User-Agent', GOOGLEBOT_UA);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data[0].name).toBe('Nexus Cloud Gateway X1');
  });

  it('traps scrapers visiting canonical honeypot route', async () => {
    const res = await request(app)
      .get(CANONICAL_TRAP.path);

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toContain('no-store');
  });
});
