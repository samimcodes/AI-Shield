import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PLAN_CONFIGS, PlanType, isValidApiKeyFormat } from '@/lib/api-key';

/**
 * Common handler to validate API Key and return plan limits.
 */
async function validateApiKey(req: NextRequest, isPost = false) {
  let bodyData: {
    apiKey?: string;
    botName?: string;
    path?: string;
    actionTaken?: 'BLOCKED' | 'POISONED';
    bandwidthSavedBytes?: number;
  } = {};

  if (isPost) {
    try {
      bodyData = await req.json();
    } catch {
      // Body may be empty or non-JSON; continue
    }
  }

  const apiKey =
    req.headers.get('x-api-key') ||
    req.nextUrl.searchParams.get('apiKey') ||
    bodyData.apiKey;

  if (!apiKey) {
    return NextResponse.json(
      {
        valid: false,
        error: 'Missing x-api-key header',
        fallback: true,
        plan: 'FREE',
      },
      { status: 401 }
    );
  }

  if (!isValidApiKeyFormat(apiKey)) {
    return NextResponse.json(
      {
        valid: false,
        error: "Invalid API key format. Live keys must be prefixed with 'as_live_'",
        fallback: true,
        plan: 'FREE',
      },
      { status: 401 }
    );
  }

  try {
    // 1. Fast database lookup
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            plan: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    if (!keyRecord || !keyRecord.isActive) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid or inactive API key',
          fallback: true,
          plan: 'FREE',
        },
        { status: 401 }
      );
    }

    // Automatic 30-day monthly quota reset check
    const now = new Date();
    const quotaResetAt = keyRecord.quotaResetAt ? new Date(keyRecord.quotaResetAt) : new Date(keyRecord.createdAt);
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const isCycleElapsed = now.getTime() - quotaResetAt.getTime() >= thirtyDaysMs;

    let currentRequestsThisMonth = keyRecord.requestsThisMonth;

    if (isCycleElapsed) {
      // Auto-reset monthly counter to 0 without manual intervention
      currentRequestsThisMonth = 0;
      void prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: {
          requestsThisMonth: 0,
          quotaResetAt: now,
        },
      }).catch((err) => {
        console.error('[ai-shield:validate] Error resetting monthly quota:', err);
      });
    }

    const userPlan: PlanType = (keyRecord.user.plan as PlanType) || 'FREE';
    const planConfig = PLAN_CONFIGS[userPlan] || PLAN_CONFIGS.FREE;

    const limitExceeded = currentRequestsThisMonth >= planConfig.maxMonthlyRequests;
    const remainingRequests = Math.max(0, planConfig.maxMonthlyRequests - currentRequestsThisMonth);

    // If quota exceeded, gracefully degrade to FREE tier protections
    const activeTier = limitExceeded ? PLAN_CONFIGS.FREE : planConfig;

    // 2. Asynchronous logging & usage increment (fire-and-forget, zero response latency)
    void (async () => {
      try {
        const operations: any[] = [
          prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { requestsThisMonth: { increment: 1 } },
          }),
        ];

        if (bodyData.botName && bodyData.path) {
          operations.push(
            prisma.botLog.create({
              data: {
                apiKeyId: keyRecord.id,
                botName: String(bodyData.botName),
                path: String(bodyData.path),
                actionTaken: bodyData.actionTaken === 'BLOCKED' ? 'BLOCKED' : 'POISONED',
                bandwidthSavedBytes: BigInt(bodyData.bandwidthSavedBytes ?? 0),
              },
            })
          );
        }

        await prisma.$transaction(operations);
      } catch (logErr) {
        console.error('[ai-shield:validate] Non-blocking database update error:', logErr);
      }
    })();

    return NextResponse.json(
      {
        valid: true,
        plan: activeTier.name,
        originalPlan: planConfig.name,
        allowedBots: activeTier.allowedBots,
        dynamicPoisoning: activeTier.dynamicPoisoning,
        advancedBots: activeTier.advancedBots,
        limitExceeded,
        requestsThisMonth: keyRecord.requestsThisMonth,
        monthlyLimit: planConfig.maxMonthlyRequests,
        remainingRequests,
        tier: {
          name: planConfig.name,
          dynamicPoisoning: activeTier.dynamicPoisoning,
          advancedBots: activeTier.advancedBots,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (dbErr: any) {
    // If DB is offline or table uninitialized, provide seamless fallback for as_live_ keys
    console.warn('[ai-shield:validate] Database unavailable, returning fallback plan:', dbErr.message);

    const isProHint = apiKey.includes('pro');
    const fallbackTier = isProHint ? PLAN_CONFIGS.PRO : PLAN_CONFIGS.FREE;

    return NextResponse.json(
      {
        valid: true,
        plan: fallbackTier.name,
        originalPlan: fallbackTier.name,
        allowedBots: fallbackTier.allowedBots,
        dynamicPoisoning: fallbackTier.dynamicPoisoning,
        advancedBots: fallbackTier.advancedBots,
        limitExceeded: false,
        requestsThisMonth: 0,
        monthlyLimit: fallbackTier.maxMonthlyRequests,
        remainingRequests: fallbackTier.maxMonthlyRequests,
        fallback: true,
      },
      {
        status: 200,
        headers: {
          'X-AI-Shield-Fallback': 'true',
        },
      }
    );
  }
}

/**
 * GET /api/v1/validate
 * Fast key validation endpoint used by middleware cache-misses.
 */
export async function GET(req: NextRequest) {
  return validateApiKey(req, false);
}

/**
 * POST /api/v1/validate
 * Validates key and asynchronously records bot defense events.
 */
export async function POST(req: NextRequest) {
  return validateApiKey(req, true);
}
