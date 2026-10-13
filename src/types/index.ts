/**
 * @file src/types/index.ts
 * @description Canonical type definitions for the ai-shield middleware system.
 *
 * All shared interfaces, enums, and type aliases live here so every module
 * can import from a single source of truth without circular dependencies.
 */

// ─── Bot Classification ────────────────────────────────────────────────────

/**
 * Broad category assigned to an incoming request after fingerprinting.
 *
 * - `AI_CRAWLER`    — Known LLM training / inference crawlers (GPTBot, Claude-Web…)
 * - `SCRAPER`       — General-purpose commercial scrapers (ByteSpider, PetalBot…)
 * - `SCRAPING_LIB`  — Headless browsers & HTTP scraping libraries (Puppeteer, Scrapy…)
 * - `GOOD_BOT`      — Verified search-engine crawlers that MUST NOT be blocked
 * - `HUMAN`         — Regular browser traffic or unrecognised agents
 */
export enum BotCategory {
  AI_CRAWLER   = 'AI_CRAWLER',
  SCRAPER      = 'SCRAPER',
  SCRAPING_LIB = 'SCRAPING_LIB',
  GOOD_BOT     = 'GOOD_BOT',
  HUMAN        = 'HUMAN',
}

/**
 * Confidence level of the bot classification decision.
 * Used to gate aggressive poisoning strategies.
 */
export enum Confidence {
  HIGH   = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW    = 'LOW',
}

// ─── Detection Signal ──────────────────────────────────────────────────────

/**
 * Individual evidence signals collected during fingerprinting.
 * Multiple signals are fused into a final `DetectionResult`.
 */
export type DetectionSignal =
  | 'UA_PATTERN_MATCH'       // User-Agent matched a known bot pattern
  | 'MISSING_ACCEPT_LANGUAGE'// No Accept-Language header (browsers always send one)
  | 'MISSING_ACCEPT'         // No Accept header at all
  | 'AUTOMATION_HEADER'      // X-Puppeteer / X-Playwright / selenium-* headers present
  | 'SUSPICIOUS_UA'          // UA looks like a library default (python-requests, curl…)
  | 'HONEYPOT_TRIGGERED'     // IP already flagged by honeypot cache
  | 'EMPTY_UA';              // Blank / missing User-Agent

// ─── Detection Result ──────────────────────────────────────────────────────

/** Rich result produced by the detector for every incoming request. */
export interface DetectionResult {
  /** Broad category of the visitor. */
  category: BotCategory;
  /** How confident we are in the classification. */
  confidence: Confidence;
  /** Human-readable label, e.g. "GPTBot", "Googlebot", "Unknown". */
  label: string;
  /**
   * The specific fingerprint rule that triggered the UA match,
   * or `null` for heuristic-only or unmatched traffic.
   */
  matchedRule: string | null;
  /** Raw User-Agent string extracted from the request headers. */
  userAgent: string;
  /** All evidence signals that contributed to this classification. */
  signals: DetectionSignal[];
  /**
   * Numeric score in [0, 100]. Higher = more certain bot.
   * Useful for threshold-based gating (e.g., only poison score ≥ 60).
   */
  score: number;
}

// ─── Bot Fingerprint Rules ────────────────────────────────────────────────

/**
 * A single fingerprint entry in the bot registry.
 * Rules are evaluated in declaration order; first match wins.
 */
export interface BotFingerprint {
  /** Unique, stable identifier for this rule (used in logs & metrics). */
  id: string;
  /** Human-readable display name. */
  name: string;
  /** Category this fingerprint maps to. */
  category: BotCategory;
  /** Confidence assigned when this rule fires. */
  confidence: Confidence;
  /** RegExp tested against the User-Agent header. */
  uaPattern: RegExp;
  /** Optional additional description / reference URL. */
  description?: string | undefined;
}

// ─── Header Heuristic Config ──────────────────────────────────────────────

/**
 * Weights applied to each detection signal when computing the bot score.
 * Override via `AiShieldOptions.signalWeights` to tune sensitivity.
 */
export interface SignalWeights {
  UA_PATTERN_MATCH: number;
  MISSING_ACCEPT_LANGUAGE: number;
  MISSING_ACCEPT: number;
  AUTOMATION_HEADER: number;
  SUSPICIOUS_UA: number;
  HONEYPOT_TRIGGERED: number;
  EMPTY_UA: number;
}

/** Default signal weights. Sum is deliberately > 100 to allow multi-signal certainty. */
export const DEFAULT_SIGNAL_WEIGHTS: Readonly<SignalWeights> = {
  UA_PATTERN_MATCH:        80,
  HONEYPOT_TRIGGERED:      90,
  AUTOMATION_HEADER:       75,
  SUSPICIOUS_UA:           50,
  MISSING_ACCEPT_LANGUAGE: 30,
  MISSING_ACCEPT:          20,
  EMPTY_UA:                40,
};

// ─── Poison Content ───────────────────────────────────────────────────────

