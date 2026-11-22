import crypto from 'node:crypto';

export type PlanType = 'FREE' | 'PRO' | 'BUSINESS';

export interface PlanConfig {
  name: PlanType;
  maxMonthlyRequests: number;
  allowedBots: string[];
  dynamicPoisoning: boolean;
  advancedBots: boolean;
  prioritySupport: boolean;
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  FREE: {
    name: 'FREE',
    maxMonthlyRequests: 5_000,
    allowedBots: ['gptbot'], // basic GPTBot detection only
    dynamicPoisoning: false,
    advancedBots: false,
    prioritySupport: false,
  },
  PRO: {
    name: 'PRO',
    maxMonthlyRequests: 500_000,
    allowedBots: [
      'gptbot',
      'claudebot',
      'claude-web',
      'anthropic-ai',
      'perplexity',
      'perplexitybot',
      'bytedance',
      'bytespider',
      'meta',
      'meta-externalagent',
      'ccbot',
      'cohere-ai',
      'amazonbot',
    ],
    dynamicPoisoning: true,
    advancedBots: true,
    prioritySupport: true,
  },
  BUSINESS: {
    name: 'BUSINESS',
    maxMonthlyRequests: 5_000_000,
    allowedBots: ['*'], // all bots covered
    dynamicPoisoning: true,
    advancedBots: true,
    prioritySupport: true,
  },
};

/**
 * Generate a cryptographically secure live API key prefixed with 'as_live_'.
 * Format: as_live_<32 hex characters>
 */
export function generateLiveApiKey(): string {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `as_live_${randomBytes}`;
}

/**
 * Validate key format: must start with 'as_live_' and be at least 20 chars long.
 */
export function isValidApiKeyFormat(key: unknown): key is string {
  return typeof key === 'string' && key.startsWith('as_live_') && key.length >= 20;
}
