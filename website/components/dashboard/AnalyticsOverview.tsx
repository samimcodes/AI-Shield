'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Zap, Sparkles, TrendingUp, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface AnalyticsOverviewProps {
  requestsUsed?: number;
  requestsMax?: number;
  planName?: string;
}

export default function AnalyticsOverview({
  requestsUsed = 4200,
  requestsMax = 5000,
  planName = 'Free',
}: AnalyticsOverviewProps) {
  const percentUsed = Math.min(100, Math.round((requestsUsed / requestsMax) * 100));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 7-day simulated dataset
  const chartData = [
    { day: 'Mon', botsBlocked: 480, seoAllowed: 1200 },
    { day: 'Tue', botsBlocked: 620, seoAllowed: 1450 },
    { day: 'Wed', botsBlocked: 510, seoAllowed: 1300 },
    { day: 'Thu', botsBlocked: 740, seoAllowed: 1600 },
    { day: 'Fri', botsBlocked: 890, seoAllowed: 1720 },
    { day: 'Sat', botsBlocked: 420, seoAllowed: 950 },
    { day: 'Sun', botsBlocked: 558, seoAllowed: 1100 },
  ];

  const maxVal = 2000;
  const svgHeight = 160;
  const svgWidth = 600;

  // Build SVG path points
  const pointsBots = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * svgWidth;
    const y = svgHeight - (d.botsBlocked / maxVal) * (svgHeight - 20) - 10;
    return `${x},${y}`;
  });

  const pathBots = `M ${pointsBots.join(' L ')}`;
  const areaBots = `${pathBots} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;

  const pointsSeo = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * svgWidth;
    const y = svgHeight - (d.seoAllowed / maxVal) * (svgHeight - 20) - 10;
    return `${x},${y}`;
  });
  const pathSeo = `M ${pointsSeo.join(' L ')}`;

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium">Total AI Bots Blocked</span>
            <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-[#06B6D4]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            4,218
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#10B981] mt-2 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>+24.8% vs last week</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium">Bandwidth Saved</span>
            <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-[#10B981]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            342.8 MB
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">
            ~14.8M scraper tokens defended
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium">Active Poison Responses</span>
            <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            1,840
          </div>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-2">
            <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
            <span>100% served under HTTP 200 OK</span>
          </div>
        </div>

        {/* Metric 4: Quota Card */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-medium">Monthly Quota ({planName})</span>
              <span className="text-xs font-bold text-white font-mono">{percentUsed}%</span>
            </div>
            <div className="text-lg font-bold text-white tracking-tight mb-2 font-mono">
              {requestsUsed.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">/ {requestsMax.toLocaleString()} hits</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  percentUsed >= 80
                    ? 'bg-gradient-to-r from-amber-400 to-[#06B6D4]'
                    : 'bg-[#06B6D4]'
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>

          {percentUsed >= 80 && (
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-between text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 text-[#06B6D4] border border-[#06B6D4]/30 transition-colors"
            >
              <span>Quota alert: Upgrade to Pro</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Traffic Trend Chart (SVG) */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">7-Day Defense Activity</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparison between intercepted AI scrapers and legitimate search engine bots.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#06B6D4]" />
              <span className="text-zinc-300">AI Bots Poisoned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <span className="text-zinc-300">SEO Crawlers Allowed</span>
            </div>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="relative w-full overflow-hidden pt-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1={svgHeight - 10} x2={svgWidth} y2={svgHeight - 10} stroke="rgba(255,255,255,0.08)" />
            <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />

            {/* Area Fill for Bots */}
            <path d={areaBots} fill="url(#cyanGradient)" />

            {/* Curve 1: Bots Blocked */}
            <path
              d={pathBots}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Curve 2: SEO Allowed */}
            <path
              d={pathSeo}
              fill="none"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Interactive Points */}
            {chartData.map((d, i) => {
              const x = (i / (chartData.length - 1)) * svgWidth;
              const y = svgHeight - (d.botsBlocked / maxVal) * (svgHeight - 20) - 10;
              return (
                <circle
                  key={d.day}
                  cx={x}
                  cy={y}
                  r={hoveredIndex === i ? 5 : 3}
                  className="fill-[#06B6D4] stroke-zinc-900 stroke-2 transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Day Labels */}
          <div className="flex justify-between text-[11px] font-mono text-zinc-500 pt-3 border-t border-white/5">
            {chartData.map((d, i) => (
              <span
                key={d.day}
                className={`transition-colors ${
                  hoveredIndex === i ? 'text-cyan-400 font-bold' : ''
                }`}
              >
                {d.day}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
