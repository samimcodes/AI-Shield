/**
 * @file src/core/saas.ts
 * @description Multi-tenant Open-Core SaaS client with in-memory caching and sub-2ms latency.
 *
 * Implements:
 *   1. Sub-2ms fast-path cached validation (TTL 60s).
 *   2. Plan capability matrices (FREE vs PRO vs BUSINESS).
 *   3. Graceful fallback on network timeout/offline to ensure zero downtime.
 *   4. Asynchronous, non-blocking bot event logging and quota tracking.
 */

import type {
  ApiKeyValidationResult,
  BotEventPayload,
  SaasPlan,
  SaasTierFeatures,
} from '../types/index.js';

// ─── Tier Definitions ──────────────────────────────────────────────────────

export const SAAS_TIER_LIMITS: Record<SaasPlan, SaasTierFeatures> = {
  FREE: {
    plan: 'FREE',
    maxMonthlyRequests: 5_000,
    allowedBots: ['gptbot'],
    dynamicPoisoning: false,
    honeypotTraps: false,
    advancedBots: false,
  },
  PRO: {
    plan: 'PRO',
    maxMonthlyRequests: 500_000,
    allowedBots: [
      'gptbot',
      'claude-web',
      'anthropic-ai',
      'claudebot-generic',
      'ccbot',
      'perplexitybot',
      'bytespider',
      'meta-externalagent',
      'amazonbot',
      'cohere-ai',
      'youbot',
      'omgili',
    ],
    dynamicPoisoning: true,
    honeypotTraps: true,
    advancedBots: true,
  },
  BUSINESS: {
    plan: 'BUSINESS',
    maxMonthlyRequests: 5_000_000,
    allowedBots: ['*'],
    dynamicPoisoning: true,
    honeypotTraps: true,
    advancedBots: true,
  },
};

export interface SaasClientOptions {
  apiKey?: string | undefined;
  validationUrl?: string | undefined;
  cacheTtlMs?: number | undefined;
  fallbackPlan?: SaasPlan | undefined;
  timeoutMs?: number | undefined;
  debug?: boolean | undefined;
}

interface CacheEntry {
  result: ApiKeyValidationResult;
  expiresAt: number;
  cachedAt: number;
}

/**
 * High-performance client that validates API keys and caches tier quotas in-memory.
 */
export class SaasClient {
  private readonly apiKey: string | undefined;
  private readonly validationUrl: string;
  private readonly cacheTtlMs: number;
  private readonly fallbackPlan: SaasPlan;
  private readonly timeoutMs: number;
  private readonly debug: boolean;

  private readonly cache = new Map<string, CacheEntry>();

  constructor(options: SaasClientOptions = {}) {
    this.apiKey = options.apiKey;
    this.validationUrl = options.validationUrl ?? 'https://ai-shield.dev/api/v1/validate';
    this.cacheTtlMs = options.cacheTtlMs ?? 60_000; // 60 seconds TTL
    this.fallbackPlan = options.fallbackPlan ?? 'FREE';
    this.timeoutMs = options.timeoutMs ?? 1_500;
    this.debug = options.debug ?? false;
  }

  /**
   * Return a default Free tier validation result (when no API key is configured).
   */
  public getDefaultFreeResult(): ApiKeyValidationResult {
    const freeTier = SAAS_TIER_LIMITS.FREE;
    return {
      valid: true,
      plan: 'FREE',
      allowedBots: freeTier.allowedBots,
      dynamicPoisoning: freeTier.dynamicPoisoning,
      limitExceeded: false,
      requestsThisMonth: 0,
      monthlyLimit: freeTier.maxMonthlyRequests,
      remainingRequests: freeTier.maxMonthlyRequests,
      fallback: true,
    };
  }

  /**
   * Synchronous cache lookup for sub-millisecond hot-path execution.
   */
  public getCachedValidation(key?: string): ApiKeyValidationResult | null {
    const targetKey = key ?? this.apiKey;
    if (!targetKey) {
      return this.getDefaultFreeResult();
    }

    const entry = this.cache.get(targetKey);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(targetKey);
      return null;
    }

