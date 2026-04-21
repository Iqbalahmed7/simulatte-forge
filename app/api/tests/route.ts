import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { forgeApi, ForgeAPIError } from '@/lib/forge-api';

export async function GET(req: NextRequest) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  try {
    const data = await forgeApi.listTests(session.tenantId);
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof ForgeAPIError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  if (!body.name || !body.concept_card) {
    return NextResponse.json({ error: 'Missing required fields: name, concept_card' }, { status: 400 });
  }

  try {
    const data = await forgeApi.createTest({ ...body, tenant_id: session.tenantId }) as any;
    await forgeApi.runTest(data.test.id).catch(() => {});
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    if (e instanceof ForgeAPIError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