/**
 * The type of synthetic content that the poison engine will emit.
 *
 * - `HTML`   — Full HTML page with plausible but misleading prose.
 * - `JSON`   — Structured JSON payload that looks like an API response.
 * - `TEXT`   — Plain-text document.
 * - `SITEMAP`— Fake XML sitemap full of dead-end URLs.
 */
export type PoisonContentType = 'HTML' | 'JSON' | 'TEXT' | 'SITEMAP';

/** A single poisoned response payload ready to be sent to the client. */
export interface PoisonPayload {
  /** HTTP Content-Type header value. */
  contentType: string;
  /** Response body string. */
  body: string;
  /** HTTP status code — always 200 to avoid triggering bot retry logic. */
  statusCode: 200;
}

// ─── Honeypot ────────────────────────────────────────────────────────────

/** Configuration for a single honeypot trap route. */
export interface HoneypotRoute {
  /** Express-compatible path string, e.g. `/wp-login.php`. */
  path: string;
  /** Label written to logs when this trap is triggered. */
  label: string;
}

/**
 * Entry stored in the in-memory honeypot IP cache.
 */
export interface TrapCacheEntry {
  /** Unix timestamp (ms) when this IP first triggered a trap. */
  firstSeenAt: number;
  /** Unix timestamp (ms) after which this entry expires. `null` = permanent. */
  expiresAt: number | null;
  /** How many times this IP has hit trap routes since first detection. */
  hitCount: number;
  /** Label of the FIRST trap path that was triggered. */
  triggeringTrap: string;
}

// ─── Middleware Config ─────────────────────────────────────────────────────

/**
 * Top-level options accepted by `createAiShield()`.
 *
 * All fields are optional; sensible production defaults are applied
 * when a field is omitted.
 */
export interface AiShieldOptions {
  /**
   * Additional User-Agent fingerprints to append to the built-in registry.
   * Useful for blocking proprietary scrapers not yet in the default list.
   */
  customFingerprints?: BotFingerprint[] | undefined;

  /**
   * Paths that should NEVER be intercepted, even if the requester
   * is classified as an AI crawler (e.g. your own health-check endpoint).
   * Supports exact strings only; no glob patterns.
   */
  excludePaths?: string[] | undefined;

  /**
   * Override the default poison-content strategy for AI crawlers.
   * Defaults to `'HTML'`.
   */
  poisonContentType?: PoisonContentType | undefined;

  /**
   * When `true`, inject hidden `<a>` honeypot links into every HTML
   * response served to AI bots, leading them deeper into the maze.
   * Defaults to `true`.
   */
  injectHoneypotLinks?: boolean | undefined;

  /**
   * Custom list of honeypot trap paths to register on the Express router.
   * Merged with (not replacing) the built-in trap set.
   */
  honeypotPaths?: HoneypotRoute[] | undefined;

  /**
   * Callback invoked whenever a bot is detected — handy for metrics /
   * logging pipelines. Called asynchronously; errors are swallowed.
   */
  onBotDetected?: ((result: DetectionResult) => void) | undefined;

  /**
   * Minimum bot score [0–100] required before poison is served.
   * Traffic below this threshold passes through even if some signals fire.
   * Defaults to `50` (any heuristic combination that exceeds MEDIUM).
   */
  scoreThreshold?: number | undefined;

  /**
   * Override per-signal scoring weights. Merged with `DEFAULT_SIGNAL_WEIGHTS`.
   */
  signalWeights?: Partial<SignalWeights> | undefined;

  /**
   * TTL in milliseconds for honeypot IP cache entries.
   * After expiry the IP is no longer considered flagged unless it hits
   * another trap. Set to `null` for permanent flagging.
   * Defaults to `24 * 60 * 60 * 1000` (24 hours).
   */
  honeypotTtlMs?: number | null | undefined;

  /**
   * Enable verbose debug logging to stdout.
   * Should be `false` in production.
   * Defaults to `false`.
   */
  debug?: boolean | undefined;

  /**
   * Optional API key to authenticate with the ai-shield telemetry service.
   * When provided, activates asynchronous non-blocking event emissions.
   */
  apiKey?: string | undefined;

  /**
   * Target endpoint URL for telemetry event reporting.
   * Defaults to 'https://telemetry.ai-shield.dev/v1/events'.
   */
  dashboardUrl?: string | undefined;
}

// ─── Telemetry ────────────────────────────────────────────────────────────

/** Telemetry event record emitted when bots/scrapers are trapped or poisoned. */
export interface TelemetryEvent {
  /** Timestamp formatted as ISO-8601 string. */
  timestamp: string;
  /** Request path that triggered the defense. */
  path: string;
  /** Label/reason for the interception. */
  reason: string;
  /** Privacy-preserving SHA-256 hash of the client IP address. */
  clientIpHash: string;
  /** Client User-Agent string. */
  userAgent: string;
}

// ─── Request Augmentation ─────────────────────────────────────────────────

/**
 * Properties added to `express.Request` by the middleware so downstream
 * handlers have access to the detection result without re-computing it.
 */
export interface AiShieldRequestMeta {
  detection: DetectionResult;
  poisoned: boolean;
}

/** Configuration options alias for the aiShield middleware. */
export type ShieldOptions = AiShieldOptions;

