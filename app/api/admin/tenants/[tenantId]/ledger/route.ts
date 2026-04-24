import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { forgeApi } from '@/lib/forge-api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ tenantId: string }> }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { tenantId } = await params;
  try {
    const data = await forgeApi.adminGetLedger(tenantId);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
