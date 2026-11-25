import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateLiveApiKey, PLAN_CONFIGS, PlanType } from '@/lib/api-key';
import { getSession } from '@/lib/auth';

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
    const session = await getSession(req);
    const body = await req.json().catch(() => ({}));
    const email = (body.email as string | undefined) || session?.email;
    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'Default API Key';
    const plan = body.plan as PlanType | undefined;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        ...(plan && !session ? { plan } : {}),
      },
      create: {
        email,
        name: body.userName ?? null,
        plan: plan ?? 'FREE',
      },
    });

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
        requestsThisMonth: apiKey.requestsThisMonth,
        createdAt: apiKey.createdAt,
      },
      plan: user.plan,
      limits: PLAN_CONFIGS[user.plan as PlanType] ?? PLAN_CONFIGS.FREE,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create API key';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/keys?id=<keyId>
 * Revoke/delete an API key belonging to the authenticated user.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keyId = req.nextUrl.searchParams.get('id');
    if (!keyId) {
      return NextResponse.json({ error: 'Key id is required' }, { status: 400 });
    }

    const keyRecord = await prisma.apiKey.findFirst({
      where: { id: keyId, userId: session.userId },
    });

    if (!keyRecord) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    const totalKeys = await prisma.apiKey.count({ where: { userId: session.userId } });
    if (totalKeys <= 1) {
      return NextResponse.json(
        { error: 'You must keep at least one active API key.' },
        { status: 400 }
      );
    }

    await prisma.apiKey.delete({ where: { id: keyRecord.id } });
    return NextResponse.json({ deleted: true, id: keyRecord.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete API key';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
