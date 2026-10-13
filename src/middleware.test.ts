/**
 * @file src/middleware.test.ts
 * @description Integration tests for the createAiShield() middleware factory.
 *
 * Uses supertest to simulate real HTTP requests through the full stack.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createAiShield } from './middleware.js';
import { BotCategory } from './types/index.js';

// ─── App factory ──────────────────────────────────────────────────────────

function buildApp(options: Parameters<typeof createAiShield>[0] = {}) {
  const app = express();
  // Enable req.ip from X-Forwarded-For so we can test IP flagging
  app.set('trust proxy', 1);
  app.use(createAiShield(options));
  app.get('/',                (_req, res) => res.status(200).json({ real: true }));
  app.get('/api/articles',    (_req, res) => res.status(200).json({ articles: [] }));
  app.get('/api/data',        (_req, res) => res.status(200).json({ data: [] }));
  app.get('/health',          (_req, res) => res.status(200).json({ ok: true }));
  app.get('/metrics',         (_req, res) => res.status(200).send('# metrics\n'));
  return app;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const HUMAN_UA       = 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/124 Safari/537.36';
const GOOGLEBOT_UA   = 'Googlebot/2.1 (+http://www.google.com/bot.html)';
const BINGBOT_UA     = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)';
const GPTBOT_UA      = 'GPTBot/1.0';
const CLAUDE_UA      = 'Claude-Web/1.0';
const CCBOT_UA       = 'CCBot/2.0 (https://commoncrawl.org/faq/)';
const BYTESPIDER_UA  = 'Bytespider; +https://zhanzhang.toutiao.com/';
const SCRAPY_UA      = 'Scrapy/2.11.0 (+https://scrapy.org)';
const PYREQ_UA       = 'python-requests/2.31.0';
const HEADLESS_UA    = 'Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/124.0.0.0 Safari/537.36';
const CURL_UA        = 'curl/8.7.1';

// ─── 1. Human pass-through ─────────────────────────────────────────────────

describe('Human traffic', () => {
  it('real browser passes through to the application', async () => {
    const app = buildApp();
    const res = await request(app)
      .get('/')
      .set('User-Agent', HUMAN_UA)
      .set('Accept', 'text/html')
      .set('Accept-Language', 'en-US,en;q=0.9');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ real: true });
  });
});

// ─── 2. Good bots pass through ────────────────────────────────────────────

describe('SEO bots (GOOD_BOT)', () => {
  const goodBots = [
    ['Googlebot', GOOGLEBOT_UA],
    ['Bingbot',   BINGBOT_UA],
  ] as const;

  it.each(goodBots)('%s passes through without poisoning', async (_name, ua) => {
    const app = buildApp();
    const res = await request(app).get('/').set('User-Agent', ua);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ real: true });
  });
});

// ─── 3. AI crawler interception ───────────────────────────────────────────

describe('AI crawler interception', () => {
  it('GPTBot receives HTTP 200 with poison HTML', async () => {
    const app = buildApp();
    const res = await request(app).get('/').set('User-Agent', GPTBOT_UA);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).not.toContain('"real":true');
    expect(res.text).toContain('<article>');
  });

  it('Claude-Web receives poison', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/articles').set('User-Agent', CLAUDE_UA);
    expect(res.status).toBe(200);
    expect(res.text).not.toContain('"articles":[]');
  });

  it('CCBot receives poison', async () => {
    const app = buildApp();
    const res = await request(app).get('/').set('User-Agent', CCBOT_UA);
    expect(res.status).toBe(200);
    expect(res.text).toContain('<html');
  });
});

// ─── 4. Scraping library interception ────────────────────────────────────

describe('Scraping library interception', () => {
  const libs = [
    ['Scrapy',             SCRAPY_UA],
    ['python-requests',    PYREQ_UA],
    ['HeadlessChrome',     HEADLESS_UA],
    ['ByteSpider',         BYTESPIDER_UA],
  ] as const;

  it.each(libs)('%s is intercepted and receives poison', async (_name, ua) => {
    const app = buildApp();
    const res = await request(app).get('/').set('User-Agent', ua);
    expect(res.status).toBe(200);
    expect(res.body).not.toEqual({ real: true });
  });

  it('cURL passes through when score < threshold (browser-like headers)', async () => {
    // curl with full browser headers scores low — should pass through
    const app = buildApp({ scoreThreshold: 60 });
    const res = await request(app)
      .get('/')
      .set('User-Agent', CURL_UA)
      .set('Accept', 'text/html,application/xhtml+xml,*/*')
      .set('Accept-Language', 'en-US,en;q=0.9');
    // cURL scores 50 (MEDIUM confidence UA match only)
    // With threshold 60 it should pass through
    expect(res.status).toBe(200);
  });
});