    return { ...entry.result, cached: true };
  }

  /**
   * Validate API key against remote SaaS control plane or local in-memory cache.
   * Latency is < 2ms on cache hits.
   */
  public async validate(keyOverride?: string): Promise<ApiKeyValidationResult> {
    const targetKey = keyOverride ?? this.apiKey;

    // No key provided -> default Open-Core free tier
    if (!targetKey) {
      return this.getDefaultFreeResult();
    }

    // Check in-memory cache first (hot path: < 0.1ms)
    const cached = this.getCachedValidation(targetKey);
    if (cached) {
      return cached;
    }

    // Fetch from SaaS control plane
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(this.validationUrl, {
        method: 'GET',
        headers: {
          'x-api-key': targetKey,
          'Accept': 'application/json',
          'User-Agent': 'ai-shield-client/0.3.5',
        },
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      if (res.ok) {
        const data = (await res.json()) as Partial<ApiKeyValidationResult>;
        const plan: SaasPlan = (data.plan as SaasPlan) ?? 'FREE';
        const tierConfig = SAAS_TIER_LIMITS[plan] ?? SAAS_TIER_LIMITS.FREE;

        const result: ApiKeyValidationResult = {
          valid: data.valid ?? true,
          plan,
          allowedBots: data.allowedBots ?? tierConfig.allowedBots,
          dynamicPoisoning: data.dynamicPoisoning ?? tierConfig.dynamicPoisoning,
          limitExceeded: data.limitExceeded ?? false,
          requestsThisMonth: data.requestsThisMonth ?? 0,
          monthlyLimit: data.monthlyLimit ?? tierConfig.maxMonthlyRequests,
          remainingRequests: data.remainingRequests ?? Math.max(0, tierConfig.maxMonthlyRequests - (data.requestsThisMonth ?? 0)),
        };

        // Cache successful response
        this.cache.set(targetKey, {
          result,
          expiresAt: Date.now() + this.cacheTtlMs,
          cachedAt: Date.now(),
        });

        return result;
      }

      // Invalid key or forbidden
      if (res.status === 401 || res.status === 403) {
        const errorResult: ApiKeyValidationResult = {
          valid: false,
          plan: 'FREE',
          allowedBots: SAAS_TIER_LIMITS.FREE.allowedBots,
          dynamicPoisoning: false,
          limitExceeded: false,
          requestsThisMonth: 0,
          monthlyLimit: 0,
          remainingRequests: 0,
          error: 'Invalid or inactive API key',
          fallback: true,
        };

        // Cache negative response for 30 seconds to prevent hammering
        this.cache.set(targetKey, {
          result: errorResult,
          expiresAt: Date.now() + 30_000,
          cachedAt: Date.now(),
        });

        return errorResult;
      }
    } catch (err) {
      if (this.debug) {
        console.warn('[ai-shield:saas] Validation endpoint unreachable, applying graceful fallback:', err);
      }
    }

    // Graceful offline fallback: never break the customer's application
    const fallbackTier = SAAS_TIER_LIMITS[this.fallbackPlan] ?? SAAS_TIER_LIMITS.FREE;
    const fallbackResult: ApiKeyValidationResult = {
      valid: true,
      plan: this.fallbackPlan,
      allowedBots: fallbackTier.allowedBots,
      dynamicPoisoning: fallbackTier.dynamicPoisoning,
      limitExceeded: false,
      requestsThisMonth: 0,
      monthlyLimit: fallbackTier.maxMonthlyRequests,
      remainingRequests: fallbackTier.maxMonthlyRequests,
      fallback: true,
    };

    // Cache fallback briefly (10 seconds)
    this.cache.set(targetKey, {
      result: fallbackResult,
      expiresAt: Date.now() + 10_000,
      cachedAt: Date.now(),
    });

    return fallbackResult;
  }

  /**
   * Log bot event and increment request counter asynchronously (zero request latency).
   */
  public reportBotEvent(payload: BotEventPayload): void {
    const key = payload.apiKey ?? this.apiKey;
    if (!key) return;

    // Fire and forget - never await or block response thread
    fetch(this.validationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
      },
      body: JSON.stringify({
        botName: payload.botName,
        path: payload.path,
        actionTaken: payload.actionTaken,
        bandwidthSavedBytes: payload.bandwidthSavedBytes ? Number(payload.bandwidthSavedBytes) : 0,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      }),
    }).catch((err) => {
      if (this.debug) {
        console.warn('[ai-shield:saas] Failed to emit async bot log:', err);
      }
    });
  }

  /**
   * Check if a specific detected bot rule is covered by the active plan.
   *
   * FREE tier: GPTBot only.
   * PRO / BUSINESS tier: All AI bots (GPTBot, ClaudeBot, Perplexity, ByteDance, Meta, etc.).
   */
  public isBotCoveredByPlan(
    ruleId: string | null,
    plan: SaasPlan,
    allowedBots: string[],
    score: number = 0,
  ): boolean {
    if (!ruleId) {
      // Heuristic bot detection with high score
      return plan === 'PRO' || plan === 'BUSINESS' || score >= 90;
    }

    const lowerRule = ruleId.toLowerCase();

    // Wildcard matches all
    if (allowedBots.includes('*')) {
      return true;
    }

    // Direct match in allowedBots list
    if (allowedBots.some((bot) => lowerRule.includes(bot.toLowerCase()))) {
      return true;
    }

    // Specific plan logic
    if (plan === 'FREE') {
      // Free plan ONLY intercepts GPTBot
      return lowerRule.includes('gptbot');
    }

    // PRO & BUSINESS intercept all AI scrapers
    return true;
  }

  /**
   * Manually invalidate or populate cache (useful for testing or cache warming).
   */
  public setCachedResult(key: string, result: ApiKeyValidationResult, ttlMs?: number): void {
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + (ttlMs ?? this.cacheTtlMs),
      cachedAt: Date.now(),
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }
}
