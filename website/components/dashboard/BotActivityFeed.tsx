'use client';

import React, { useState } from 'react';
import { Radio, Sparkles, Filter, RefreshCw, Zap } from 'lucide-react';

export interface BotEventItem {
  id: string;
  botName: string;
  category: string;
  url: string;
  status: '200 POISONED' | '200 HONEYPOT TRAP';
  bandwidth: string;
  timestamp: string;
  badgeColor: string;
}

export default function BotActivityFeed() {
  const [selectedBotFilter, setSelectedBotFilter] = useState<string>('ALL');

  const [events, setEvents] = useState<BotEventItem[]>([
    {
      id: 'evt-1',
      botName: 'GPTBot / 1.0',
      category: 'OpenAI Training Crawler',
      url: '/api/v1/products',
      status: '200 POISONED',
      bandwidth: '18.4 KB',
      timestamp: 'Just now',
      badgeColor: 'text-[#10B981] bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'evt-2',
      botName: 'Claude-Web',
      category: 'Anthropic Knowledge Ingest',
      url: '/blog/enterprise-ai-security',
      status: '200 POISONED',
      bandwidth: '34.2 KB',
      timestamp: '42s ago',
      badgeColor: 'text-[#10B981] bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'evt-3',
      botName: 'Honeypot Trap',
      category: 'Unauthorized Scraper Trap',
      url: '/api/internal/telemetry-sync',
      status: '200 HONEYPOT TRAP',
      bandwidth: '8.1 KB',
      timestamp: '2m ago',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 'evt-4',
      botName: 'PerplexityBot',
      category: 'Perplexity AI Search Crawler',
      url: '/docs/api-reference',
      status: '200 POISONED',
      bandwidth: '12.8 KB',
      timestamp: '5m ago',
      badgeColor: 'text-[#10B981] bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'evt-5',
      botName: 'ByteSpider',
      category: 'ByteDance Commercial Scraper',
      url: '/catalog/pricing-data',
      status: '200 POISONED',
      bandwidth: '52.6 KB',
      timestamp: '11m ago',
      badgeColor: 'text-[#10B981] bg-emerald-500/10 border-emerald-500/20',
    },
  ]);

  const handleSimulateAttack = () => {
    const bots = [
      { name: 'GPTBot / 1.0', cat: 'OpenAI Training Crawler', path: '/api/v1/customers' },
      { name: 'ClaudeBot', cat: 'Anthropic Crawler', path: '/knowledge-base/docs' },
      { name: 'PerplexityBot', cat: 'Perplexity AI Search', path: '/pricing' },
      { name: 'ByteSpider', cat: 'ByteDance High-Volume', path: '/catalog/all' },
    ];
    const picked = bots[Math.floor(Math.random() * bots.length)];
    const newEvent: BotEventItem = {
      id: `evt-${Date.now()}`,
      botName: picked.name,
      category: picked.cat,
      url: picked.path,
      status: '200 POISONED',
      bandwidth: `${(Math.random() * 40 + 5).toFixed(1)} KB`,
      timestamp: 'Just now',
      badgeColor: 'text-[#10B981] bg-emerald-500/10 border-emerald-500/20',
    };

    setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
  };

  const filteredEvents =
    selectedBotFilter === 'ALL'
      ? events
      : events.filter((e) => e.botName.toLowerCase().includes(selectedBotFilter.toLowerCase()));

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-md">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#10B981] animate-pulse" />
            <h3 className="text-base font-bold text-white">Real-Time Bot Defense Activity</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Streaming intercepted AI bots and synthetic poisoned responses served with HTTP 200 OK.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Filter Dropdown/Tabs */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-white/5 text-[11px] font-mono">
            {['ALL', 'GPTBot', 'Claude', 'Perplexity'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedBotFilter(filter)}
                className={`px-2 py-1 rounded transition-colors ${
                  selectedBotFilter === filter
                    ? 'bg-zinc-800 text-cyan-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Simulate Attack Button */}
          <button
            type="button"
            onClick={handleSimulateAttack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#06B6D4]/30 bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 text-[#06B6D4] px-3 py-1.5 text-xs font-semibold transition-all shrink-0 active:scale-95"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Simulate Hit</span>
          </button>
        </div>
      </div>

      {/* Feed Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              <th className="pb-3 font-semibold">Bot / Crawler</th>
              <th className="pb-3 font-semibold">Target URL</th>
              <th className="pb-3 font-semibold">Response Status</th>
              <th className="pb-3 font-semibold">Data Defended</th>
              <th className="pb-3 font-semibold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredEvents.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                {/* Bot Name */}
                <td className="py-3.5 pr-4">
                  <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {item.botName}
                  </div>
                  <div className="text-[11px] text-zinc-500">{item.category}</div>
                </td>

                {/* Target URL */}
                <td className="py-3.5 pr-4 font-mono text-zinc-300">
                  <span className="bg-zinc-950 px-2 py-1 rounded border border-white/5">
                    {item.url}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 pr-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold border ${item.badgeColor}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                    <span>{item.status}</span>
                  </span>
                </td>

                {/* Bandwidth */}
                <td className="py-3.5 pr-4 font-mono text-zinc-400">
                  {item.bandwidth}
                </td>

                {/* Timestamp */}
                <td className="py-3.5 text-right font-mono text-zinc-500">
                  {item.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
