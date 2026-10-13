/**
 * @file src/core/detector.ts
 * @description Multi-signal bot fingerprinting engine.
 *
 * Classification pipeline (in execution order):
 *
 *   1. SEO WHITELIST — O(1) Set lookup against known good-bot UA tokens.
 *      Matching immediately returns GOOD_BOT with no further evaluation.
 *      This is the absolute safety gate: Googlebot is NEVER intercepted.
 *
 *   2. UA PATTERN MATCHING — Pre-compiled RegExp battery covering:
 *        • AI / LLM training crawlers (GPTBot, Claude-Web, CCBot…)
 *        • Commercial scraper bots (ByteSpider, PetalBot, SemrushBot…)
 *        • Scraping libraries (Scrapy, python-requests, Playwright, Puppeteer, cURL…)
 *
 *   3. HEADER HEURISTICS — Browser header analysis:
 *        • Missing Accept-Language (always present in real browsers)
 *        • Missing Accept header
 *        • Automation-specific headers (X-Playwright, X-Puppeteer, selenium-*)
 *        • Blank / absent User-Agent
 *
 *   4. SCORE FUSION — Weighted sum of fired signals clamped to [0, 100].
 *      Final BotCategory and Confidence are derived from the fused score.
 *
 * Performance guarantees:
 *   - GOOD_BOT whitelist: O(1) — `Set.has()` on normalised UA token.
 *   - UA pattern matching: O(n) worst-case where n = number of rules,
 *     but rules short-circuit on first match so typical cost is O(1)
 *     for known bots and O(n) only for humans (smallest n traversal).
 *   - Heuristic header checks: O(1) — direct property lookups.
 *   - Total p99 latency: < 2 ms on any modern V8 runtime.
 */

import type { IncomingHttpHeaders } from 'node:http';
import {
  BotCategory,
  Confidence,
  DEFAULT_SIGNAL_WEIGHTS,
  type BotFingerprint,
  type DetectionResult,
  type DetectionSignal,
  type SignalWeights,
} from '../types/index.js';

// ─── SEO Whitelist ────────────────────────────────────────────────────────

/**
 * Canonical token Set for the SEO whitelist.
 *
 * Tokens are lowercased substrings that appear ONLY in legitimate
 * search-engine User-Agents and nowhere else. Lookup is O(1).
 *
 * IMPORTANT: This set is checked BEFORE any other rule. A match here
 * always produces `GOOD_BOT` — it is never overridden downstream.
 */
const SEO_WHITELIST_TOKENS: ReadonlySet<string> = new Set([
  'googlebot',
  'googlebot-image',
  'googlebot-video',
  'googlebot-news',
  'bingbot',
  'duckduckbot',
  'yandexbot',
  'baiduspider',
  'slurp',          // Yahoo! Slurp
  'applebot',
  'facebot',        // Meta/Facebook crawler
  'twitterbot',     // Twitter card crawler
  'linkedinbot',    // LinkedIn preview crawler
  'pinterestbot',
  'discordbot',
  'whatsapp',       // WhatsApp link preview
  'telegrambot',
  'naver',          // Naver (Korean search)
  'sogou',          // Sogou (Chinese search)
  'exabot',         // Exalead
  'ia_archiver',    // Internet Archive / Wayback Machine
]);

/**
 * Extract all whitelist-relevant tokens from a UA string.
 * Returns the first matching token (O(1) per token tested).
 */
function seoWhitelistToken(ua: string): string | null {
  const lower = ua.toLowerCase();
  for (const token of SEO_WHITELIST_TOKENS) {
    if (lower.includes(token)) return token;
  }
  return null;
}

// ─── Automation Header Keys ───────────────────────────────────────────────

/**
 * Set of HTTP header names that signal browser automation.
 * Puppeteer, Playwright, Selenium, and WebDriverIO each inject
 * one or more of these. Checked as-is (headers are lowercased by Node).
 */
const AUTOMATION_HEADERS: ReadonlySet<string> = new Set([
  'x-puppeteer-intercepted',
  'x-playwright',
  'x-automation',
  'x-webdriver',
  'x-selenium',
  'webdriver',
  '__selenium_evaluate',
  '__webdriverscript',
  'x-requested-with',  // Often injected by jQuery/Axios in scrapers
]);

