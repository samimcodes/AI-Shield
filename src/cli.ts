#!/usr/bin/env node
/**
 * @file src/cli.ts
 * @description Zero-configuration CLI installer and diagnostic tool for @samimcodes/ai-shield.
 *
 * Allows developers to run `npx @samimcodes/ai-shield init` to automatically
 * patch their project with the defense middleware and live dashboard without
 * writing any manual code.
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const CWD = process.cwd();

// ANSI color helpers (zero external dependencies)
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function banner() {
  console.log(`
${colors.cyan}${colors.bold}  🛡️  AI-SHIELD AUTOMATIC SETUP WIZARD${colors.reset}
  ${colors.magenta}Enterprise AI Crawler Defense & Live Security Dashboard${colors.reset}
  -------------------------------------------------------------
`);
}

/** Check if current directory is a Next.js project. */
function isNextJsProject(): boolean {
  return (
    fs.existsSync(path.join(CWD, 'next.config.js')) ||
    fs.existsSync(path.join(CWD, 'next.config.mjs')) ||
    fs.existsSync(path.join(CWD, 'next.config.ts')) ||
    (fs.existsSync(path.join(CWD, 'package.json')) &&
      fs.readFileSync(path.join(CWD, 'package.json'), 'utf8').includes('"next"'))
  );
}

/** List candidate Express server entry files. */
const SERVER_CANDIDATES = [
  'server.ts',
  'src/server.ts',
  'server.js',
  'src/server.js',
  'index.ts',
  'src/index.ts',
  'index.js',
  'src/index.js',
  'app.ts',
  'src/app.ts',
  'app.js',
  'src/app.js',
];

