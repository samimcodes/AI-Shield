/**
 * @file src/core/telemetry.test.ts
 * @description Unit and integration tests for TelemetryEmitter and middleware telemetry integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  TelemetryEmitter,
  hashClientIp,
  MAX_BATCH_SIZE,
  DEFAULT_DASHBOARD_URL,
} from './telemetry.js';
import express from 'express';
import request from 'supertest';
import { createAiShield } from '../middleware.js';

describe('TelemetryEmitter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('hashes client IP addresses deterministically via SHA-256', () => {
    const ip = '198.51.100.42';
    const hash1 = hashClientIp(ip);
    const hash2 = hashClientIp(ip);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex string
    expect(hashClientIp('')).toBe('anonymous');
  });

  it('buffers events without flushing until threshold or timer trigger', () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    const emitter = new TelemetryEmitter({
      apiKey: 'test-api-key',
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    emitter.emit({
      timestamp: new Date().toISOString(),
      path: '/api/data',
      reason: 'GPTBot',
      clientIpHash: 'hash123',
      userAgent: 'GPTBot/1.0',
    });

    expect(emitter.queueLength).toBe(1);
    expect(mockFetch).not.toHaveBeenCalled();

    void emitter.destroy();
  });

  it('flushes immediately when queue hits batch size threshold (20 events)', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    const emitter = new TelemetryEmitter({
      apiKey: 'test-api-key',
      batchSize: 20,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    for (let i = 0; i < 19; i++) {
      emitter.emit({
        timestamp: new Date().toISOString(),
        path: `/item/${i}`,
        reason: 'Bot',
        clientIpHash: 'hash',
        userAgent: 'ScraperBot',
      });
    }

    expect(emitter.queueLength).toBe(19);
    expect(mockFetch).not.toHaveBeenCalled();

    // 20th item triggers the immediate flush
    emitter.emit({
      timestamp: new Date().toISOString(),
      path: '/item/19',
      reason: 'Bot',
      clientIpHash: 'hash',
      userAgent: 'ScraperBot',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(emitter.queueLength).toBe(0);

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[0]).toBe(DEFAULT_DASHBOARD_URL);
    expect(callArgs[1].headers['Authorization']).toBe('Bearer test-api-key');

    const body = JSON.parse(callArgs[1].body);
    expect(body.count).toBe(20);
    expect(body.events).toHaveLength(20);

    await emitter.destroy();
  });

  it('flushes periodically every 5 seconds when buffer is not empty', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    const emitter = new TelemetryEmitter({
      apiKey: 'key-123',
      flushIntervalMs: 5000,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    emitter.emit({
      timestamp: new Date().toISOString(),
      path: '/honeypot',
      reason: 'Trap',
      clientIpHash: 'h',
      userAgent: 'Bot',
    });

    expect(mockFetch).not.toHaveBeenCalled();

    // Advance clock by 5 seconds
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(emitter.queueLength).toBe(0);

    await emitter.destroy();
  });

  it('swallows network transmission errors silently without throwing', async () => {
    const failingFetch = vi.fn().mockRejectedValue(new Error('Network offline / DNS failure'));
    const emitter = new TelemetryEmitter({
      apiKey: 'key-123',
      fetchFn: failingFetch as unknown as typeof fetch,
    });

    emitter.emit({
      timestamp: new Date().toISOString(),
      path: '/err',
      reason: 'Bot',
      clientIpHash: 'h',
      userAgent: 'Bot',
    });

    // Flushing should not throw
    await expect(emitter.flush()).resolves.toBeUndefined();
    await emitter.destroy();
  });
});

describe('Middleware Telemetry Integration', () => {
  it('emits telemetry event with payload { timestamp, path, reason, clientIpHash, userAgent } when scraper is trapped', async () => {
    const app = express();
    app.set('trust proxy', 1);

    const shield = createAiShield({
      apiKey: 'dash-key-xyz',
      dashboardUrl: 'https://custom.dashboard/api/events',
    });
    app.use(shield);

    const telemetry = shield.telemetry;
    expect(telemetry).toBeDefined();

    const emitSpy = vi.spyOn(telemetry!, 'emit');

    // Trigger honeypot route
    await request(app)
      .get('/api/internal/telemetry-sync')
      .set('X-Forwarded-For', '203.0.113.88')
      .set('User-Agent', 'BadScraper/2.0');

    expect(emitSpy).toHaveBeenCalledTimes(1);
    const emittedEvent = emitSpy.mock.calls[0]![0];

    expect(emittedEvent).toHaveProperty('timestamp');
    expect(emittedEvent.path).toBe('/api/internal/telemetry-sync');
    expect(emittedEvent.reason).toContain('HoneypotTrap');
    expect(emittedEvent.clientIpHash).toBe(hashClientIp('203.0.113.88'));
    expect(emittedEvent.userAgent).toBe('BadScraper/2.0');

    await telemetry!.destroy();
  });

  it('emits telemetry event when AI crawler is intercepted and served poison', async () => {
    const app = express();
    app.set('trust proxy', 1);

    const shield = createAiShield({
      apiKey: 'dash-key-abc',
    });
    app.use(shield);
    app.get('/api/data', (_req, res) => res.json({ secret: 'real' }));

    const telemetry = shield.telemetry;
    expect(telemetry).toBeDefined();

    const emitSpy = vi.spyOn(telemetry!, 'emit');

    // Send AI crawler request
    await request(app)
      .get('/api/data')
      .set('X-Forwarded-For', '203.0.113.99')
      .set('User-Agent', 'GPTBot/1.0')
      .set('Accept', 'application/json');

    expect(emitSpy).toHaveBeenCalledTimes(1);
    const emittedEvent = emitSpy.mock.calls[0]![0];

    expect(emittedEvent).toHaveProperty('timestamp');
    expect(emittedEvent.path).toBe('/api/data');
    expect(emittedEvent.reason).toBe('GPTBot');
    expect(emittedEvent.clientIpHash).toBe(hashClientIp('203.0.113.99'));
    expect(emittedEvent.userAgent).toBe('GPTBot/1.0');

    await telemetry!.destroy();
  });
});
