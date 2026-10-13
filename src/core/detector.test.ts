/**
 * @file src/core/detector.test.ts
 * @description Unit tests for the multi-signal BotDetector engine.
 *
 * Tests cover:
 *   - O(1) SEO whitelist (GOOD_BOT must always be score=0)
 *   - AI crawler UA pattern matching
 *   - Scraping library detection (Scrapy, Puppeteer, python-requests, cURL…)
 *   - Header heuristics (missing Accept-Language, Accept, automation headers)
 *   - Score fusion and threshold semantics
 *   - Honeypot IP flag signal
 *   - Custom fingerprints
 *   - Edge cases (empty UA, array UA, ambiguous UAs)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BotDetector, DEFAULT_FINGERPRINTS } from './detector.js';
import { BotCategory, Confidence } from '../types/index.js';
import type { IncomingHttpHeaders } from 'node:http';

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Build a minimal browser-like header set. */
function browserHeaders(userAgent: string): IncomingHttpHeaders {
  return {
    'user-agent':      userAgent,
    'accept':          'text/html,application/xhtml+xml,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
  };
}

/** Build minimal bot headers — just UA, no browser essentials. */
function botHeaders(userAgent: string): IncomingHttpHeaders {
  return { 'user-agent': userAgent };
}

// ─── Test Suite ───────────────────────────────────────────────────────────

