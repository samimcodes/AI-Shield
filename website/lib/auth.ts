import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'ai_shield_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.POLAR_ACCESS_TOKEN ||
    'ai-shield-fallback-session-secret-key-2026'
  );
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string | null;
  exp: number;
}

/**
 * Hash a plaintext password with a random 16-byte salt using scrypt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

/**
 * Verify a plaintext password against a stored `salt:hash` string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;

  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (derived.length !== expected.length) return false;

  return crypto.timingSafeEqual(derived, expected);
}

/**
 * Sign a session payload into a compact HMAC-SHA256 token.
 */
export function createSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getAuthSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

/**
 * Verify and decode an HMAC-SHA256 session token.
 */
export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, providedSig] = parts;
  if (!encoded || !providedSig) return null;

  const expectedSig = crypto
    .createHmac('sha256', getAuthSecret())
    .update(encoded)
    .digest('base64url');

  const bufA = Buffer.from(providedSig);
  const bufB = Buffer.from(expectedSig);
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed.userId || !parsed.email || typeof parsed.exp !== 'number') return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Read the authenticated session from NextRequest or Next.js Server Component cookies().
 */
export async function getSession(req?: NextRequest): Promise<SessionPayload | null> {
  if (req) {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    return verifySessionToken(token);
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