// ─── 5. Content negotiation ───────────────────────────────────────────────

describe('Content negotiation', () => {
  it('serves JSON poison when bot sends Accept: application/json', async () => {
    const app = buildApp({ poisonContentType: 'HTML' });
    const res = await request(app)
      .get('/api/data')
      .set('User-Agent', GPTBOT_UA)
      .set('Accept', 'application/json');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    const parsed = JSON.parse(res.text) as { status: string; data: unknown[] };
    expect(parsed.status).toBe('success');
    expect(Array.isArray(parsed.data)).toBe(true);
  });

  it('serves SITEMAP poison for .xml path', async () => {
    const app = buildApp();
    const res = await request(app)
      .get('/sitemap.xml')
      .set('User-Agent', GPTBOT_UA);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('xml');
    expect(res.text).toContain('<urlset');
  });
});

// ─── 6. Response headers ──────────────────────────────────────────────────

describe('Poison response headers', () => {
  it('sets Cache-Control: no-store', async () => {
    const app = buildApp();
    const res = await request(app).get('/').set('User-Agent', GPTBOT_UA);
    expect(res.headers['cache-control']).toContain('no-store');
  });

  it('sets X-Robots-Tag: noindex', async () => {
    const app = buildApp();
    const res = await request(app).get('/').set('User-Agent', GPTBOT_UA);
    expect(res.headers['x-robots-tag']).toContain('noindex');
  });

  it('sets Pragma: no-cache', async () => {
    const app = buildApp();
    const res = await request(app).get('/').set('User-Agent', GPTBOT_UA);
    expect(res.headers['pragma']).toBe('no-cache');
  });
});

// ─── 7. Excluded paths ────────────────────────────────────────────────────

describe('Excluded paths', () => {
  it('excluded path bypasses poison even for AI crawlers', async () => {
    const app = buildApp({ excludePaths: ['/health'] });
    const res = await request(app).get('/health').set('User-Agent', GPTBOT_UA);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('non-excluded paths are still poisoned', async () => {
    const app = buildApp({ excludePaths: ['/health'] });
    const res = await request(app).get('/').set('User-Agent', GPTBOT_UA);
    expect(res.body).not.toEqual({ real: true });
  });
});

// ─── 8. Honeypot trap routes ──────────────────────────────────────────────

describe('Honeypot trap routes', () => {
  const traps = [
    ['/api/internal/telemetry-sync', 'canonical trap'],
    ['/wp-login.php',               'WordPress login'],
    ['/.env',                       'env file'],
    ['/training-data',              'training data bait'],
    ['/llm-corpus',                 'LLM corpus bait'],
  ] as const;

  it.each(traps)('%s (%s) returns poison HTTP 200', async (path) => {
    const app = buildApp();
    const res = await request(app)
      .get(path)
      .set('User-Agent', HUMAN_UA)   // even humans get poison on trap routes
      .set('Accept-Language', 'en-US')
      .set('Accept', 'text/html');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
  });

  it('canonical /api/internal/telemetry-sync flags the requesting IP', async () => {
    const onBotDetected = vi.fn();
    const app = buildApp({ onBotDetected });
    await request(app)
      .get('/api/internal/telemetry-sync')
      .set('User-Agent', GPTBOT_UA);
    expect(onBotDetected).toHaveBeenCalled();
  });
});

// ─── 9. scoreThreshold option ─────────────────────────────────────────────

describe('scoreThreshold option', () => {
  it('traffic below threshold passes through', async () => {
    // Bare human UA with browser headers → score 0, threshold 90
    const app = buildApp({ scoreThreshold: 90 });
    const res = await request(app)
      .get('/')
      .set('User-Agent', HUMAN_UA)
      .set('Accept', 'text/html')
      .set('Accept-Language', 'en-US');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ real: true });
  });

  it('high-confidence bot is always intercepted regardless of threshold', async () => {
    // GPTBot scores 80+ from UA match alone; even threshold=70 should catch it
    const app = buildApp({ scoreThreshold: 70 });
    const res = await request(app).get('/').set('User-Agent', GPTBOT_UA);
    expect(res.status).toBe(200);
    expect(res.body).not.toEqual({ real: true });
  });
});

