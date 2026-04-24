import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { forgeApi } from '@/lib/forge-api';
import GrantCreditsForm from './GrantCreditsForm';

const EYEBROW: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.18em', textTransform: 'uppercase' as const,
  color: 'var(--static)',
};

const MONO: React.CSSProperties = {
  fontFamily: "'Martian Mono', monospace",
  fontSize: '12px', fontWeight: 500,
  color: 'var(--parchment)',
};

const TIER_COLORS: Record<string, string> = {
  pilot: '#A8FF3E', pro: '#4EA8FF', enterprise: '#FFB84E',
};

const LEDGER_TYPE_COLOR: Record<string, string> = {
  grant: 'var(--signal)', test_run: '#FF6B6B',
  pool_creation: '#4EA8FF', refund: '#A8FF3E', adjustment: '#FFB84E',
};

export default async function TenantDetailPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const session = await getSession();
  if (!session?.isAdmin) redirect('/tests');

  let tenant: any = null;
  let ledger: any[] = [];

  try {
    tenant = await forgeApi.adminGetTenant(tenantId) as any;
  } catch (e: any) {
    if (e?.status === 404) notFound();
  }
  if (!tenant) notFound();

  try {
    const data = await forgeApi.adminGetLedger(tenantId) as any;
    ledger = data.entries ?? data ?? [];
  } catch { /* ok */ }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ ...EYEBROW, marginBottom: '8px' }}>
          <Link href="/admin" style={{ color: 'var(--static)', textDecoration: 'none' }}>Admin</Link>
          {' / '}
          <Link href="/admin/tenants" style={{ color: 'var(--static)', textDecoration: 'none' }}>Tenants</Link>
          {' / '}{tenant.id}
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(28px,3vw,40px)', fontWeight: 800,
              color: 'var(--parchment)', lineHeight: 0.96, marginBottom: '8px',
            }}>{tenant.name}</h1>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ ...MONO, fontSize: '11px', color: 'var(--static)' }}>{tenant.id}</span>
              <span style={{
                fontFamily: "'Barlow', sans-serif", fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: TIER_COLORS[tenant.tier] ?? 'var(--static)',
              }}>{tenant.tier}</span>
              {tenant.contact_email && (
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'var(--static)' }}>
                  {tenant.contact_email}
                </span>
              )}
            </div>
          </div>
          {/* Credit balance */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ ...EYEBROW, marginBottom: '4px' }}>Credit Balance</p>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '48px', fontWeight: 800, lineHeight: 1,
              color: 'var(--signal)',
            }}>{(tenant.credit_balance ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', marginBottom: '40px' }}>
        {[
          { label: 'Lifetime Granted', value: (tenant.lifetime_granted ?? 0).toLocaleString() },
          { label: 'Lifetime Used', value: (tenant.lifetime_used ?? 0).toLocaleString() },
          { label: 'Status', value: tenant.status },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--layer)', padding: '20px 24px' }}>
            <p style={{ ...EYEBROW, marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '28px', fontWeight: 800, color: 'var(--parchment)', lineHeight: 1 }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Grant credits form */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ ...EYEBROW, marginBottom: '16px', color: 'var(--parchment)' }}>Grant Credits</p>
        <GrantCreditsForm tenantId={tenant.id} />
      </div>

      {/* Ledger */}
      <div>
        <p style={{ ...EYEBROW, marginBottom: '16px', color: 'var(--parchment)' }}>Credit Ledger</p>
        <div style={{ border: '1px solid var(--border)', background: 'var(--layer)' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '160px 90px 80px 90px 1fr',
            padding: '10px 20px', borderBottom: '1px solid var(--border)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            {['Date', 'Type', 'Amount', 'Balance', 'Note'].map(h => (
              <span key={h} style={{ ...EYEBROW }}>{h}</span>
            ))}
          </div>

          {ledger.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Barlow', sans-serif", color: 'var(--static)', fontSize: '13px' }}>No ledger entries yet.</p>
            </div>
          ) : ledger.map((entry: any) => (
            <div key={entry.id} style={{
              display: 'grid', gridTemplateColumns: '160px 90px 80px 90px 1fr',
              padding: '12px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center',
            }}>
              <span style={{ ...MONO, fontSize: '11px', color: 'var(--static)' }}>
                {new Date(entry.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <span style={{
                fontFamily: "'Barlow', sans-serif", fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: LEDGER_TYPE_COLOR[entry.type] ?? 'var(--static)',
              }}>{entry.type}</span>
              <span style={{
                ...MONO,
                color: entry.amount > 0 ? 'var(--signal)' : '#FF6B6B',
              }}>
                {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}
              </span>
              <span style={{ ...MONO }}>{(entry.balance_after ?? 0).toLocaleString()}</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'var(--static)' }}>
                {entry.note ?? '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
