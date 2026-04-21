import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

const FORGE_API_KEY = process.env.FORGE_API_KEY ?? '';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID ?? 'demo';

/**
 * Simple API-key based login for Forge dashboard.
 * POST { apiKey, tenantId } → sets forge_session cookie
 *
 * For SSO with White Rabbit in the future, swap this for a token handoff.
 */
export async function POST(req: NextRequest) {
  const { apiKey, tenantId } = await req.json();

  if (!apiKey || apiKey !== FORGE_API_KEY) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const token = await createSession({
    sub: tenantId ?? DEMO_TENANT_ID,
    tenantId: tenantId ?? DEMO_TENANT_ID,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set('forge_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('forge_session');
  return res;
}
