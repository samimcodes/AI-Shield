import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    const type = event.type;
    const data = event.data;

    console.log(`[polar:webhook] Received event: ${type}`);

    // Handle order.created or subscription.created / subscription.updated
    if (type === 'subscription.created' || type === 'subscription.updated' || type === 'order.created') {
      const email = data.customer?.email || data.customer_email;
      const metadata = data.metadata || {};
      const plan = metadata.plan === 'BUSINESS' ? 'BUSINESS' : 'PRO';

      if (metadata.userId) {
        await prisma.user.updateMany({
          where: { id: String(metadata.userId) },
          data: {
            plan,
            subscriptionStatus: 'active',
          },
        });
        console.log(`[polar:webhook] User ID ${metadata.userId} upgraded to ${plan}`);
      } else if (email) {
        await prisma.user.updateMany({
          where: { email },
          data: {
            plan,
            subscriptionStatus: 'active',
          },
        });
        console.log(`[polar:webhook] User ${email} upgraded to ${plan}`);
      }
    } else if (type === 'subscription.revoked') {
      const email = data.customer?.email || data.customer_email;
      const metadata = data.metadata || {};
      if (metadata.userId) {
        await prisma.user.updateMany({
          where: { id: String(metadata.userId) },
          data: {
            plan: 'FREE',
            subscriptionStatus: 'cancelled',
          },
        });
      } else if (email) {
        await prisma.user.updateMany({
          where: { email },
          data: {
            plan: 'FREE',
            subscriptionStatus: 'cancelled',
          },
        });
        console.log(`[polar:webhook] User ${email} reverted to FREE`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[polar:webhook] Error processing webhook:', message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
