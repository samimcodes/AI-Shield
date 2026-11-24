import crypto from 'node:crypto';

export interface CreateCheckoutParams {
  userId: string;
  email: string;
  plan: 'PRO' | 'BUSINESS';
  redirectUrl?: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  isSimulated?: boolean;
}

/**
 * Variant IDs for Lemon Squeezy subscription products.
 */
export const LEMON_SQUEEZY_VARIANTS: Record<'PRO' | 'BUSINESS', string> = {
  PRO: process.env.LEMON_SQUEEZY_PRO_VARIANT_ID || process.env.LEMONSQUEEZY_PRO_VARIANT_ID || 'variant_pro_monthly',
  BUSINESS: process.env.LEMON_SQUEEZY_BUSINESS_VARIANT_ID || process.env.LEMONSQUEEZY_BUSINESS_VARIANT_ID || 'variant_biz_monthly',
};

/**
 * Verify Lemon Squeezy Webhook HMAC SHA256 Signature.
 */
export function verifyLemonSqueezySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret?: string
): boolean {
  const webhookSecret =
    secret ||
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ||
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!webhookSecret || !signatureHeader) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signatureHeader, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.error('[lemonsqueezy] Signature verification error:', err);
    return false;
  }
}

/**
 * Create a Lemon Squeezy Checkout Session configured for Overlay / Modal.
 */
export async function createLemonSqueezyCheckout({
  userId,
  email,
  plan,
  redirectUrl,
}: CreateCheckoutParams): Promise<CheckoutResponse> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY || process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID || process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = LEMON_SQUEEZY_VARIANTS[plan];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const returnUrl = redirectUrl || `${appUrl}/dashboard/settings?checkout=success&plan=${plan}`;

  // If Lemon Squeezy credentials are configured, call the live Lemon Squeezy API
  if (apiKey && storeId && variantId && !variantId.startsWith('variant_')) {
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email,
              custom: {
                userId,
                plan,
              },
            },
            checkout_options: {
              embed: true, // Enables Lemon Squeezy Overlay Checkout
              media: false,
              logo: true,
              dark: true,
            },
            product_options: {
              redirect_url: returnUrl,
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId.toString(),
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId.toString(),
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[lemonsqueezy:api] Failed to create checkout session:', errorData);
      throw new Error(`Lemon Squeezy API error: ${response.statusText}`);
    }

    const payload = await response.json();
    const checkoutUrl = payload.data?.attributes?.url;

    if (!checkoutUrl) {
      throw new Error('Lemon Squeezy did not return a checkout URL');
    }

    return { checkoutUrl };
  }

  // Development / Demo Fallback Mode
  // If API credentials are not set up locally, return a simulated overlay checkout URL
  const demoUrl = `${appUrl}/dashboard/settings?checkout=success&plan=${plan}&demo=true`;
  return {
    checkoutUrl: demoUrl,
    isSimulated: true,
  };
}