// ─── 10. onBotDetected callback ────────────────────────────────────────────

describe('onBotDetected callback', () => {
  it('fires for intercepted AI crawler with correct category', async () => {
    const callback = vi.fn();
    const app = buildApp({ onBotDetected: callback });
    await request(app).get('/').set('User-Agent', GPTBOT_UA);
    expect(callback).toHaveBeenCalledOnce();
    const result = callback.mock.calls[0]?.[0] as { category: BotCategory };
    expect(result.category).toBe(BotCategory.AI_CRAWLER);
  });

  it('callback receives score and signals', async () => {
    const callback = vi.fn();
    const app = buildApp({ onBotDetected: callback });
    await request(app).get('/').set('User-Agent', GPTBOT_UA);
    const result = callback.mock.calls[0]?.[0] as {
      score: number;
      signals: string[];
    };
    expect(typeof result.score).toBe('number');
    expect(Array.isArray(result.signals)).toBe(true);
  });

  it('does NOT fire for human traffic with full browser headers', async () => {
    const callback = vi.fn();
    const app = buildApp({ onBotDetected: callback });
    await request(app)
      .get('/')
      .set('User-Agent', HUMAN_UA)
      .set('Accept', 'text/html')
      .set('Accept-Language', 'en-US');
    expect(callback).not.toHaveBeenCalled();
  });

  it('does NOT crash if callback throws', async () => {
    const app = buildApp({
      onBotDetected: () => { throw new Error('Boom'); },
    });
    const res = await request(app).get('/').set('User-Agent', GPTBOT_UA);
    expect(res.status).toBe(200); // middleware survives the callback error
  });
});

// ─── 11. req.aiShield metadata ─────────────────────────────────────────────

describe('req.aiShield metadata', () => {
  it('poisoned flag is false for human traffic', async () => {
    let captured: unknown;
    const app = express();
    app.use(createAiShield());
    app.get('/', (req, res) => {
      captured = (req as express.Request & { aiShield?: unknown }).aiShield;
      res.json({ ok: true });
    });

    await request(app)
      .get('/')
      .set('User-Agent', HUMAN_UA)
      .set('Accept', 'text/html')
      .set('Accept-Language', 'en-US,en;q=0.9');
    const meta = captured as { detection: { category: string }; poisoned: boolean };
    expect(meta).toBeDefined();
    expect(meta.poisoned).toBe(false);
    expect(meta.detection.category).toBe(BotCategory.HUMAN);
  });
});

// ─── 12. Honeypot link injection ──────────────────────────────────────────

describe('Honeypot link injection', () => {
  it('injects hidden links into HTML poison when enabled', async () => {
    const app = buildApp({ injectHoneypotLinks: true });
    const res = await request(app).get('/').set('User-Agent', GPTBOT_UA);
    expect(res.text).toContain('display:none');
    expect(res.text).toContain('/api/internal/telemetry-sync');
  });

  it('injection references canonical trap path', async () => {
    const app = buildApp({ injectHoneypotLinks: true });
    const res = await request(app).get('/').set('User-Agent', GPTBOT_UA);
    expect(res.text).toContain('/api/internal/telemetry-sync');
  });
});

// ─── Cleanup ──────────────────────────────────────────────────────────────
afterEach(() => {
  vi.clearAllMocks();
});
