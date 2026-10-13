/**
 * @file src/middleware.ts
 * @description Main ai-shield Express middleware factory.
 *
 * `createAiShield(options?)` returns an Express `RequestHandler` that:
 *
 *  1. Instantiates `BotDetector`, `PoisonEngine`, and `HoneypotManager`
 *     with the supplied options.
 *  2. Optionally activates `TelemetryEmitter` when `apiKey` is provided.
 *  3. Mounts honeypot trap routes (including the canonical
 *     `/api/internal/telemetry-sync` bait) BEFORE real app routes.
 *  4. On each non-trap request:
 *       a. Checks the IP against the in-memory honeypot cache.
 *       b. Runs the multi-signal detector (UA patterns + header heuristics).
 *       c. If score >= scoreThreshold → serves poison (HTTP 200).
 *       d. Emits async batch telemetry event if apiKey is configured.
 *       e. Otherwise → calls `next()` transparently.
 *  5. Attaches `req.aiShield` metadata for downstream handlers.
 */

import {
  type RequestHandler,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { BotDetector } from './core/detector.js';
import { PoisonEngine } from './core/poison.js';
import { HoneypotManager } from './core/honeypot.js';
import { TelemetryEmitter, hashClientIp } from './core/telemetry.js';
import {
  BotCategory,
  Confidence,
  type AiShieldOptions,
  type AiShieldRequestMeta,
  type DetectionResult,
} from './types/index.js';

// ─── Module augmentation ───────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      aiShield?: AiShieldRequestMeta;
    }
  }
}

// ─── Constants ────────────────────────────────────────────────────────────

/** Default score threshold below which traffic is not poisoned. */
const DEFAULT_SCORE_THRESHOLD = 50;

// ─── Factory ──────────────────────────────────────────────────────────────

/**
 * Extended RequestHandler with attached telemetry subsystem.
 */
export interface AiShieldHandler extends RequestHandler {
  telemetry?: TelemetryEmitter | undefined;
}

/**
 * Create the ai-shield middleware stack.
 *
 * Returns a single Express `RequestHandler` that internally composes
 * the honeypot router, bot detector, poison engine, and optional telemetry emitter.
 *
 * @param options - Optional configuration; all fields have safe defaults.
 */
