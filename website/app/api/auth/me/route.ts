import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { PLAN_CONFIGS, PlanType } from '@/lib/api-key';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        apiKeys: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            key: true,
            name: true,
            isActive: true,
            requestsThisMonth: true,
            quotaResetAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planKey = (user.plan || 'FREE') as PlanType;
    const tier = PLAN_CONFIGS[planKey] || PLAN_CONFIGS.FREE;

    const apiKeyIds = user.apiKeys.map((k) => k.id);
    const recentLogs =
      apiKeyIds.length > 0
        ? await prisma.botLog.findMany({
            where: { apiKeyId: { in: apiKeyIds } },
            orderBy: { timestamp: 'desc' },
            take: 25,
          })
        : [];

    const totalRequestsUsed = user.apiKeys.reduce(
      (sum, k) => sum + k.requestsThisMonth,
      0
    );

    const totalBandwidthBytes = recentLogs.reduce(
      (sum, log) => sum + Number(log.bandwidthSavedBytes),
      0
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus || 'active',
        currentPeriodEnd: user.currentPeriodEnd,
      },
      quota: {
        requestsUsed: totalRequestsUsed,
        requestsMax: tier.maxMonthlyRequests,
        bandwidthSavedBytes: totalBandwidthBytes,
      },
      apiKeys: user.apiKeys,
      botLogs: recentLogs.map((log) => ({
        id: log.id,
        botName: log.botName,
        path: log.path,
        actionTaken: log.actionTaken,
        bandwidthSavedBytes: Number(log.bandwidthSavedBytes),
        timestamp: log.timestamp.toISOString(),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
