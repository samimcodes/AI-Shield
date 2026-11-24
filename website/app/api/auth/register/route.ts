import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  createSessionToken,
  getSessionCookieOptions,
} from '@/lib/auth';
import { generateLiveApiKey } from '@/lib/api-key';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.passwordHash) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const displayName = name || email.split('@')[0] || 'Developer';

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash, name: existing.name || displayName },
        })
      : await prisma.user.create({
          data: {
            email,
            name: displayName,
            passwordHash,
            plan: 'FREE',
          },
        });

    // Ensure user has at least one live API key
    const existingKeys = await prisma.apiKey.count({ where: { userId: user.id } });
    if (existingKeys === 0) {
      await prisma.apiKey.create({
        data: {
          key: generateLiveApiKey(),
          name: 'Default Production Key',
          userId: user.id,
          isActive: true,
        },
      });
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      ...getSessionCookieOptions(),
      value: token,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
