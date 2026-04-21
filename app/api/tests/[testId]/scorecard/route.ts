import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { forgeApi, ForgeAPIError } from '@/lib/forge-api';

export async function GET(req: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { testId } = await params;
  try {
    return NextResponse.json(await forgeApi.getScorecard(testId));
  } catch (e) {
    if (e instanceof ForgeAPIError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
