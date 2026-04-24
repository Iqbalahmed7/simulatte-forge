import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

const FORGE_API_KEY  = process.env.FORGE_API_KEY  ?? '';
const ADMIN_SECRET   = process.env.ADMIN_SECRET   ?? '';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID ?? 'demo';

/**
 * Login for Forge dashboard.
 * POST { apiKey, tenantId }           → tenant session
 * POST { apiKey, adminSecret }        → admin session (isAdmin: true)
 */
export async function POST(req: NextRequest) {
  const { apiKey, tenantId, adminSecret } = await req.json();

  if (!apiKey || apiKey !== FORGE_API_KEY) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // Admin login: correct apiKey + adminSecret → isAdmin session
  const isAdmin = !!(ADMIN_SECRET && adminSecret && adminSecret === ADMIN_SECRET);

  const token = await createSession({
    sub: isAdmin ? 'admin' : (tenantId ?? DEMO_TENANT_ID),
    tenantId: isAdmin ? 'admin' : (tenantId ?? DEMO_TENANT_ID),
    isAdmin,
  });

  const res = NextResponse.json({ ok: true, isAdmin });
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
