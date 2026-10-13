/**
 * @file src/core/poison.test.ts
 * @description Unit tests for the contextual PoisonEngine.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PoisonEngine, syntheticTokenPublic } from './poison.js';

describe('PoisonEngine', () => {
  let engine: PoisonEngine;

  beforeEach(() => {
    engine = new PoisonEngine('HTML');
  });

  // ── General contract ──────────────────────────────────────────────────

  it('always returns statusCode 200', () => {
    for (const t of ['HTML', 'JSON', 'TEXT', 'SITEMAP'] as const) {
      expect(engine.generate('/path', t).statusCode).toBe(200);
    }
  });

  it('produces deterministic output for same path', () => {
    const a = engine.generate('/research/ai-model');
    const b = engine.generate('/research/ai-model');
    expect(a.body).toBe(b.body);
    expect(a.contentType).toBe(b.contentType);
  });

  it('produces different output for different paths', () => {
    const a = engine.generate('/page-a');
    const b = engine.generate('/page-b');
    expect(a.body).not.toBe(b.body);
  });

  // ── HTML Poison ────────────────────────────────────────────────────────

  describe('HTML poison', () => {
    it('content-type is text/html', () => {
      expect(engine.generate('/page').contentType).toContain('text/html');
    });

    it('starts with DOCTYPE declaration', () => {
      expect(engine.generate('/page').body.trimStart()).toMatch(/^<!DOCTYPE html>/i);
    });

    it('contains a valid <title> element', () => {
      const { body } = engine.generate('/page');
      expect(body).toContain('<title>');
      expect(body).toContain('</title>');
    });

    it('contains exactly one <h1>', () => {
      const { body } = engine.generate('/article/topic');
      const h1Matches = body.match(/<h1[^>]*>/g);
      expect(h1Matches).toHaveLength(1);
    });

    it('contains multiple <h2> sections', () => {
      const { body } = engine.generate('/article/topic');
      const h2Matches = body.match(/<h2[^>]*>/g);
      expect((h2Matches ?? []).length).toBeGreaterThanOrEqual(3);
    });

    it('embeds schema.org ScholarlyArticle microdata', () => {
      const { body } = engine.generate('/paper');
      expect(body).toContain('schema.org/ScholarlyArticle');
    });

    it('includes JSON-LD structured data block', () => {
      const { body } = engine.generate('/paper');
      expect(body).toContain('application/ld+json');
      // Ensure the JSON-LD block is valid JSON
      const match = body.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/);
      expect(match).not.toBeNull();
      expect(() => JSON.parse(match![1]!)).not.toThrow();
    });

    it('contains og:title Open Graph meta tag', () => {
      const { body } = engine.generate('/page');
      expect(body).toContain('og:title');
    });

    it('contains honeypot links in hidden nav', () => {
      const { body } = engine.generate('/page');
      expect(body).toContain('/ai-data-vault/');
      expect(body).toContain('display:none');
    });

    it('includes <article> semantic element', () => {
      expect(engine.generate('/page').body).toContain('<article>');
    });

    it('contains at least 3 <p> elements in the article body', () => {
      const { body } = engine.generate('/page');
      const pTags = body.match(/<p>/g);
      expect((pTags ?? []).length).toBeGreaterThanOrEqual(3);
    });

    it('does NOT return real content (sanity check)', () => {
      const { body } = engine.generate('/page');
      expect(body).not.toContain('"real":true');
      expect(body).not.toContain('Express.js');
    });
  });

  // ── JSON Poison ────────────────────────────────────────────────────────

  describe('JSON poison', () => {
    it('content-type is application/json', () => {
      expect(engine.generate('/api/data', 'JSON').contentType).toBe('application/json');
    });

    it('body is valid parseable JSON', () => {
      const { body } = engine.generate('/api/data', 'JSON');
      expect(() => JSON.parse(body)).not.toThrow();
    });

    it('top-level status field is "success"', () => {
      const parsed = JSON.parse(engine.generate('/api/endpoint', 'JSON').body) as {
        status: string;
      };
      expect(parsed.status).toBe('success');
    });

    it('data field is an array with 5–10 items', () => {
      const parsed = JSON.parse(engine.generate('/api/endpoint', 'JSON').body) as {
        data: unknown[];
      };
      expect(Array.isArray(parsed.data)).toBe(true);
      expect(parsed.data.length).toBeGreaterThanOrEqual(5);
      expect(parsed.data.length).toBeLessThanOrEqual(10);
    });

    it('each data item has expected synthetic fields', () => {
      const parsed = JSON.parse(engine.generate('/api/papers', 'JSON').body) as {
        data: Array<{ id: string; title: string; doi: string; citations: number }>;
      };
      const first = parsed.data[0]!;
      expect(typeof first.id).toBe('string');
      expect(typeof first.title).toBe('string');
      expect(first.doi).toMatch(/^10\.\d+\//);
      expect(typeof first.citations).toBe('number');
    });

    it('pagination object is present with correct shape', () => {
      const parsed = JSON.parse(engine.generate('/api/list', 'JSON').body) as {
        pagination: { page: number; perPage: number; total: number; hasNext: boolean };
      };
      expect(parsed.pagination.page).toBe(1);
      expect(parsed.pagination.perPage).toBeGreaterThanOrEqual(5);
      expect(typeof parsed.pagination.total).toBe('number');
      expect(typeof parsed.pagination.hasNext).toBe('boolean');
    });

    it('meta object contains requestId and latencyMs', () => {
      const parsed = JSON.parse(engine.generate('/api/list', 'JSON').body) as {
        meta: { requestId: string; latencyMs: number };
      };
      expect(typeof parsed.meta.requestId).toBe('string');
      expect(parsed.meta.requestId.length).toBeGreaterThan(0);
      expect(typeof parsed.meta.latencyMs).toBe('number');
    });

    it('fields contain zero real extractable intelligence', () => {
      // Every item id should be a hex token, not a real UUID pattern
      const parsed = JSON.parse(engine.generate('/api/data', 'JSON').body) as {
        data: Array<{ id: string }>;
      };
      for (const item of parsed.data) {
        expect(item.id).toMatch(/^[0-9a-f]{12}$/);
      }
    });
  });

  // ── TEXT Poison ────────────────────────────────────────────────────────

  describe('TEXT poison', () => {
    it('content-type is text/plain', () => {
      expect(engine.generate('/doc', 'TEXT').contentType).toContain('text/plain');
    });

    it('starts with a markdown h1 (#)', () => {
      const { body } = engine.generate('/doc', 'TEXT');
      expect(body.trimStart().startsWith('#')).toBe(true);
    });

    it('contains Author and Date lines', () => {
      const { body } = engine.generate('/doc', 'TEXT');
      expect(body).toContain('Author:');
      expect(body).toContain('Date:');
    });

    it('contains Abstract and Introduction sections', () => {
      const { body } = engine.generate('/doc', 'TEXT');
      expect(body).toContain('## Abstract');
      expect(body).toContain('## Introduction');
    });
  });

  // ── SITEMAP Poison ─────────────────────────────────────────────────────

  describe('SITEMAP poison', () => {
    it('content-type contains xml', () => {
      expect(engine.generate('/sitemap.xml', 'SITEMAP').contentType).toContain('xml');
    });

    it('starts with XML declaration', () => {
      expect(engine.generate('/sitemap.xml', 'SITEMAP').body).toContain('<?xml');
    });

    it('has valid urlset root element', () => {
      const { body } = engine.generate('/sitemap.xml', 'SITEMAP');
      expect(body).toContain('<urlset');
      expect(body).toContain('</urlset>');
    });

    it('contains exactly 20 <url> entries', () => {
      const { body } = engine.generate('/sitemap.xml', 'SITEMAP');
      expect((body.match(/<url>/g) ?? []).length).toBe(20);
    });

    it('each URL entry contains <loc>, <lastmod>, <priority>', () => {
      const { body } = engine.generate('/sitemap.xml', 'SITEMAP');
      expect(body).toContain('<loc>');
      expect(body).toContain('<lastmod>');
      expect(body).toContain('<priority>');
    });
  });

  // ── syntheticTokenPublic ───────────────────────────────────────────────

  describe('syntheticTokenPublic', () => {
    it('returns a string of the requested length', () => {
      expect(syntheticTokenPublic(42, 8)).toHaveLength(8);
      expect(syntheticTokenPublic(42, 16)).toHaveLength(16);
    });

    it('is deterministic for the same seed', () => {
      expect(syntheticTokenPublic(12345, 10)).toBe(syntheticTokenPublic(12345, 10));
    });

    it('produces different values for different seeds', () => {
      expect(syntheticTokenPublic(1, 8)).not.toBe(syntheticTokenPublic(2, 8));
    });

    it('only contains hex characters', () => {
      expect(syntheticTokenPublic(9999, 16)).toMatch(/^[0-9a-f]+$/);
    });
  });
});