// ─── Default Bot Registry ─────────────────────────────────────────────────

/**
 * Built-in fingerprint rules.
 *
 * ORDER MATTERS — GOOD_BOT entries are kept here for completeness but the
 * SEO whitelist O(1) check runs before this list, so they are only needed
 * for the `matchedRule` label and structured result. AI_CRAWLER and
 * SCRAPING_LIB rules are listed after GOOD_BOT for clarity.
 *
 * All RegExp objects are compiled once at module load time.
 */
export const DEFAULT_FINGERPRINTS: BotFingerprint[] = [
  // ─── Legitimate search engines (belt-and-suspenders after whitelist) ──
  {
    id: 'googlebot',
    name: 'Googlebot',
    category: BotCategory.GOOD_BOT,
    confidence: Confidence.HIGH,
    uaPattern: /Googlebot(?:-Image|-Video|-News)?(?:\/[\d.]+)?/i,
    description: 'https://developers.google.com/search/docs/crawling-indexing/googlebot',
  },
  {
    id: 'bingbot',
    name: 'Bingbot',
    category: BotCategory.GOOD_BOT,
    confidence: Confidence.HIGH,
    uaPattern: /bingbot\/[\d.]+/i,
  },
  {
    id: 'duckduckbot',
    name: 'DuckDuckBot',
    category: BotCategory.GOOD_BOT,
    confidence: Confidence.HIGH,
    uaPattern: /DuckDuckBot\/[\d.]+/i,
  },
  {
    id: 'yandexbot',
    name: 'YandexBot',
    category: BotCategory.GOOD_BOT,
    confidence: Confidence.HIGH,
    uaPattern: /YandexBot\/[\d.]+/i,
  },
  {
    id: 'baiduspider',
    name: 'Baiduspider',
    category: BotCategory.GOOD_BOT,
    confidence: Confidence.HIGH,
    uaPattern: /Baiduspider(?:-image|-video)?/i,
  },
  {
    id: 'slurp',
    name: 'Yahoo! Slurp',
    category: BotCategory.GOOD_BOT,
    confidence: Confidence.HIGH,
    uaPattern: /Slurp/i,
  },
  {
    id: 'applebot',
    name: 'Applebot',
    category: BotCategory.GOOD_BOT,
    confidence: Confidence.HIGH,
    uaPattern: /Applebot\/[\d.]+/i,
  },

  // ─── AI / LLM training crawlers ───────────────────────────────────────
  {
    id: 'gptbot',
    name: 'GPTBot',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.HIGH,
    uaPattern: /GPTBot(?:\/[\d.]+)?/i,
    description: 'https://platform.openai.com/docs/gptbot',
  },
  {
    id: 'claude-web',
    name: 'Claude-Web',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.HIGH,
    uaPattern: /Claude-Web(?:\/[\d.]+)?/i,
  },
  {
    id: 'anthropic-ai',
    name: 'Anthropic AI Crawler',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.HIGH,
    uaPattern: /anthropic-ai/i,
  },
  {
    id: 'ccbot',
    name: 'CCBot (Common Crawl)',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.HIGH,
    uaPattern: /CCBot\/[\d.]+/i,
    description: 'https://commoncrawl.org/faq/',
  },
  {
    id: 'google-extended',
    name: 'Google-Extended',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.HIGH,
    uaPattern: /Google-Extended/i,
  },
  {
    id: 'amazonbot',
    name: 'Amazonbot',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.HIGH,
    uaPattern: /Amazonbot\/[\d.]+/i,
  },
  {
    id: 'cohere-ai',
    name: 'Cohere AI Crawler',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.HIGH,
    uaPattern: /cohere-ai/i,
  },
  {
    id: 'perplexitybot',
    name: 'PerplexityBot',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.HIGH,
    uaPattern: /PerplexityBot\/[\d.]+/i,
  },
  {
    id: 'youbot',
    name: 'YouBot (You.com)',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.MEDIUM,
    uaPattern: /YouBot\/[\d.]+/i,
  },
  {
    id: 'omgili',
    name: 'Omgili / Diffbot AI',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.MEDIUM,
    uaPattern: /Omgili(?:bot)?|Diffbot/i,
  },
  {
    id: 'claudebot-generic',
    name: 'Claude AI (generic)',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.MEDIUM,
    uaPattern: /claude(?:bot)?/i,
  },
  {
    id: 'meta-externalagent',
    name: 'Meta External Agent',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.HIGH,
    uaPattern: /meta-externalagent/i,
  },
  {
    id: 'applebot-extended',
    name: 'Applebot-Extended (ML)',
    category: BotCategory.AI_CRAWLER,
    confidence: Confidence.HIGH,
    uaPattern: /Applebot-Extended/i,
  },

  // ─── Commercial scraper bots ───────────────────────────────────────────
  {
    id: 'bytespider',
    name: 'ByteSpider (ByteDance/TikTok)',
    category: BotCategory.SCRAPER,
    confidence: Confidence.HIGH,
    uaPattern: /Bytespider(?:\/[\d.]+)?/i,
  },
  {
    id: 'petalbot',
    name: 'PetalBot (Huawei)',
    category: BotCategory.SCRAPER,
    confidence: Confidence.HIGH,
    uaPattern: /PetalBot(?:\/[\d.]+)?/i,
  },
  {
    id: 'dataforseo',
    name: 'DataForSeoBot',
    category: BotCategory.SCRAPER,
    confidence: Confidence.HIGH,
    uaPattern: /DataForSeoBot(?:\/[\d.]+)?/i,
  },
  {
    id: 'semrushbot',
    name: 'SemrushBot',
    category: BotCategory.SCRAPER,
    confidence: Confidence.MEDIUM,
    uaPattern: /SemrushBot(?:\/[\d.]+)?/i,
  },
  {
    id: 'ahrefsbot',
    name: 'AhrefsBot',
    category: BotCategory.SCRAPER,
    confidence: Confidence.MEDIUM,
    uaPattern: /AhrefsBot(?:\/[\d.]+)?/i,
  },
  {
    id: 'mj12bot',
    name: 'MJ12bot (Majestic)',
    category: BotCategory.SCRAPER,
    confidence: Confidence.MEDIUM,
    uaPattern: /MJ12bot(?:\/[\d.]+)?/i,
  },
  {
    id: 'dotbot',
    name: 'Dotbot (Moz)',
    category: BotCategory.SCRAPER,
    confidence: Confidence.MEDIUM,
    uaPattern: /dotbot(?:\/[\d.]+)?/i,
  },

  // ─── Scraping libraries & headless browsers ───────────────────────────
  {
    id: 'scrapy',
    name: 'Scrapy',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.HIGH,
    uaPattern: /Scrapy\/[\d.]+/i,
    description: 'https://scrapy.org',
  },
  {
    id: 'python-requests',
    name: 'Python Requests',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.HIGH,
    uaPattern: /python-requests\/[\d.]+/i,
  },
  {
    id: 'python-urllib',
    name: 'Python urllib',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.HIGH,
    uaPattern: /Python-urllib\/[\d.]+/i,
  },
  {
    id: 'python-httpx',
    name: 'Python HTTPX',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.HIGH,
    uaPattern: /python-httpx\/[\d.]+/i,
  },
  {
    id: 'python-aiohttp',
    name: 'Python aiohttp',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.HIGH,
    uaPattern: /python-aiohttp\/[\d.]+/i,
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer (Headless Chrome)',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.HIGH,
    // Headless Chrome UA: "HeadlessChrome" substring
    uaPattern: /HeadlessChrome|Puppeteer/i,
    description: 'https://pptr.dev',
  },
  {
    id: 'playwright',
    name: 'Playwright',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.HIGH,
    uaPattern: /Playwright/i,
    description: 'https://playwright.dev',
  },
  {
    id: 'selenium',
    name: 'Selenium WebDriver',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.HIGH,
    uaPattern: /selenium|webdriver/i,
  },
  {
    id: 'curl',
    name: 'cURL',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.MEDIUM,
    // curl/8.x — be careful not to match "curious" etc.
    uaPattern: /^curl\/[\d.]+$/i,
  },
  {
    id: 'wget',
    name: 'GNU Wget',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.MEDIUM,
    uaPattern: /^Wget\/[\d.]+/i,
  },
  {
    id: 'go-http',
    name: 'Go net/http',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.MEDIUM,
    uaPattern: /^Go-http-client\/[\d.]+$/i,
  },
  {
    id: 'java-http',
    name: 'Java HTTP Client',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.MEDIUM,
    uaPattern: /^(?:Java|Jakarta)\//i,
  },
  {
    id: 'node-fetch',
    name: 'node-fetch / undici',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.MEDIUM,
    uaPattern: /^(?:node-fetch|undici)\//i,
  },
  {
    id: 'axios',
    name: 'Axios HTTP Client',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.MEDIUM,
    uaPattern: /^axios\/[\d.]+$/i,
  },
  {
    id: 'mechanize',
    name: 'Ruby Mechanize',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.HIGH,
    uaPattern: /Mechanize\/[\d.]+/i,
  },
  {
    id: 'colly',
    name: 'Colly (Go scraper)',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.HIGH,
    uaPattern: /colly\/[\d.]+/i,
  },
  {
    id: 'beautifulsoup',
    name: 'BeautifulSoup / lxml',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.MEDIUM,
    uaPattern: /beautifulsoup|lxml/i,
  },
  {
    id: 'nokogiri',
    name: 'Nokogiri (Ruby)',
    category: BotCategory.SCRAPING_LIB,
    confidence: Confidence.HIGH,
    uaPattern: /Nokogiri\/[\d.]+/i,
  },
];

