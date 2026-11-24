import React from 'react';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OnboardingWizard from '@/components/dashboard/OnboardingWizard';
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

        <AnalyticsOverview
          requestsUsed={requestsUsed}
          requestsMax={requestsMax}
          planName={planLabel}
          totalBotsBlocked={totalBotsBlocked}
          bandwidthSavedBytes={bandwidthSavedBytes}
        />

        <BotActivityFeed initialEvents={initialEvents} apiKey={primaryKey} />
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-zinc-600 font-mono">
        AI-Shield Control Plane • Sub-2ms Lookup Engine Active
      </footer>
    </div>
  );
}
