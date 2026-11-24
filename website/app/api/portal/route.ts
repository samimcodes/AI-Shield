import { NextResponse } from 'next/server';
import { getPolarPortalUrl } from '@/lib/polar';

export async function GET() {
  const portalUrl = getPolarPortalUrl();
  return NextResponse.redirect(portalUrl);
}
