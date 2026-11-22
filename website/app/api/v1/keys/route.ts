import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateLiveApiKey, PLAN_CONFIGS, PlanType } from '@/lib/api-key';

/**
 * GET /api/v1/keys
 * List active API keys for a user (query by ?email= or ?userId=).
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  const userId = req.nextUrl.searchParams.get('userId');

  if (!email && !userId) {
    return NextResponse.json(
      { error: 'Provide either email or userId query parameter' },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: email ? { email } : { id: userId! },
      include: {
        apiKeys: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            key: true,
            name: true,
            isActive: true,
            requestsThisMonth: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
      keys: user.apiKeys,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/v1/keys
 * Create a new API key prefixed with 'as_live_'.
 * Body: { email: string, name?: string, plan?: 'FREE' | 'PRO' | 'BUSINESS' }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name = 'Default API Key', plan = 'FREE' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        ...(plan && { plan: plan as any }),
      },
      create: {
        email,
        name: body.userName ?? null,
        plan: (plan as any) ?? 'FREE',
      },
    });

    // Generate new key
    const newKey = generateLiveApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        key: newKey,
        name,
        userId: user.id,
        isActive: true,
      },
    });

    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        key: apiKey.key,
        name: apiKey.name,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
      },
      plan: user.plan,
      limits: PLAN_CONFIGS[user.plan as PlanType] ?? PLAN_CONFIGS.FREE,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
