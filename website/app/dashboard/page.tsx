import React from 'react';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OnboardingWizard from '@/components/dashboard/OnboardingWizard';
import ApiKeysManager from '@/components/dashboard/ApiKeysManager';
import AnalyticsOverview from '@/components/dashboard/AnalyticsOverview';
import BotActivityFeed, { type BotEventItem } from '@/components/dashboard/BotActivityFeed';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLAN_CONFIGS, PlanType, generateLiveApiKey } from '@/lib/api-key';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard | AI-Shield Autonomous Defense',
  description: 'Monitor live bot interceptions, honeypot traps, and data poisoning activity in real time.',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  let user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      apiKeys: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  if (user.apiKeys.length === 0) {
    await prisma.apiKey.create({
      data: {
        key: generateLiveApiKey(),
        name: 'Default Production Key',
        userId: user.id,
        isActive: true,
      },
    });
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        apiKeys: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  const primaryKey = user?.apiKeys[0]?.key ?? 'as_live_pending';
  const planKey = (user?.plan || 'FREE') as PlanType;
  const tier = PLAN_CONFIGS[planKey] || PLAN_CONFIGS.FREE;
  const planLabel =
    planKey === 'BUSINESS' ? 'Business' : planKey === 'PRO' ? 'Pro' : 'Free';

  const requestsUsed =
    user?.apiKeys.reduce((sum, k) => sum + k.requestsThisMonth, 0) ?? 0;
  const requestsMax = tier.maxMonthlyRequests;

  const apiKeyIds = user?.apiKeys.map((k) => k.id) ?? [];
  const [rawLogs, totalBotsBlocked, aggBandwidth] =
    apiKeyIds.length > 0
      ? await Promise.all([
          prisma.botLog.findMany({
            where: { apiKeyId: { in: apiKeyIds } },
            orderBy: { timestamp: 'desc' },
            take: 25,
          }),
          prisma.botLog.count({
            where: { apiKeyId: { in: apiKeyIds } },
          }),
          prisma.botLog.aggregate({
            where: { apiKeyId: { in: apiKeyIds } },
            _sum: { bandwidthSavedBytes: true },
          }),
        ])
      : [[], 0, { _sum: { bandwidthSavedBytes: null } }];

  const bandwidthSavedBytes = Number(aggBandwidth._sum.bandwidthSavedBytes ?? 0);

  // Build 7-day rolling telemetry from real BotLog timestamps
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyMap = new Map<string, { day: string; botsBlocked: number; seoAllowed: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, {
      day: dayNames[d.getUTCDay()] ?? 'Day',
      botsBlocked: 0,
      seoAllowed: 0,
    });
  }
  for (const log of rawLogs) {
    const key = log.timestamp.toISOString().slice(0, 10);
    const entry = dailyMap.get(key);
    if (entry) {
      entry.botsBlocked += 1;
    }
  }
  const dailyStats = Array.from(dailyMap.values());

  const apiKeyItems = (user?.apiKeys ?? []).map((k) => ({
    id: k.id,
    key: k.key,
    name: k.name,
    isActive: k.isActive,
    requestsThisMonth: k.requestsThisMonth,
    createdAt: k.createdAt.toISOString().slice(0, 10),
  }));

  const initialEvents: BotEventItem[] = rawLogs.map((log) => ({
    id: log.id,
    botName: log.botName,
    category:
      log.actionTaken === 'BLOCKED'
        ? 'Blocked Automated Agent'
        : 'AI Crawler Intercepted',
    url: log.path,
    status: log.actionTaken === 'BLOCKED' ? '200 HONEYPOT TRAP' : '200 POISONED',
    bandwidth: `${(Number(log.bandwidthSavedBytes) / 1024).toFixed(1)} KB`,
    timestamp: log.timestamp.toISOString().slice(11, 19) + ' UTC',
    badgeColor:
      log.actionTaken === 'BLOCKED'
        ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
        : 'text-[#10B981] bg-emerald-500/10 border-emerald-500/20',
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100">
      <DashboardHeader
        plan={planLabel}
        requestsUsed={requestsUsed}
        requestsMax={requestsMax}
        userEmail={user?.email}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <OnboardingWizard apiKey={primaryKey} />

        <ApiKeysManager initialKeys={apiKeyItems} />

        <AnalyticsOverview
          requestsUsed={requestsUsed}
          requestsMax={requestsMax}
          planName={planLabel}
          totalBotsBlocked={totalBotsBlocked}
          bandwidthSavedBytes={bandwidthSavedBytes}
          dailyStats={dailyStats}
        />

        <BotActivityFeed initialEvents={initialEvents} apiKey={primaryKey} />
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-zinc-600 font-mono">
        AI-Shield Control Plane • Sub-2ms Lookup Engine Active
      </footer>
    </div>
  );
}
