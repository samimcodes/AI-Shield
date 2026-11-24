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
  PRO: process.env.POLAR_PRO_PRODUCT_ID || '354a73cb-cf0e-4e6f-b550-63a4a0d46d33',
  BUSINESS: process.env.POLAR_BUSINESS_PRODUCT_ID || '88ac5769-d040-4bcc-b720-3ba6b8e26594',
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
  const returnUrl = redirectUrl || `${appUrl}/dashboard/settings?checkout=success&plan=${plan}`;
  const productId = POLAR_PRODUCTS[plan];

  if (!token || !productId) {
    return {
      checkoutUrl: `${returnUrl}&simulated=true`,
      isSimulated: true,
    };
  }

  const isDummyEmail = !email || email.includes('example.com') || email.includes('getaishield.dev') || email.includes('test.com') || !email.includes('@');
  const requestBody: any = {
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
  } catch (err: any) {
    console.error('[polar] Error creating checkout:', err.message);
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
