export interface CreatePolarCheckoutParams {
  userId: string;
  email: string;
  plan: 'PRO' | 'BUSINESS';
  redirectUrl?: string;
}

export interface PolarCheckoutResponse {
  checkoutUrl: string;
  isSimulated?: boolean;
}

export const POLAR_PRODUCTS: Record<'PRO' | 'BUSINESS', string> = {
  PRO: process.env.POLAR_PRO_PRODUCT_ID || 'e08f52f2-66f0-49d9-a3a1-c2fd9e5883f1',
  BUSINESS: process.env.POLAR_BUSINESS_PRODUCT_ID || '2c424374-a4dd-4fb0-8fd7-e5b48401701d',
};

/**
 * Creates a dynamic Polar.sh checkout session for subscriptions.
 */
export async function createPolarCheckout({
  userId,
  email,
  plan,
  redirectUrl,
}: CreatePolarCheckoutParams): Promise<PolarCheckoutResponse> {
  const token = process.env.POLAR_ACCESS_TOKEN;
  const isSandbox = process.env.POLAR_ENV !== 'production';
  const baseUrl = isSandbox ? 'https://sandbox-api.polar.sh' : 'https://api.polar.sh';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const returnUrl =
    redirectUrl ||
    `${appUrl}/dashboard/settings?checkout=success&plan=${plan}&checkout_id={CHECKOUT_ID}`;
  const productId = POLAR_PRODUCTS[plan];

  if (!token || !productId) {
    return {
      checkoutUrl: `${returnUrl}&simulated=true`,
      isSimulated: true,
    };
  }

  const isDummyEmail = !email || email.includes('example.com') || email.includes('getaishield.dev') || email.includes('test.com') || !email.includes('@');
  const requestBody: Record<string, unknown> = {
    products: [productId],
    success_url: returnUrl,
    metadata: {
      userId,
      plan,
    },
  };

  if (!isDummyEmail) {
    requestBody.customer_email = email;
  }

  try {
    const res = await fetch(`${baseUrl}/v1/checkouts/custom/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    if (!res.ok || !data.url) {
      console.error('[polar] Checkout session failed:', data);
      throw new Error(data.detail?.[0]?.msg || data.error || 'Failed to initialize Polar checkout session');
    }

    return {
      checkoutUrl: data.url,
      isSimulated: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout error';
    console.error('[polar] Error creating checkout:', message);
    throw err;
  }
}

/**
 * Resolves the official Polar Customer Portal URL for the organization.
 */
export function getPolarPortalUrl(): string {
  const isSandbox = process.env.POLAR_ENV !== 'production';
  const orgSlug = process.env.POLAR_ORGANIZATION_SLUG || 'ai-shield';
  const domain = isSandbox ? 'sandbox.polar.sh' : 'polar.sh';
  return `https://${domain}/${orgSlug}/portal`;
}
