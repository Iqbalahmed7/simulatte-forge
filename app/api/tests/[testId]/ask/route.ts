import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { forgeApi, ForgeAPIError } from '@/lib/forge-api';

export async function POST(req: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { testId } = await params;
  const body = await req.json();
  try {
    return NextResponse.json(await forgeApi.askPersona(testId, body));
  } catch (e) {
    if (e instanceof ForgeAPIError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