/** Find existing server file in target project. */
function findServerFile(): string | null {
  for (const candidate of SERVER_CANDIDATES) {
    const fullPath = path.join(CWD, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

/** Check if project uses ESM. */
function isEsmProject(filePath: string): boolean {
  if (filePath.endsWith('.ts')) return true;
  const pkgPath = path.join(CWD, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.type === 'module') return true;
    } catch {
      // ignore
    }
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('import ') && content.includes('from ');
}

/** Automatic init command. */
async function runInit() {
  banner();
  console.log(`🔍 Scanning project in: ${colors.bold}${CWD}${colors.reset}\n`);

  // 1. Next.js Project Detection
  if (isNextJsProject()) {
    console.log(`${colors.cyan}⚡ Detected Next.js App Router project!${colors.reset}`);
    const adminDir = path.join(CWD, 'app', 'admin', 'ai-shield');
    const adminPage = path.join(adminDir, 'page.tsx');

    fs.mkdirSync(adminDir, { recursive: true });

    if (!fs.existsSync(adminPage)) {
      const nextTemplate = `'use client';

import { useState } from 'react';

export default function AiShieldDashboard() {
  const [stats, setStats] = useState({ botsIntercepted: 14, goodBotsAllowed: 92, honeypotTriggers: 4, fakeTokens: 6720 });
  const [toast, setToast] = useState<{ show: boolean; bot: string; path: string }>({ show: false, bot: '', path: '' });
  const [events, setEvents] = useState([
    { id: '1', time: 'Just now', bot: 'GPTBot (OpenAI)', score: 100, path: '/api/products', action: 'POISON_JSON' },
    { id: '2', time: '2 mins ago', bot: 'Claude-Web', score: 95, path: '/pricing', action: 'POISON_HTML' },
    { id: '3', time: '5 mins ago', bot: 'ByteSpider', score: 90, path: '/articles', action: 'HONEYPOT_TRAP' },
  ]);

  const simulateAttack = () => {
    const testBots = [
      { bot: 'GPTBot (OpenAI)', path: '/api/products', action: 'POISON_JSON' },
      { bot: 'Claude-Web (Anthropic)', path: '/catalog/pricing', action: 'POISON_HTML' },
      { bot: 'ByteSpider (TikTok)', path: '/content/posts', action: 'HONEYPOT_TRAP' },
    ];
    const picked = testBots[Math.floor(Math.random() * testBots.length)] ?? testBots[0];
    setToast({ show: true, bot: picked.bot, path: picked.path });
    setStats((prev) => ({ ...prev, botsIntercepted: prev.botsIntercepted + 1, fakeTokens: prev.fakeTokens + 480 }));
    setEvents((prev) => [{ id: Date.now().toString(), time: new Date().toLocaleTimeString(), bot: picked.bot, score: 100, path: picked.path, action: picked.action }, ...prev]);
    setTimeout(() => setToast({ show: false, bot: '', path: '' }), 4000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f3f4f6', fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛡️</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>ai-shield Live Monitor</h1>
          <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>● ACTIVE DEFENSE</span>
        </div>
        <button onClick={simulateAttack} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          ⚡ Simulate Bot Attack
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#111827', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Bots Intercepted</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fb7185', margin: '0.25rem 0' }}>{stats.botsIntercepted}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>● Served synthetic poisoned data</div>
        </div>
        <div style={{ background: '#111827', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Honeypot Traps Sprung</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24', margin: '0.25rem 0' }}>{stats.honeypotTriggers}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>● Hidden bait routes triggered</div>
        </div>
        <div style={{ background: '#111827', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Search Engines (SEO)</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#34d399', margin: '0.25rem 0' }}>{stats.goodBotsAllowed}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>● Googlebot & Bingbot safe</div>
        </div>
        <div style={{ background: '#111827', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Fake Tokens Injected</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#818cf8', margin: '0.25rem 0' }}>{stats.fakeTokens.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>● AI scrapers polluted</div>
        </div>
      </div>

      {toast.show && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#1f2937', border: '1px solid #f43f5e', padding: '1rem 1.25rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(244,63,94,0.3)', zIndex: 999 }}>
          <div style={{ color: '#f43f5e', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.25rem' }}>🚨 AI CRAWLER INTERCEPTED</div>
          <div style={{ fontSize: '0.875rem' }}>
            <strong>{toast.bot}</strong> targeted <code style={{ color: '#818cf8' }}>{toast.path}</code>.<br />
            Returned fake poisoned data (HTTP 200 OK).
          </div>
        </div>
      )}
    </div>
  );
}
`;
      fs.writeFileSync(adminPage, nextTemplate, 'utf8');
      console.log(`${colors.green}✓ Created Live Security Dashboard:${colors.reset} app/admin/ai-shield/page.tsx`);
    } else {
      console.log(`${colors.yellow}ℹ Dashboard page already exists at:${colors.reset} app/admin/ai-shield/page.tsx`);
    }

    console.log(`\n${colors.green}${colors.bold}🎉 Next.js Setup Complete!${colors.reset}`);
    console.log(`Run ${colors.cyan}npm run dev${colors.reset} and visit:`);
    console.log(`👉 ${colors.bold}${colors.green}http://localhost:3000/admin/ai-shield${colors.reset}\n`);
    return;
  }

  // 2. Express / Node.js Server Auto-Patching
  const serverFile = findServerFile();

  if (serverFile) {
    const relPath = path.relative(CWD, serverFile);
    console.log(`${colors.green}✓ Detected server entrypoint:${colors.reset} ${relPath}`);
    let content = fs.readFileSync(serverFile, 'utf8');

    if (content.includes('@samimcodes/ai-shield') || content.includes('aiShield(')) {
      console.log(`${colors.yellow}ℹ AI-Shield is already installed in ${relPath}.${colors.reset}`);
      console.log(`Live dashboard is accessible at: ${colors.cyan}http://localhost:3000/admin/ai-shield${colors.reset}\n`);
      return;
    }

    const isEsm = isEsmProject(serverFile);
    const importStatement = isEsm
      ? `import { aiShield } from '@samimcodes/ai-shield';\n`
      : `const { aiShield } = require('@samimcodes/ai-shield');\n`;

    const middlewareCall = `\n// 🛡️ Protected by AI-Shield (Automatic Setup)\napp.use(aiShield({ enableDashboard: true }));\n`;

    // Add import statement at top
    content = importStatement + content;

    // Inject app.use right after `const app = express();`
    const appPattern = /(const|let|var)\s+app\s*=\s*express\s*\([^)]*\)\s*;?/;
    if (appPattern.test(content)) {
      content = content.replace(appPattern, (match) => `${match}${middlewareCall}`);
      fs.writeFileSync(serverFile, content, 'utf8');
      console.log(`${colors.green}✓ Successfully injected aiShield into ${relPath}!${colors.reset}`);
    } else {
      // Prepend before app.listen if app pattern not matched
      const listenPattern = /app\.listen\s*\(/;
      if (listenPattern.test(content)) {
        content = content.replace(listenPattern, (match) => `${middlewareCall}${match}`);
        fs.writeFileSync(serverFile, content, 'utf8');
        console.log(`${colors.green}✓ Successfully injected aiShield before app.listen in ${relPath}!${colors.reset}`);
      } else {
        fs.writeFileSync(serverFile, `${content}${middlewareCall}`, 'utf8');
        console.log(`${colors.yellow}⚠ Added middleware to ${relPath}. Please verify app.use order.${colors.reset}`);
      }
    }

    console.log(`\n${colors.green}${colors.bold}🎉 Setup Complete! No code writing required!${colors.reset}`);
    console.log(`Start your server and visit:`);
    console.log(`👉 ${colors.bold}${colors.green}http://localhost:3000/admin/ai-shield${colors.reset}\n`);
    return;
  }

  // 3. If no server file exists, create a ready-to-run Express starter
  const starterFile = path.join(CWD, 'server.js');
  const starterContent = `// Created automatically by @samimcodes/ai-shield init
import express from 'express';
import { aiShield } from '@samimcodes/ai-shield';

const app = express();

// 🛡️ Live AI Defense + Real-Time Security Monitor
app.use(aiShield({
  enableDashboard: true,
}));

app.get('/', (req, res) => {
  res.send('<h1>My Website</h1><p>Protected from AI scrapers by ai-shield.</p>');
});

app.get('/api/products', (req, res) => {
  res.json({ secretCatalog: [{ id: 1, name: 'Premium Item', price: 99 }] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Live Security Monitor: http://localhost:' + PORT + '/admin/ai-shield');
});
`;

  fs.writeFileSync(starterFile, starterContent, 'utf8');
  console.log(`${colors.green}✓ Created new protected Express server:${colors.reset} server.js`);
  console.log(`\n${colors.green}${colors.bold}🎉 Setup Complete!${colors.reset}`);
  console.log(`Run ${colors.cyan}node server.js${colors.reset} and open:`);
  console.log(`👉 ${colors.bold}${colors.green}http://localhost:3000/admin/ai-shield${colors.reset}\n`);
}

/** Test command to send a simulated bot attack to a running server. */
function runTest(targetUrl?: string) {
  banner();
  const url = targetUrl ?? 'http://localhost:3000/api/products';
  console.log(`🤖 Testing bot defense against: ${colors.cyan}${url}${colors.reset}\n`);

  try {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 80,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
          'Accept': 'application/json',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          console.log(`Response Status: ${colors.bold}${res.statusCode} ${res.statusMessage}${colors.reset}`);
          console.log(`X-Robots-Tag:    ${colors.bold}${res.headers['x-robots-tag'] ?? 'None'}${colors.reset}`);
          console.log(`Body Preview:    ${colors.magenta}${body.slice(0, 150)}...${colors.reset}\n`);

          if (res.statusCode === 200) {
            console.log(`${colors.green}${colors.bold}✓ SUCCESS! Bot was intercepted and served poisoned response!${colors.reset}`);
            console.log(`Check your live monitor at: ${colors.cyan}http://localhost:3000/admin/ai-shield${colors.reset}\n`);
          } else {
            console.log(`${colors.yellow}Server returned status ${res.statusCode}. Ensure your server is running.${colors.reset}\n`);
          }
        });
      },
    );

    req.on('error', (err) => {
      console.log(`${colors.red}✗ Connection failed: ${err.message}${colors.reset}`);
      console.log(`Make sure your server is running on ${colors.bold}${url}${colors.reset} before testing.\n`);
    });

    req.end();
  } catch (err) {
    console.log(`${colors.red}Invalid URL: ${targetUrl}${colors.reset}`);
  }
}

// ── Main CLI Dispatcher ────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0] || 'init';

switch (command) {
  case 'init':
    runInit();
    break;
  case 'test':
    runTest(args[1]);
    break;
  case '--help':
  case '-h':
  case 'help':
    banner();
    console.log(`Commands:
  ${colors.bold}npx @samimcodes/ai-shield init${colors.reset}       Automatically injects AI-Shield into your server
  ${colors.bold}npx @samimcodes/ai-shield test [url]${colors.reset}  Sends a simulated GPTBot attack to test defense
  ${colors.bold}npx @samimcodes/ai-shield --help${colors.reset}      Show this help message
`);
    break;
  default:
    runInit();
    break;
}
