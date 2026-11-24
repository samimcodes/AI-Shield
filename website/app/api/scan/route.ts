import { NextRequest, NextResponse } from 'next/server';

const AI_BOTS = ['GPTBot', 'ClaudeBot', 'CCBot', 'PerplexityBot', 'ByteSpider', 'Google-Extended'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl = typeof body.url === 'string' ? body.url.trim() : '';
    if (!rawUrl) {
      return NextResponse.json({ error: 'URL or domain is required' }, { status: 400 });
    }

    const cleanHost = rawUrl
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .toLowerCase();

    if (!cleanHost || !cleanHost.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid domain (e.g. acme.com)' }, { status: 400 });
    }

    const targetOrigin = `https://${cleanHost}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let robotsTxt = '';
    let robotsStatus = 0;
    let siteStatus = 0;
    let hasXRobotsTag = false;
    let hasAiShield = false;
    let serverHeader = '';

    try {
      const [robotsRes, siteRes] = await Promise.allSettled([
        fetch(`${targetOrigin}/robots.txt`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'AI-Shield-Scanner/1.0' },
        }),
        fetch(targetOrigin, {
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': 'GPTBot/1.0' },
        }),
      ]);

      if (robotsRes.status === 'fulfilled') {
        robotsStatus = robotsRes.value.status;
        if (robotsRes.value.ok) {
          robotsTxt = await robotsRes.value.text();
        }
      }

      if (siteRes.status === 'fulfilled') {
        siteStatus = siteRes.value.status;
        hasXRobotsTag = Boolean(siteRes.value.headers.get('x-robots-tag'));
        hasAiShield = Boolean(
          siteRes.value.headers.get('x-ai-shield') ||
            siteRes.value.headers.get('x-ai-shield-status')
        );
        serverHeader = siteRes.value.headers.get('server') || '';
      }
    } finally {
      clearTimeout(timeout);
    }

    const lowerRobots = robotsTxt.toLowerCase();
    const blockedInRobots = AI_BOTS.filter((bot) =>
      lowerRobots.includes(bot.toLowerCase())
    );
    const exposedBots = AI_BOTS.filter((bot) => !blockedInRobots.includes(bot));

    const hasPoisoning = hasAiShield;
    const isReachable = siteStatus > 0 || robotsStatus > 0;

    return NextResponse.json({
      domain: cleanHost,
      reachable: isReachable,
      siteStatus,
      robotsFound: robotsStatus === 200,
      hasXRobotsTag,
      hasAiShield,
      hasPoisoning,
      serverHeader,
      blockedInRobots,
      exposedBots,
      vulnerabilitiesCount: hasAiShield ? 0 : exposedBots.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scan failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
