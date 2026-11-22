import { NextRequest, NextResponse } from 'next/server';
import { createLemonSqueezyCheckout } from '@/lib/lemonsqueezy';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { plan, userId, email } = body;

    if (!plan || (plan !== 'PRO' && plan !== 'BUSINESS')) {
      return NextResponse.json(
        { error: 'Invalid plan. Allowed values: PRO or BUSINESS' },
        { status: 400 }
      );
    }

    // Resolve or fallback user credentials
    let resolvedEmail = email || 'customer@example.com';
    let resolvedUserId = userId || 'user_demo_123';

    // If userId or email provided, attempt to lookup or upsert in database
    try {
      if (email) {
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            plan: 'FREE',
          },
        });
        resolvedUserId = user.id;
        resolvedEmail = user.email;
      }
    } catch {
      // In offline/mock mode, continue with provided parameters
    }

    const { checkoutUrl, isSimulated } = await createLemonSqueezyCheckout({
      userId: resolvedUserId,
      email: resolvedEmail,
      plan,
    });

    return NextResponse.json({
      checkoutUrl,
      isSimulated: !!isSimulated,
      plan,
    });
  } catch (err: any) {
    console.error('[api/checkout] Error generating checkout session:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
