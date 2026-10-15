/**
 * @file src/index.ts
 * @description Public API entry point for the ai-shield package.
 *
 * Provides:
 *   - `aiShield`: Main Express middleware (can be invoked as a factory or directly).
 *   - `createAiShield`: Explicit middleware factory function.
 *   - `createHoneypotHandler`: Standalone honeypot trap router factory.
 *   - Configuration types (ShieldOptions, AiShieldOptions, etc.) and core building blocks.
 */

import type { Request, Response, NextFunction, RequestHandler, Router } from 'express';
import { createAiShield } from './middleware.js';
import { HoneypotManager } from './core/honeypot.js';
import { PoisonEngine } from './core/poison.js';
import type {
  ShieldOptions,
  AiShieldOptions,
  HoneypotRoute,
  PoisonContentType,
} from './types/index.js';

// Cache single default instance for direct `app.use(aiShield)` usage
let defaultHandler: RequestHandler | null = null;

/**
 * Main Express middleware for ai-shield bot detection and data poisoning.
 *
 * Usage as a factory:
 * ```ts
 * app.use(aiShield({ debug: true, scoreThreshold: 50 }));
 * ```
 *
 * Usage directly as standard middleware:
 * ```ts
 * app.use(aiShield);
 * ```
 */
export function aiShield(options?: ShieldOptions): RequestHandler;
export function aiShield(req: Request, res: Response, next: NextFunction): void;
export function aiShield(
  optionsOrReq?: ShieldOptions | Request,
  res?: Response,
  next?: NextFunction,
): RequestHandler | void {
  // Direct middleware usage: aiShield(req, res, next)
  if (res !== undefined && typeof next === 'function') {
    if (!defaultHandler) {
      defaultHandler = createAiShield();
    }
    return defaultHandler(optionsOrReq as Request, res, next);
  }
  // Factory usage: aiShield(options)
  return createAiShield(optionsOrReq as ShieldOptions | undefined);
}

/** Options for configuring standalone honeypot router. */
export interface HoneypotHandlerOptions {
  customRoutes?: HoneypotRoute[] | undefined;
  poisonContentType?: PoisonContentType | undefined;
  ttlMs?: number | null | undefined;
  debug?: boolean | undefined;
  onTrap?: ((route: HoneypotRoute, ip: string, userAgent: string) => void) | undefined;
}

/**
 * Create a standalone Express Router with pre-mounted honeypot trap routes.
 *
 * Useful for mounting trap routes independently in custom Express architectures.
 */
export function createHoneypotHandler(options: HoneypotHandlerOptions = {}): Router {
  const poison = new PoisonEngine(options.poisonContentType ?? 'HTML');
  const manager = new HoneypotManager(poison, {
    customRoutes: options.customRoutes,
    ttlMs: options.ttlMs,
    debug: options.debug,
    onTrap: options.onTrap,
  });
  return manager.buildRouter();
}

// ─── Direct Re-exports ───────────────────────────────────────────────────────

export { createAiShield, aiShieldMiddleware } from './middleware.js';
export { BotDetector } from './core/detector.js';
export { PoisonEngine, syntheticTokenPublic } from './core/poison.js';
export { HoneypotManager, IpTrapCache, CANONICAL_TRAP } from './core/honeypot.js';
export { TelemetryEmitter, hashClientIp } from './core/telemetry.js';
export { DashboardManager } from './core/dashboard.js';

// ─── Types and Constants ───────────────────────────────────────────────────

export type {
  ShieldOptions,
  AiShieldOptions,
  AiShieldRequestMeta,
  BotFingerprint,
  DetectionResult,
  DetectionSignal,
  PoisonPayload,
  PoisonContentType,
  HoneypotRoute,
  TrapCacheEntry,
  SignalWeights,
  TelemetryEvent,
  DashboardAuthConfig,
  DashboardSecurityEvent,
  DashboardStats,
} from './types/index.js';

export {
  BotCategory,
  Confidence,
  DEFAULT_SIGNAL_WEIGHTS,
} from './types/index.js';

export default aiShield;