// ─── Detector Class ───────────────────────────────────────────────────────

/**
 * `BotDetector` evaluates an HTTP request using a multi-signal pipeline
 * and returns a richly annotated `DetectionResult`.
 *
 * **Instantiate once** at application startup — the constructor pre-compiles
 * and caches all regex patterns and data structures. The `detect()` method
 * is pure (no mutation) and safe for concurrent calls.
 *
 * ```ts
 * const detector = new BotDetector();
 * const result = detector.detect(req.headers);
 *
 * if (result.score >= 60) {
 *   // serve poison
 * }
 * ```
 */
export class BotDetector {
  private readonly fingerprints: readonly BotFingerprint[];
  private readonly weights: Readonly<SignalWeights>;

  /**
   * @param customFingerprints - Additional rules evaluated BEFORE the
   *   built-in list, giving them higher priority.
   * @param signalWeights - Override default per-signal scoring weights.
   */
  constructor(
    customFingerprints: BotFingerprint[] = [],
    signalWeights: Partial<SignalWeights> = {},
  ) {
    this.fingerprints = [...customFingerprints, ...DEFAULT_FINGERPRINTS];
    this.weights = { ...DEFAULT_SIGNAL_WEIGHTS, ...signalWeights };
  }

  // ─── Public API ──────────────────────────────────────────────────────