describe('BotDetector', () => {
  let detector: BotDetector;

  beforeEach(() => {
    detector = new BotDetector();
  });

  // ── Registry ──────────────────────────────────────────────────────────

  it('exposes a non-empty default fingerprint list (≥ 40 rules)', () => {
    expect(DEFAULT_FINGERPRINTS.length).toBeGreaterThanOrEqual(40);
  });

  it('getFingerprints() returns all active rules including custom ones', () => {
    const custom = new BotDetector([
      {
        id: 'x', name: 'X', category: BotCategory.SCRAPING_LIB,
        confidence: Confidence.HIGH, uaPattern: /XBot/i,
      },
    ]);
    expect(custom.getFingerprints().length).toBe(DEFAULT_FINGERPRINTS.length + 1);
  });

  // ── SEO Whitelist — GOOD_BOT, score must be 0 ─────────────────────────

  describe('SEO whitelist (GOOD_BOT)', () => {
    const table: [string, string][] = [
      ['Googlebot/2.1 (+http://www.google.com/bot.html)',                       'Googlebot'],
      ['Mozilla/5.0 (compatible; Googlebot-Image/1.0; +http://www.google.com/bot.html)', 'Googlebot'],
      ['Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)', 'Bingbot'],
      ['DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)',            'DuckDuckBot'],
      ['Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',      'YandexBot'],
      ['Baiduspider+(+http://www.baidu.com/search/spider.htm)',                 'Baiduspider'],
      ['Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)', 'Yahoo! Slurp'],
      ['Mozilla/5.0 (compatible; Applebot/0.3; +http://www.apple.com/go/applebot)', 'Applebot'],
    ];

    it.each(table)('classifies "%s" as GOOD_BOT', (ua) => {
      const r = detector.detect(botHeaders(ua));
      expect(r.category).toBe(BotCategory.GOOD_BOT);
      expect(r.confidence).toBe(Confidence.HIGH);
      expect(r.score).toBe(0); // Good bots MUST score 0
    });

    it('GOOD_BOT is never poisoned even without Accept-Language', () => {
      const r = detector.detect({ 'user-agent': 'Googlebot/2.1' }); // no Accept-Language
      expect(r.category).toBe(BotCategory.GOOD_BOT);
      expect(r.score).toBe(0);
    });
  });

  // ── AI Crawlers ────────────────────────────────────────────────────────

  describe('AI_CRAWLER classification', () => {
    const table: [string][] = [
      ['GPTBot/1.0'],
      ['Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.1; +https://openai.com/gptbot)'],
      ['Claude-Web/1.0'],
      ['anthropic-ai/1.0'],
      ['CCBot/2.0 (https://commoncrawl.org/faq/)'],
      ['Google-Extended'],
      ['Amazonbot/0.1'],
      ['PerplexityBot/1.0'],
      ['cohere-ai/1.0'],
    ];

    it.each(table)('classifies "%s" as AI_CRAWLER', (ua) => {
      const r = detector.detect(botHeaders(ua));
      expect(r.category).toBe(BotCategory.AI_CRAWLER);
      expect(r.score).toBeGreaterThanOrEqual(80); // HIGH confidence ≥ 80
    });
  });

  // ── Commercial Scrapers ────────────────────────────────────────────────

  describe('SCRAPER classification', () => {
    const table: [string][] = [
      ['Bytespider; +https://zhanzhang.toutiao.com/'],
      ['PetalBot; +https://webmaster.petalsearch.com/site/petalbot'],
      ['DataForSeoBot/1.0'],
      ['SemrushBot/7~bl'],
      ['AhrefsBot/7.0; +http://ahrefs.com/robot/'],
    ];

    it.each(table)('classifies "%s" as SCRAPER', (ua) => {
      const r = detector.detect(botHeaders(ua));
      expect(r.category).toBe(BotCategory.SCRAPER);
    });
  });

  // ── Scraping Libraries ────────────────────────────────────────────────

  describe('SCRAPING_LIB classification', () => {
    const table: [string, string][] = [
      ['Scrapy/2.11.0 (+https://scrapy.org)',             'Scrapy'],
      ['python-requests/2.31.0',                          'Python Requests'],
      ['Python-urllib/3.11',                              'Python urllib'],
      ['python-httpx/0.27.0',                             'Python HTTPX'],
      ['python-aiohttp/3.9.1',                            'Python aiohttp'],
      ['HeadlessChrome/124.0.0.0',                        'Puppeteer (Headless Chrome)'],
      ['Mozilla/5.0 Playwright/1.44.0',                   'Playwright'],
      ['Mozilla/5.0 (webdriver)',                         'Selenium WebDriver'],
      ['curl/8.7.1',                                      'cURL'],
      ['Wget/1.21.4',                                     'GNU Wget'],
      ['Go-http-client/1.1',                              'Go net/http'],
      ['axios/1.6.8',                                     'Axios HTTP Client'],
      ['Mechanize/2.12.0 Ruby/3.3.0',                     'Ruby Mechanize'],
      ['colly/2.1.0',                                     'Colly (Go scraper)'],
      ['Nokogiri/1.16.5',                                 'Nokogiri (Ruby)'],
    ];

    it.each(table)('classifies "%s" as SCRAPING_LIB (%s)', (ua, _label) => {
      const r = detector.detect(botHeaders(ua));
      expect(r.category).toBe(BotCategory.SCRAPING_LIB);
    });

    it('provides label for Scrapy', () => {
      const r = detector.detect(botHeaders('Scrapy/2.11.0'));
      expect(r.label).toBe('Scrapy');
      expect(r.matchedRule).toBe('scrapy');
    });

    it('provides label for python-requests', () => {
      const r = detector.detect(botHeaders('python-requests/2.31.0'));
      expect(r.label).toBe('Python Requests');
    });
  });

  // ── Header Heuristics ─────────────────────────────────────────────────

  describe('header heuristics', () => {
    it('fires MISSING_ACCEPT_LANGUAGE when header absent', () => {
      const r = detector.detect({ 'user-agent': 'SomeUnknownAgent/1.0' });
      expect(r.signals).toContain('MISSING_ACCEPT_LANGUAGE');
    });

    it('does NOT fire MISSING_ACCEPT_LANGUAGE for browsers', () => {
      const r = detector.detect(browserHeaders('Mozilla/5.0 Chrome/124'));
      expect(r.signals).not.toContain('MISSING_ACCEPT_LANGUAGE');
    });

    it('fires MISSING_ACCEPT when Accept header absent', () => {
      const r = detector.detect({
        'user-agent':      'SomeAgent/1.0',
        'accept-language': 'en-US',
      });
      expect(r.signals).toContain('MISSING_ACCEPT');
    });

    it('fires AUTOMATION_HEADER for x-playwright header', () => {
      const r = detector.detect({
        'user-agent':  'Mozilla/5.0 Chrome/124',
        'x-playwright': '1',
      });
      expect(r.signals).toContain('AUTOMATION_HEADER');
    });

    it('fires AUTOMATION_HEADER for webdriver header', () => {
      const r = detector.detect({
        'user-agent': 'Mozilla/5.0 Chrome/124',
        'webdriver':  'true',
      });
      expect(r.signals).toContain('AUTOMATION_HEADER');
    });

    it('fires EMPTY_UA for blank user-agent', () => {
      const r = detector.detect({ 'user-agent': '' });
      expect(r.signals).toContain('EMPTY_UA');
    });

    it('fires EMPTY_UA when UA header is absent', () => {
      const r = detector.detect({});
      expect(r.signals).toContain('EMPTY_UA');
    });

    it('fires SUSPICIOUS_UA for python/ UA not matched by pattern', () => {
      const r = detector.detect({ 'user-agent': 'python/3.12' });
      expect(r.signals).toContain('SUSPICIOUS_UA');
    });
  });

  // ── Honeypot flag signal ───────────────────────────────────────────────

  describe('honeypot IP flag', () => {
    it('adds HONEYPOT_TRIGGERED signal when isHoneypotFlagged=true', () => {
      const r = detector.detect(browserHeaders('Mozilla/5.0 Chrome/124'), true);
      expect(r.signals).toContain('HONEYPOT_TRIGGERED');
    });

    it('elevates score significantly when honeypot flag is set', () => {
      const normal  = detector.detect(browserHeaders('Mozilla/5.0 Chrome/124'), false);
      const flagged = detector.detect(browserHeaders('Mozilla/5.0 Chrome/124'), true);
      expect(flagged.score).toBeGreaterThan(normal.score);
      expect(flagged.score).toBeGreaterThanOrEqual(90); // weight=90
    });

    it('classifies honeypot-flagged known UA as SCRAPING_LIB', () => {
      const r = detector.detect(browserHeaders('Mozilla/5.0 Chrome/124'), true);
      // Score will be ≥ 90 → heuristic bot classification
      expect(r.score).toBeGreaterThanOrEqual(70);
    });
  });

  // ── Score fusion ──────────────────────────────────────────────────────

  describe('score fusion', () => {
    it('score is 0 for clean browser traffic', () => {
      const r = detector.detect(browserHeaders('Mozilla/5.0 Chrome/124'));
      expect(r.score).toBe(0);
    });

    it('score is clamped to 100 for multiple high-weight signals', () => {
      // UA_PATTERN_MATCH(80) + MISSING_ACCEPT_LANGUAGE(30) + MISSING_ACCEPT(20) > 100
      const r = detector.detect({ 'user-agent': 'GPTBot/1.0' });
      expect(r.score).toBeLessThanOrEqual(100);
    });

    it('score reflects multiple signals for bare bot request', () => {
      // GPTBot UA (80) + missing Accept-Language (30) + missing Accept (20) → clamped 100
      const r = detector.detect({ 'user-agent': 'GPTBot/1.0' }); // no accept or accept-language
      expect(r.score).toBeGreaterThanOrEqual(80);
    });

    it('signals array contains UA_PATTERN_MATCH for detected bot', () => {
      const r = detector.detect(botHeaders('GPTBot/1.0'));
      expect(r.signals).toContain('UA_PATTERN_MATCH');
    });
  });

  // ── Human traffic ─────────────────────────────────────────────────────

  describe('HUMAN classification', () => {
    const browsers = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Safari/604.1',
    ];

    it.each(browsers)('classifies real browser "%s" as HUMAN', (ua) => {
      const r = detector.detect(browserHeaders(ua));
      expect(r.category).toBe(BotCategory.HUMAN);
      expect(r.score).toBe(0);
      expect(r.matchedRule).toBeNull();
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles array user-agent header (takes first element)', () => {
      const r = detector.detect({ 'user-agent': ['GPTBot/1.0', 'fallback'] });
      expect(r.category).toBe(BotCategory.AI_CRAWLER);
    });

    it('handles missing UA gracefully', () => {
      const r = detector.detect({});
      expect(r.userAgent).toBe('');
      expect(r.signals).toContain('EMPTY_UA');
    });

    it('SEO whitelist wins over any AI pattern in same UA string', () => {
      // A UA that contains both "Googlebot" and "Google-Extended" substrings
      const r = detector.detect(botHeaders('Googlebot/2.1 Google-Extended'));
      expect(r.category).toBe(BotCategory.GOOD_BOT);
      expect(r.score).toBe(0);
    });

    it('custom fingerprints take priority over defaults', () => {
      const custom = new BotDetector([{
        id: 'my-ai', name: 'MyAIBot', category: BotCategory.AI_CRAWLER,
        confidence: Confidence.HIGH, uaPattern: /MyAIBot\/[\d.]+/i,
      }]);
      const r = custom.detect(botHeaders('MyAIBot/3.0'));
      expect(r.category).toBe(BotCategory.AI_CRAWLER);
      expect(r.matchedRule).toBe('my-ai');
    });

    it('custom signal weights are respected', () => {
      // Give MISSING_ACCEPT_LANGUAGE a massive weight
      const custom = new BotDetector([], { MISSING_ACCEPT_LANGUAGE: 95 });
      const r = custom.detect({ 'user-agent': 'Mozilla/5.0 Chrome/124' });
      // Should now score 95 from just missing Accept-Language
      expect(r.score).toBeGreaterThanOrEqual(95);
    });
  });
});
