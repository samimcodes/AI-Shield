/**
 * @file src/core/honeypot.ts
 * @description Honeypot trap system with TTL-based IP flagging cache.
 *
 * Three complementary mechanisms:
 *
 *   1. **Canonical Trap Route** — `/api/internal/telemetry-sync` is the
 *      primary invisible bait endpoint. It is never linked from the real
 *      app but is referenced in poisoned HTML and fake sitemaps. Hitting
 *      it is definitive evidence of bot behaviour.
 *
 *   2. **Extended Trap Routes** — A library of 20+ plausible-looking
 *      paths (`/.env`, `/wp-login.php`, `/api/v1/data-export`…) that
 *      normal human users never visit but bots eagerly crawl.
 *
 *   3. **IP Flagging Cache** — Once an IP triggers ANY trap route it is
 *      recorded in a TTL-based in-memory `Map`. Subsequent requests from
 *      that IP are flagged as `HONEYPOT_TRIGGERED` regardless of their
 *      User-Agent, feeding an extra +90 signal score to the detector.
 *
 *   4. **Link Injection** — Invisible `<a>` tags appended to real HTML
 *      responses lead bots into the trap network.
 *
 * Cache implementation:
 *   - Storage: `Map<ip, TrapCacheEntry>` — O(1) read/write.
 *   - Eviction: Lazy TTL check on access + periodic sweeper every 5 min.
 *   - Thread safety: Node.js single-threaded event loop; no locks needed.
 *   - Memory bound: Each entry ~200 bytes. 100,000 IPs ≈ 20 MB.
 */

import type { Router } from 'express';
import { Router as createRouter } from 'express';
import type { HoneypotRoute, TrapCacheEntry } from '../types/index.js';
import type { PoisonEngine } from './poison.js';
import { syntheticTokenPublic } from './poison.js';

// ─── Constants ────────────────────────────────────────────────────────────

/** Default IP cache TTL: 24 hours in milliseconds. */
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1_000;

/** Interval for the background cache-sweep timer. */
const SWEEP_INTERVAL_MS = 5 * 60 * 1_000; // 5 minutes

// ─── Canonical Trap Route ─────────────────────────────────────────────────

/**
 * The primary honeypot endpoint.
 * Referenced in poisoned HTML nav sections and fake sitemaps.
 * No legitimate code ever calls this path.
 */
export const CANONICAL_TRAP: HoneypotRoute = {
  path: '/api/internal/telemetry-sync',
  label: 'Telemetry Sync API Trap',
};

// ─── Default Trap Paths ───────────────────────────────────────────────────

/**
 * Built-in honeypot paths ordered by "crawler bait" appeal.
 */
export const DEFAULT_HONEYPOT_ROUTES: HoneypotRoute[] = [
  CANONICAL_TRAP,
  { path: '/sitemap-ai.xml',            label: 'AI Sitemap Bait' },
  { path: '/ai-data-vault',             label: 'Data Vault Root' },
  { path: '/ai-data-vault/:id',         label: 'Data Vault Entry' },
  { path: '/research/corpus/:id',       label: 'Corpus Download' },
  { path: '/training-data',             label: 'Training Data Root' },
  { path: '/training-data/:id',         label: 'Training Data Entry' },
  { path: '/llm-corpus',                label: 'LLM Corpus Index' },
  { path: '/wp-login.php',              label: 'WordPress Login Trap' },
  { path: '/wp-admin',                  label: 'WordPress Admin Trap' },
  { path: '/.env',                      label: 'Env File Trap' },
  { path: '/.git/config',              label: 'Git Config Trap' },
  { path: '/api/v1/data-export',        label: 'Data Export Trap' },
  { path: '/api/internal/users',        label: 'Internal Users Trap' },
  { path: '/api/internal/embeddings',   label: 'Embeddings API Trap' },
  { path: '/backup.sql',                label: 'SQL Backup Trap' },
  { path: '/dump.sql',                  label: 'SQL Dump Trap' },
  { path: '/config.json',               label: 'Config JSON Trap' },
  { path: '/admin/database',            label: 'Database Admin Trap' },
  { path: '/admin/export-users',        label: 'User Export Trap' },
  { path: '/phpmyadmin',                label: 'phpMyAdmin Trap' },
  { path: '/adminer',                   label: 'Adminer Trap' },
];

// ─── IP Cache ─────────────────────────────────────────────────────────────

