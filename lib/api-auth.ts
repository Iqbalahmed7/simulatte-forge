import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SessionPayload } from './auth';

export async function requireSession(
  req: NextRequest
): Promise<SessionPayload | NextResponse> {
  const token = req.cookies.get('forge_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}
