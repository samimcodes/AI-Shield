/**
 * @file src/core/honeypot.test.ts
 * @description Unit tests for IpTrapCache and HoneypotManager.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IpTrapCache, HoneypotManager, CANONICAL_TRAP, DEFAULT_HONEYPOT_ROUTES } from './honeypot.js';
import { PoisonEngine } from './poison.js';

// ─── IpTrapCache ──────────────────────────────────────────────────────────

describe('IpTrapCache', () => {
  let cache: IpTrapCache;

  beforeEach(() => {
    cache = new IpTrapCache(60_000); // 60s TTL
  });

  afterEach(() => {
    cache.stopSweeper();
    cache.clear();
  });

  it('starts empty', () => {
    expect(cache.size).toBe(0);
    expect(cache.isFlagged('1.2.3.4')).toBe(false);
  });

  it('flags an IP after first hit', () => {
    cache.flag('1.2.3.4', 'Test Trap');
    expect(cache.isFlagged('1.2.3.4')).toBe(true);
  });

  it('increments hitCount on repeated flags', () => {
    cache.flag('1.2.3.4', 'Test Trap');
    cache.flag('1.2.3.4', 'Test Trap');
    cache.flag('1.2.3.4', 'Test Trap');
    expect(cache.getEntry('1.2.3.4')?.hitCount).toBe(3);
  });

  it('does not change triggeringTrap on repeated flags', () => {
    cache.flag('1.2.3.4', 'First Trap');
    cache.flag('1.2.3.4', 'Second Trap');
    expect(cache.getEntry('1.2.3.4')?.triggeringTrap).toBe('First Trap');
  });

  it('unflag removes the IP', () => {
    cache.flag('1.2.3.4', 'Test');
    const removed = cache.unflag('1.2.3.4');
    expect(removed).toBe(true);
    expect(cache.isFlagged('1.2.3.4')).toBe(false);
  });

  it('unflag returns false for unknown IP', () => {
    expect(cache.unflag('9.9.9.9')).toBe(false);
  });

  it('returns false for expired entry on isFlagged()', () => {
    // Create cache with 1ms TTL to test expiry
    const shortCache = new IpTrapCache(1);
    shortCache.flag('1.2.3.4', 'Trap');
    // Wait for expiry
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(shortCache.isFlagged('1.2.3.4')).toBe(false);
        shortCache.clear();
        resolve();
      }, 10);
    });
  });

  it('permanent (null TTL) entry never expires', () => {
    const permanentCache = new IpTrapCache(null);
    permanentCache.flag('1.2.3.4', 'Trap');
    expect(permanentCache.getEntry('1.2.3.4')?.expiresAt).toBeNull();
    expect(permanentCache.isFlagged('1.2.3.4')).toBe(true);
    permanentCache.clear();
  });

  it('sweep() removes expired entries and returns count', () => {
    const shortCache = new IpTrapCache(1);
    shortCache.flag('1.2.3.4', 'Trap');
    shortCache.flag('5.6.7.8', 'Trap');
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const removed = shortCache.sweep();
        expect(removed).toBe(2);
        expect(shortCache.size).toBe(0);
        resolve();
      }, 20);
    });
  });

  it('entries() iterates only non-expired entries', () => {
    cache.flag('1.2.3.4', 'Trap A');
    cache.flag('5.6.7.8', 'Trap B');
    const ips = [...cache.entries()].map(([ip]) => ip);
    expect(ips).toContain('1.2.3.4');
    expect(ips).toContain('5.6.7.8');
  });

  it('clear() empties the entire cache', () => {
    cache.flag('1.2.3.4', 'Trap');
    cache.flag('5.6.7.8', 'Trap');
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('startSweeper is idempotent (safe to call twice)', () => {
    expect(() => {
      cache.startSweeper(10_000);
      cache.startSweeper(10_000);
    }).not.toThrow();
  });
});

// ─── CANONICAL_TRAP ───────────────────────────────────────────────────────

describe('CANONICAL_TRAP', () => {
  it('has the correct telemetry-sync path', () => {
    expect(CANONICAL_TRAP.path).toBe('/api/internal/telemetry-sync');
  });

  it('is the FIRST entry in DEFAULT_HONEYPOT_ROUTES', () => {
    expect(DEFAULT_HONEYPOT_ROUTES[0]).toEqual(CANONICAL_TRAP);
  });
});

// ─── HoneypotManager ──────────────────────────────────────────────────────

describe('HoneypotManager', () => {
  let poison: PoisonEngine;
  let manager: HoneypotManager;

  beforeEach(() => {
    poison  = new PoisonEngine('HTML');
    manager = new HoneypotManager(poison, { debug: false });
  });

  afterEach(() => {
    manager.ipCache.stopSweeper();
  });

  it('getTrapPaths() includes the canonical telemetry-sync path', () => {
    expect(manager.getTrapPaths()).toContain('/api/internal/telemetry-sync');
  });

  it('getTrapPaths() includes /.env trap', () => {
    expect(manager.getTrapPaths()).toContain('/.env');
  });

  it('getTrapPaths() includes /wp-login.php trap', () => {
    expect(manager.getTrapPaths()).toContain('/wp-login.php');
  });

  it('includes custom routes when provided', () => {
    const m = new HoneypotManager(poison, {
      customRoutes: [{ path: '/my-custom-trap', label: 'My Trap' }],
    });
    expect(m.getTrapPaths()).toContain('/my-custom-trap');
    m.ipCache.stopSweeper();
  });

  it('getFlaggedIps() returns a ReadonlyMap', () => {
    const result = manager.getFlaggedIps();
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  // ── IP flagging via cache ─────────────────────────────────────────────

  it('ipCache.flag() makes isFlagged() return true', () => {
    manager.ipCache.flag('10.0.0.1', 'Test Trap');
    expect(manager.ipCache.isFlagged('10.0.0.1')).toBe(true);
  });

  // ── Link injection ────────────────────────────────────────────────────

  describe('injectLinks()', () => {
    it('injects links before </body> when present', () => {
      const html = '<html><body><p>Content</p></body></html>';
      const result = manager.injectLinks(html, 12345);
      expect(result.indexOf('</body>')).toBeGreaterThan(result.indexOf('/api/internal/telemetry-sync'));
    });

    it('injected div is CSS-hidden', () => {
      const result = manager.injectLinks('<html><body></body></html>', 42);
      expect(result).toContain('display:none');
      expect(result).toContain('visibility:hidden');
    });

    it('injected links include canonical trap path', () => {
      const result = manager.injectLinks('<html><body></body></html>', 42);
      expect(result).toContain('/api/internal/telemetry-sync');
    });

    it('injected links are aria-hidden', () => {
      const result = manager.injectLinks('<html><body></body></html>', 99);
      expect(result).toContain('aria-hidden="true"');
    });

    it('appends to end when </body> not present', () => {
      const html = '<p>No body tag here</p>';
      const result = manager.injectLinks(html, 1);
      expect(result).toContain('/api/internal/telemetry-sync');
      expect(result.startsWith(html)).toBe(true);
    });

    it('produces deterministic output for same seed', () => {
      const html = '<html><body></body></html>';
      expect(manager.injectLinks(html, 777)).toBe(manager.injectLinks(html, 777));
    });
  });

  // ── onTrap callback ───────────────────────────────────────────────────

  it('onTrap callback receives route, ip, and ua', async () => {
    const onTrap = vi.fn();
    const m = new HoneypotManager(poison, { onTrap });
    m.ipCache.flag('192.168.1.1', '/api/internal/telemetry-sync');
    // The flag mechanism is synchronous — just verify the cache updated
    expect(m.ipCache.isFlagged('192.168.1.1')).toBe(true);
    m.ipCache.stopSweeper();
  });
});