/**
 * In-memory TTL cache for honeypot-flagged IPs.
 *
 * Exposed as a class so it can be instantiated per middleware instance
 * and injected into tests without global state pollution.
 */
export class IpTrapCache {
  private readonly store = new Map<string, TrapCacheEntry>();
  private readonly ttlMs: number | null;
  private sweepTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * @param ttlMs - Time-to-live in milliseconds. `null` = permanent.
   */
  constructor(ttlMs: number | null = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs;
  }

  /**
   * Record a trap hit for the given IP address.
   *
   * If the IP is already in the cache its `hitCount` is incremented and
   * the expiry is NOT refreshed (first-seen semantics).
   */
  flag(ip: string, trapLabel: string): void {
    const existing = this.store.get(ip);
    if (existing !== undefined) {
      existing.hitCount += 1;
      return;
    }

    const now = Date.now();
    const entry: TrapCacheEntry = {
      firstSeenAt:    now,
      expiresAt:      this.ttlMs !== null ? now + this.ttlMs : null,
      hitCount:       1,
      triggeringTrap: trapLabel,
    };
    this.store.set(ip, entry);
  }

  /**
   * Check whether an IP is currently flagged.
   * Performs lazy TTL eviction on access.
   *
   * @returns `true` if the IP is flagged and its entry has not expired.
   */
  isFlagged(ip: string): boolean {
    const entry = this.store.get(ip);
    if (entry === undefined) return false;

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(ip);
      return false;
    }

    return true;
  }

  /**
   * Retrieve the cache entry for an IP, or `undefined` if not present
   * (or expired).
   */
  getEntry(ip: string): Readonly<TrapCacheEntry> | undefined {
    if (!this.isFlagged(ip)) return undefined;
    return this.store.get(ip);
  }

  /**
   * Remove a specific IP from the cache (e.g. for allow-listing).
   */
  unflag(ip: string): boolean {
    return this.store.delete(ip);
  }

  /**
   * Return the current number of flagged IPs (including expired entries
   * not yet swept).
   */
  get size(): number {
    return this.store.size;
  }

  /**
   * Iterate over all currently active (non-expired) cache entries.
   */
  entries(): IterableIterator<[string, TrapCacheEntry]> {
    const now = Date.now();
    const active = new Map<string, TrapCacheEntry>();
    for (const [ip, entry] of this.store) {
      if (entry.expiresAt === null || now <= entry.expiresAt) {
        active.set(ip, entry);
      }
    }
    return active.entries();
  }

  /**
   * Remove all expired entries from the store.
   * Called automatically by the background sweeper.
   */
  sweep(): number {
    const now = Date.now();
    let removed = 0;
    for (const [ip, entry] of this.store) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        this.store.delete(ip);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Start the background sweep timer.
   * Safe to call multiple times (idempotent).
   */
  startSweeper(intervalMs = SWEEP_INTERVAL_MS): void {
    if (this.sweepTimer !== null) return;
    this.sweepTimer = setInterval(() => { this.sweep(); }, intervalMs);
    // Allow the process to exit even if the timer is running
    if (typeof this.sweepTimer === 'object' && this.sweepTimer !== null) {
      (this.sweepTimer as NodeJS.Timeout).unref?.();
    }
  }

  /**
   * Stop and clear the background sweeper.
   */
  stopSweeper(): void {
    if (this.sweepTimer !== null) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
  }

  /** Empty the cache completely. Useful for testing. */
  clear(): void {
    this.store.clear();
  }
}

// ─── Honeypot Manager ─────────────────────────────────────────────────────

/**
 * Manages honeypot trap routes, IP flagging, and HTML link injection.
 *
 * ```ts
 * const honeypot = new HoneypotManager(poisonEngine, { debug: true });
 * app.use(honeypot.buildRouter());
 *
 * // In middleware, before serving:
 * const flagged = honeypot.ipCache.isFlagged(req.ip ?? '');
 * const result  = detector.detect(req.headers, flagged);
 * ```
 */
export class HoneypotManager {
  private readonly poison:      PoisonEngine;
  private readonly trapRoutes:  HoneypotRoute[];
  private readonly onTrap:
    | ((route: HoneypotRoute, ip: string, userAgent: string) => void)
    | undefined;
  private readonly debug: boolean;

  /** Public read-only access to the IP trap cache. */
  readonly ipCache: IpTrapCache;