export function createAiShield(options: AiShieldOptions = {}): AiShieldHandler {
  const {
    customFingerprints  = [],
    excludePaths        = [],
    poisonContentType   = 'HTML',
    injectHoneypotLinks = true,
    honeypotPaths       = [],
    onBotDetected,
    scoreThreshold      = DEFAULT_SCORE_THRESHOLD,
    signalWeights       = {},
    honeypotTtlMs       = 24 * 60 * 60 * 1_000,
    debug               = false,
    apiKey,
    dashboardUrl,
  } = options;

  // ── Instantiate subsystems ─────────────────────────────────────────────
  const detector     = new BotDetector(customFingerprints, signalWeights);
  const poisonEngine = new PoisonEngine(poisonContentType);

  // Optional telemetry emitter (non-blocking in-memory batch buffer)
  const telemetry =
    apiKey !== undefined
      ? new TelemetryEmitter({ apiKey, dashboardUrl })
      : undefined;

  const honeypot = new HoneypotManager(poisonEngine, {
    customRoutes: honeypotPaths,
    ttlMs: honeypotTtlMs,
    debug,
    onTrap: (route, ip, ua) => {
      if (debug) {
        console.warn(
          `[ai-shield] Honeypot trap: "${route.label}" | IP: ${ip} | UA: ${ua.slice(0, 80)}`,
        );
      }

      // Emit telemetry event if configured
      if (telemetry !== undefined) {
        telemetry.emit({
          timestamp: new Date().toISOString(),
          path: route.path,
          reason: `HoneypotTrap:${route.label}`,
          clientIpHash: hashClientIp(ip),
          userAgent: ua,
        });
      }

      // Synthesise a DetectionResult so the user callback receives
      // a consistent shape regardless of trigger source.
      onBotDetected?.({
        category:    BotCategory.AI_CRAWLER,
        confidence:  Confidence.HIGH,
        label:       `HoneypotTrap:${route.label}`,
        matchedRule: `honeypot:${route.path}`,
        userAgent:   ua,
        signals:     ['HONEYPOT_TRIGGERED'],
        score:       100,
      });
    },
  });

  const honeypotRouter = honeypot.buildRouter();

  // Build exclusion set for O(1) lookups
  const excludeSet = new Set(excludePaths);

  // ── Middleware function ────────────────────────────────────────────────

  const shield: AiShieldHandler = (req: Request, res: Response, next: NextFunction): void => {
    // 1. Skip explicitly excluded paths
    if (excludeSet.has(req.path)) {
      next();
      return;
    }

    // 2. Run honeypot router first — if a trap matches it sends the
    //    poison response directly and never calls next().
    honeypotRouter(req, res, () => {
      // ── 3. Resolve client IP ─────────────────────────────────────────
      const clientIp = req.ip ?? req.socket.remoteAddress ?? '';

      // ── 4. Check honeypot IP cache ───────────────────────────────────
      const isHoneypotFlagged = honeypot.ipCache.isFlagged(clientIp);

      // ── 5. Run multi-signal detector ─────────────────────────────────
      const detection: DetectionResult = detector.detect(
        req.headers,
        isHoneypotFlagged,
      );

      // ── 6. Attach metadata (always, even for pass-through) ───────────
      const meta: AiShieldRequestMeta = { detection, poisoned: false };
      (req as Request & { aiShield: AiShieldRequestMeta }).aiShield = meta;

      // ── 7. GOOD_BOT — always pass through (SEO safety) ───────────────
      if (detection.category === BotCategory.GOOD_BOT) {
        if (debug) {
          console.info(
            `[ai-shield] Good bot allowed: ${detection.label} | ${req.method} ${req.path}`,
          );
        }
        next();
        return;
      }

      // ── 8. Score gate — below threshold → pass through ───────────────
      if (detection.score < scoreThreshold && !isHoneypotFlagged) {
        if (debug && detection.score > 0) {
          console.info(
            `[ai-shield] Below threshold (${detection.score} < ${scoreThreshold}): ${detection.label} | ${req.path}`,
          );
        }
        next();
        return;
      }

      // ── 9. Bot confirmed — serve poison ───────────────────────────────
      if (debug) {
        console.warn(
          `[ai-shield] Intercepted: ${detection.label} (${detection.category})` +
          ` score=${detection.score} | ${req.method} ${req.path}` +
          ` | signals: [${detection.signals.join(', ')}]`,
        );
      }

      // Emit non-blocking telemetry event if configured
      if (telemetry !== undefined) {
        telemetry.emit({
          timestamp: new Date().toISOString(),
          path: req.path,
          reason: detection.label,
          clientIpHash: hashClientIp(clientIp),
          userAgent: (req.headers['user-agent'] as string | undefined) ?? '',
        });
      }

      // Fire user callback (fire-and-forget; errors swallowed)
      if (onBotDetected !== undefined) {
        try { onBotDetected(detection); } catch { /* swallow */ }
      }

      // ── 10. Content-type negotiation ──────────────────────────────────
      const accept = (req.headers['accept'] as string | undefined) ?? '';
      let effectiveType = poisonContentType;
      if (req.path.endsWith('.xml') || accept.includes('application/xml')) {
        effectiveType = 'SITEMAP';
      } else if (accept.includes('application/json') && poisonContentType === 'HTML') {
        effectiveType = 'JSON';
      }

      const payload = poisonEngine.generate(req.path, effectiveType);

      // ── 11. Honeypot link injection ───────────────────────────────────
      let responseBody = payload.body;
      if (injectHoneypotLinks && effectiveType === 'HTML') {
        // Use FNV-like XOR fold of path chars as seed
        const seed = req.path
          .split('')
          .reduce((acc, c) => (acc ^ c.charCodeAt(0)) * 0x9e3779b9 >>> 0, 0x811c9dc5);
        responseBody = honeypot.injectLinks(responseBody, seed);
      }

      // ── 12. Mark as poisoned ──────────────────────────────────────────
      (req as Request & { aiShield: AiShieldRequestMeta }).aiShield = {
        detection,
        poisoned: true,
      };

      res
        .status(payload.statusCode)
        .setHeader('Content-Type', payload.contentType)
        .setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
        .setHeader('Pragma', 'no-cache')
        .setHeader('X-Robots-Tag', 'noindex, nofollow')
        .send(responseBody);
    });
  };

  shield.telemetry = telemetry;
  return shield;
}

export const aiShieldMiddleware = createAiShield;

// ─── Named re-exports ──────────────────────────────────────────────────────

export { BotDetector } from './core/detector.js';
export { PoisonEngine, syntheticTokenPublic } from './core/poison.js';
export { HoneypotManager, IpTrapCache, CANONICAL_TRAP } from './core/honeypot.js';
export { TelemetryEmitter, hashClientIp } from './core/telemetry.js';
export type {
  AiShieldOptions,
  AiShieldRequestMeta,
  BotFingerprint,
  DetectionResult,
  DetectionSignal,
  PoisonPayload,
  HoneypotRoute,
  TrapCacheEntry,
  SignalWeights,
  TelemetryEvent,
} from './types/index.js';
export {
  BotCategory,
  Confidence,
  DEFAULT_SIGNAL_WEIGHTS,
} from './types/index.js';

export default createAiShield;