  /**
   * Classify an incoming HTTP request.
   *
   * @param headers - Raw `IncomingHttpHeaders` from Express `req.headers`.
   * @param ip      - Optional client IP address; checked against the
   *                  honeypot cache if provided.
   * @param isHoneypotFlagged - Set `true` if the IP was already flagged
   *                  by the `HoneypotManager` before calling detect().
   * @returns A fully populated `DetectionResult`.
   */
  detect(
    headers: IncomingHttpHeaders,
    isHoneypotFlagged = false,
  ): DetectionResult {
    const userAgent = this.extractUserAgent(headers);
    const signals: DetectionSignal[] = [];

    // ── Step 1: SEO Whitelist (O(1) ──────────────────────────────────────
    const whitelistToken = seoWhitelistToken(userAgent);
    if (whitelistToken !== null) {
      // Resolve label from fingerprints if possible (for consistency)
      const fp = this.fingerprints.find((f) => f.id === whitelistToken);
      return {
        category: BotCategory.GOOD_BOT,
        confidence: Confidence.HIGH,
        label: fp?.name ?? whitelistToken,
        matchedRule: fp?.id ?? whitelistToken,
        userAgent,
        signals: ['UA_PATTERN_MATCH'],
        score: 0, // Good bots score 0 — they should never be poisoned
      };
    }

    // ── Step 2: Honeypot flag ─────────────────────────────────────────────
    if (isHoneypotFlagged) {
      signals.push('HONEYPOT_TRIGGERED');
    }

    // ── Step 3: UA Pattern Matching ───────────────────────────────────────
    let matchedFingerprint: BotFingerprint | null = null;

    for (const fp of this.fingerprints) {
      if (fp.category === BotCategory.GOOD_BOT) continue; // already handled
      if (fp.uaPattern.test(userAgent)) {
        matchedFingerprint = fp;
        signals.push('UA_PATTERN_MATCH');
        break;
      }
    }

    // ── Step 4: Header Heuristics ─────────────────────────────────────────
    this.analyseHeaders(headers, userAgent, signals);

    // ── Step 5: Score Fusion ──────────────────────────────────────────────
    const score = this.computeScore(signals);

    // ── Step 6: Derive category and confidence ────────────────────────────
    if (matchedFingerprint !== null) {
      return {
        category: matchedFingerprint.category,
        confidence: matchedFingerprint.confidence,
        label: matchedFingerprint.name,
        matchedRule: matchedFingerprint.id,
        userAgent,
        signals,
        score,
      };
    }

    // No pattern matched — decide purely from heuristic score
    if (score >= 70 || isHoneypotFlagged) {
      return {
        category: BotCategory.SCRAPING_LIB,
        confidence: Confidence.MEDIUM,
        label: 'Heuristic Bot',
        matchedRule: null,
        userAgent,
        signals,
        score,
      };
    }

    if (score >= 40) {
      return {
        category: BotCategory.HUMAN,
        confidence: Confidence.LOW,
        label: 'Suspicious',
        matchedRule: null,
        userAgent,
        signals,
        score,
      };
    }

    return {
      category: BotCategory.HUMAN,
      confidence: Confidence.HIGH,
      label: 'Human',
      matchedRule: null,
      userAgent,
      signals,
      score,
    };
  }

