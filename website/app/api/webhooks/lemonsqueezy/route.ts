import { NextRequest, NextResponse } from 'next/server';
import { verifyLemonSqueezySignature } from '@/lib/lemonsqueezy';
import { prisma } from '@/lib/prisma';
import { Plan } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');

    // 1. Verify HMAC SHA256 Signature
    // If webhook secret is set in env, verify strictly; if not in development, log warning
    const webhookSecret =
      process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ||
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const isValid = verifyLemonSqueezySignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.warn('[lemonsqueezy:webhook] Invalid signature received');
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
      }
    } else {
      console.warn('[lemonsqueezy:webhook] LEMON_SQUEEZY_WEBHOOK_SECRET not set; running in permissive dev mode.');
    }

    const payload = JSON.parse(rawBody);
    const eventName: string = payload.meta?.event_name;
    const customData = payload.meta?.custom_data || {};
    const attributes = payload.data?.attributes || {};

    const userId: string | undefined = customData.userId || customData.user_id;
    const userEmail: string | undefined = attributes.user_email || customData.email;
    const customerId: string = String(attributes.customer_id || '');
    const status: string = attributes.status || 'active';
    const renewsAt: Date | null = attributes.renews_at ? new Date(attributes.renews_at) : null;
    const endsAt: Date | null = attributes.ends_at ? new Date(attributes.ends_at) : null;

    // Determine target plan
    let targetPlan: Plan = 'PRO';
    if (customData.plan === 'BUSINESS' || String(attributes.variant_name || '').toUpperCase().includes('BUSINESS')) {
      targetPlan = 'BUSINESS';
    } else if (customData.plan === 'PRO') {
      targetPlan = 'PRO';
    }

    console.log(`[lemonsqueezy:webhook] Handling event: ${eventName} for user: ${userId || userEmail}`);

    // Find target user criteria
    const userWhere = userId
      ? { id: userId }
      : userEmail
      ? { email: userEmail }
      : null;

    if (!userWhere) {
      console.warn('[lemonsqueezy:webhook] No userId or email found in webhook event; acknowledged without DB update.');
      return NextResponse.json({ received: true, note: 'No user identified' }, { status: 200 });
    }

    // 2. Handle specific subscription events
    switch (eventName) {
      case 'subscription_created': {
        // Immediate plan upgrade upon payment
        await prisma.user.updateMany({
          where: userWhere,
          data: {
            plan: targetPlan,
            subscriptionStatus: status || 'active',
            lemonSqueezyCustomerId: customerId,
            currentPeriodEnd: renewsAt || endsAt,
          },
        });
        console.log(`[lemonsqueezy:webhook] Successfully upgraded user to ${targetPlan}`);
        break;
      }

      case 'subscription_updated': {
        // Handle renewal, plan change, or billing status update
        const isStillActive = status === 'active' || status === 'on_trial';
        await prisma.user.updateMany({
          where: userWhere,
          data: {
            subscriptionStatus: status,
            currentPeriodEnd: renewsAt || endsAt,
            ...(isStillActive && { plan: targetPlan }),
          },
        });
        console.log(`[lemonsqueezy:webhook] Subscription updated: status=${status}`);
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        // Handle cancellation
        const isExpired = eventName === 'subscription_expired' || status === 'expired';
        await prisma.user.updateMany({
          where: userWhere,
          data: {
            subscriptionStatus: status || 'cancelled',
            currentPeriodEnd: endsAt,
            // If already expired, revert to FREE plan
            ...(isExpired && { plan: 'FREE' }),
          },
        });
        console.log(`[lemonsqueezy:webhook] Subscription cancelled/expired: isExpired=${isExpired}`);
        break;
      }

      case 'subscription_resumed': {
        await prisma.user.updateMany({
          where: userWhere,
          data: {
            plan: targetPlan,
            subscriptionStatus: 'active',
            currentPeriodEnd: renewsAt,
          },
        });
        break;
      }

      default:
        console.log(`[lemonsqueezy:webhook] Unhandled event: ${eventName}`);
    }

    return NextResponse.json(
      { received: true, event: eventName, status },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[lemonsqueezy:webhook] Error processing webhook:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}
