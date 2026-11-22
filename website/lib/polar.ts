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

  try {
    const res = await fetch(`${baseUrl}/v1/checkouts/custom/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: [productId],
        customer_email: email,
        success_url: returnUrl,
        metadata: {
          userId,
          plan,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.url) {
      console.warn('[polar] Checkout session failed, returning direct fallback:', data);
      const checkoutDomain = isSandbox ? 'https://sandbox.polar.sh' : 'https://polar.sh';
      return {
        checkoutUrl: `${checkoutDomain}/checkout/${productId}`,
        isSimulated: false,
      };
    }

    return {
      checkoutUrl: data.url,
      isSimulated: false,
    };
  } catch (err: any) {
    console.error('[polar] Error creating checkout:', err.message);
    const checkoutDomain = isSandbox ? 'https://sandbox.polar.sh' : 'https://polar.sh';
    return {
      checkoutUrl: `${checkoutDomain}/checkout/${productId}`,
      isSimulated: false,
    };
  }
}
