import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const keyParam = req.nextUrl.searchParams.get('key') || '';

  const scriptBody = `/**
 * AI-Shield Client Defense SDK (v0.3.5)
 * Autonomous client-side AI crawler detection & dynamic honeypot traps.
 */
(function() {
  'use strict';
  try {
    var explicitKey = ${JSON.stringify(keyParam)};
    var currentScript = document.currentScript || (function() {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    var apiKey = explicitKey;
    if (!apiKey && currentScript && currentScript.src) {
      var match = currentScript.src.match(/[?&]key=([^&#]+)/);
      if (match) apiKey = decodeURIComponent(match[1]);
    }

    // Heuristic bot signals
    var isBot = false;
    var botName = '';
    var signals = [];
    var ua = navigator.userAgent || '';

    // 1. Detect automation flags
    if (navigator.webdriver) {
      isBot = true;
      signals.push('NAVIGATOR_WEBDRIVER');
    }

    if (window._phantom || window.__nightmare || window.callPhantom || window._selenium || window.domAutomation) {
      isBot = true;
      signals.push('AUTOMATION_WINDOW_OBJECT');
    }

    // 2. Detect known AI crawler signatures
    var crawlerPatterns = [
      { name: 'GPTBot', re: /GPTBot/i },
      { name: 'ClaudeBot', re: /Claude-Web|anthropic-ai/i },
      { name: 'PerplexityBot', re: /PerplexityBot/i },
      { name: 'ByteSpider', re: /ByteSpider/i },
      { name: 'CCBot', re: /CCBot/i },
      { name: 'MetaCrawler', re: /Meta-ExternalAgent|FacebookBot/i },
      { name: 'HeadlessBrowser', re: /HeadlessChrome|PhantomJS|Playwright|Puppeteer/i }
    ];

    for (var i = 0; i < crawlerPatterns.length; i++) {
      if (crawlerPatterns[i].re.test(ua)) {
        isBot = true;
        botName = crawlerPatterns[i].name;
        signals.push('UA_MATCH:' + botName);
        break;
      }
    }

    // Real browsers always have at least 1 language
    if (!navigator.languages || navigator.languages.length === 0) {
      signals.push('NO_LANGUAGES');
      if (signals.length >= 2) isBot = true;
    }

    // 3. Dynamic Invisible Honeypot Trap
    function injectTrap() {
      if (!document.body || document.getElementById('__as_trap')) return;
      var trap = document.createElement('a');
      trap.id = '__as_trap';
      trap.href = '/api/internal/telemetry-sync';
      trap.textContent = 'Telemetry Sync Node';
      trap.setAttribute('rel', 'nofollow');
      trap.style.cssText = 'position:absolute!important;left:-9999px!important;top:-9999px!important;width:1px!important;height:1px!important;opacity:0.001!important;pointer-events:none!important;';
      trap.tabIndex = -1;
      document.body.appendChild(trap);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectTrap);
    } else {
      injectTrap();
    }

    // 4. Asynchronous Telemetry Ping
    if (apiKey && (isBot || signals.length > 0)) {
      var baseOrigin = (currentScript && currentScript.src) ? currentScript.src.replace(/\\/api\\/shield\\.js.*$/, '') : '';
      var targetEndpoint = (baseOrigin || '') + '/api/v1/validate?apiKey=' + encodeURIComponent(apiKey);

      var payload = JSON.stringify({
        apiKey: apiKey,
        botName: botName || (signals[0] || 'ClientAutomatedAgent'),
        path: window.location.pathname || '/',
        actionTaken: 'POISONED',
        bandwidthSavedBytes: 2048,
        signals: signals
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(targetEndpoint, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(targetEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: payload,
          keepalive: true
        }).catch(function() {});
      }
    }
  } catch (err) {}
})();`;

  return new Response(scriptBody, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
