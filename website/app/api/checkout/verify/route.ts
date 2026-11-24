import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const checkoutId = typeof body.checkoutId === 'string' ? body.checkoutId : '';
    const requestedPlan = body.plan === 'BUSINESS' ? 'BUSINESS' : 'PRO';

    const token = process.env.POLAR_ACCESS_TOKEN;
    const isSandbox = process.env.POLAR_ENV !== 'production';
    const baseUrl = isSandbox ? 'https://sandbox-api.polar.sh' : 'https://api.polar.sh';

    let verifiedPlan: 'PRO' | 'BUSINESS' | null = null;

    if (token && checkoutId && !checkoutId.includes('{CHECKOUT_ID}')) {
      const res = await fetch(`${baseUrl}/v1/checkouts/custom/${encodeURIComponent(checkoutId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const checkout = await res.json();
        if (checkout.status === 'succeeded' || checkout.status === 'confirmed') {
          verifiedPlan = checkout.metadata?.plan === 'BUSINESS' ? 'BUSINESS' : requestedPlan;
        }
      }
    } else if (isSandbox && body.simulated === 'true') {
      verifiedPlan = requestedPlan;
    }

    if (!verifiedPlan) {
      return NextResponse.json(
        { error: 'Checkout not verified yet', upgraded: false },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        plan: verifiedPlan,
        subscriptionStatus: 'active',
      },
      select: {
        id: true,
        email: true,
        plan: true,
        subscriptionStatus: true,
      },
    });

    return NextResponse.json({
      upgraded: true,
      user: updatedUser,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