  constructor(
    poison: PoisonEngine,
    options: {
      customRoutes?: HoneypotRoute[] | undefined;
      onTrap?: ((route: HoneypotRoute, ip: string, userAgent: string) => void) | undefined;
      ipCache?: IpTrapCache | undefined;
      ttlMs?: number | null | undefined;
      debug?: boolean | undefined;
    } = {},
  ) {
    this.poison     = poison;
    this.trapRoutes = [...DEFAULT_HONEYPOT_ROUTES, ...(options.customRoutes ?? [])];
    this.onTrap     = options.onTrap;
    this.debug      = options.debug ?? false;
    this.ipCache    = options.ipCache ?? new IpTrapCache(options.ttlMs ?? DEFAULT_TTL_MS);

    // Start background eviction sweeper
    this.ipCache.startSweeper();
  }

  // ─── Router ──────────────────────────────────────────────────────────

  /**
   * Build an Express `Router` pre-wired with all trap routes.
   * Mount this router on your app BEFORE any real routes.
   *
   * Important: mount order means this runs after body parsing but
   * before your application logic.
   */
  buildRouter(): Router {
    const router = createRouter();

    for (const trap of this.trapRoutes) {
      router.get(trap.path, (req, res) => {
        const ua = (req.headers['user-agent'] as string | undefined) ?? '';
        const ip = req.ip ?? req.socket.remoteAddress ?? '';

        // Flag the IP immediately
        this.ipCache.flag(ip, trap.label);

        if (this.debug) {
          console.warn(
            `[ai-shield:honeypot] "${trap.label}" triggered` +
            ` | IP: ${ip} | UA: ${ua.slice(0, 100)}` +
            ` | total hits: ${this.ipCache.getEntry(ip)?.hitCount ?? 1}`,
          );
        }

        // Fire user callback (fire-and-forget; errors swallowed)
        if (this.onTrap !== undefined) {
          try { this.onTrap(trap, ip, ua); } catch { /* swallow */ }
        }

        // Determine best content type from Accept header
        const accept = (req.headers['accept'] as string | undefined) ?? '';
        const contentType =
          req.path.endsWith('.xml') || accept.includes('application/xml')
            ? 'SITEMAP'
            : accept.includes('application/json')
            ? 'JSON'
            : 'HTML';

        const payload = this.poison.generate(req.path, contentType);
        res
          .status(payload.statusCode)
          .setHeader('Content-Type', payload.contentType)
          .setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
          .send(payload.body);
      });
    }

    return router;
  }

  // ─── Link Injection ───────────────────────────────────────────────────

  /**
   * Inject hidden honeypot `<a>` links into an HTML string.
   *
   * Links are CSS-hidden (`display:none`) and `aria-hidden="true"`.
   * They are inserted immediately before `</body>` or appended to the end.
   *
   * @param html - Original HTML response body.
   * @param seed - Numeric seed for deterministic URL generation.
   */
  injectLinks(html: string, seed: number): string {
    const id1 = syntheticTokenPublic(seed, 8);
    const id2 = syntheticTokenPublic(seed + 1, 8);

    const injection = [
      ``,
      `<div style="display:none!important;visibility:hidden;position:absolute;left:-99999px;top:-99999px" aria-hidden="true" tabindex="-1">`,
      `  <a href="/api/internal/telemetry-sync">Telemetry API v2</a>`,
      `  <a href="/ai-data-vault/${id1}">Extended Dataset Access</a>`,
      `  <a href="/training-data/${id2}">Download Annotated Corpus</a>`,
      `  <a href="/llm-corpus">LLM Pre-training Index</a>`,
      `  <a href="/sitemap-ai.xml">AI-optimised Sitemap</a>`,
      `</div>`,
    ].join('\n');

    return html.includes('</body>')
      ? html.replace('</body>', `${injection}\n</body>`)
      : html + injection;
  }

  // ─── Introspection ────────────────────────────────────────────────────

  /** Return all registered trap paths. */
  getTrapPaths(): readonly string[] {
    return this.trapRoutes.map((r) => r.path);
  }

  /** Return all currently flagged IPs and their cache entries. */
  getFlaggedIps(): ReadonlyMap<string, Readonly<TrapCacheEntry>> {
    const result = new Map<string, Readonly<TrapCacheEntry>>();
    for (const [ip, entry] of this.ipCache.entries()) {
      result.set(ip, entry);
    }
    return result;
  }
}