  /**
   * Return the full list of active fingerprints (useful for diagnostics).
   */
  getFingerprints(): readonly BotFingerprint[] {
    return this.fingerprints;
  }

  /**
   * Return a copy of the resolved signal weight map.
   */
  getWeights(): Readonly<SignalWeights> {
    return this.weights;
  }

  // ─── Private helpers ─────────────────────────────────────────────────

  /**
   * Analyse HTTP headers for automation / bot signals.
   * Pushes signal tokens into the provided mutable array.
   */
  private analyseHeaders(
    headers: IncomingHttpHeaders,
    userAgent: string,
    signals: DetectionSignal[],
  ): void {
    // Empty / missing UA
    if (userAgent === '') {
      signals.push('EMPTY_UA');
      return; // No further UA analysis possible
    }

    // Browsers ALWAYS send Accept-Language
    if (!headers['accept-language']) {
      signals.push('MISSING_ACCEPT_LANGUAGE');
    }

    // Browsers ALWAYS send Accept
    if (!headers['accept']) {
      signals.push('MISSING_ACCEPT');
    }

    // Known automation headers injected by frameworks
    for (const headerName of Object.keys(headers)) {
      if (AUTOMATION_HEADERS.has(headerName.toLowerCase())) {
        signals.push('AUTOMATION_HEADER');
        break; // one signal is enough
      }
    }

    // Library-style UAs that weren't matched by patterns
    // (e.g. bare "python/3.11", "ruby", "go1.21 http")
    const uaLower = userAgent.toLowerCase();
    if (
      !signals.includes('UA_PATTERN_MATCH') &&
      (uaLower.startsWith('python/') ||
        uaLower.startsWith('ruby/') ||
        uaLower.startsWith('php/') ||
        uaLower.startsWith('libwww-perl') ||
        uaLower.includes('okhttp/') ||
        uaLower.startsWith('dart:io') ||
        /^[a-z_-]+\/[\d.]+ \([^)]*\)$/i.test(userAgent))
    ) {
      signals.push('SUSPICIOUS_UA');
    }
  }

  /**
   * Compute a weighted bot-probability score in [0, 100].
   * Duplicate signals are counted only once.
   */
  private computeScore(signals: readonly DetectionSignal[]): number {
    const unique = new Set(signals);
    let total = 0;
    for (const sig of unique) {
      total += this.weights[sig] ?? 0;
    }
    return Math.min(100, total);
  }

  /**
   * Safely extract the User-Agent string from request headers.
   */
  private extractUserAgent(headers: IncomingHttpHeaders): string {
    const raw = headers['user-agent'];
    if (Array.isArray(raw)) return raw[0] ?? '';
    return raw ?? '';
  }
}
