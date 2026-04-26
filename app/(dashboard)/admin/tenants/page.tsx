import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { forgeApi } from '@/lib/forge-api';

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
  pilot: '#A8FF3E',
  pro: '#4EA8FF',
  enterprise: '#FFB84E',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--signal)',
  suspended: '#FF6B6B',
  churned: 'var(--static)',
};

export default async function TenantsPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect('/tests');

  let tenants: any[] = [];
  try {
    const data = await forgeApi.adminListTenants() as any;
    tenants = data.tenants ?? data ?? [];
  } catch { /* ok */ }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ ...EYEBROW, marginBottom: '8px' }}>
            <Link href="/admin" style={{ color: 'var(--static)', textDecoration: 'none' }}>Admin</Link>
            {' / '}Tenants
          </p>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(28px,3vw,40px)', fontWeight: 800,
            color: 'var(--parchment)', lineHeight: 0.96,
          }}>
            All <span style={{ color: 'var(--signal)' }}>Partners.</span>
          </h1>
        </div>
        <Link href="/admin/tenants/new" style={{
          display: 'inline-block', padding: '10px 24px',
          fontFamily: "'Barlow', sans-serif", fontSize: '13px', fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--void)', background: 'var(--signal)',
          border: '1px solid var(--signal)', textDecoration: 'none',
        }}>
          + Onboard Partner
        </Link>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid var(--border)', background: 'var(--layer)' }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 100px 90px 100px 100px 100px 80px',
          padding: '10px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          {['Partner', 'Tier', 'Status', 'Balance', 'Granted', 'Used', ''].map(h => (
            <span key={h} style={{ ...EYEBROW }}>{h}</span>
          ))}
        </div>

        <style>{`.admin-tenant-row:hover { background: rgba(255,255,255,0.02); }`}</style>
        {tenants.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Barlow', sans-serif", color: 'var(--static)', fontSize: '14px' }}>
              No tenants yet. Onboard your first design partner.
            </p>
          </div>
        ) : tenants.map((t: any) => (
          <div key={t.id} className="admin-tenant-row" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 90px 100px 100px 100px 80px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            alignItems: 'center',
          }}
          >
            <div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: 'var(--parchment)', marginBottom: '2px' }}>
                {t.name}
              </p>
              <p style={{ ...MONO, fontSize: '11px', color: 'var(--static)' }}>{t.id}</p>
            </div>
            <span style={{
              fontFamily: "'Barlow', sans-serif", fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: TIER_COLORS[t.tier] ?? 'var(--static)',
            }}>{t.tier}</span>
            <span style={{
              fontFamily: "'Barlow', sans-serif", fontSize: '12px', fontWeight: 600,
              color: STATUS_COLORS[t.status] ?? 'var(--static)',
            }}>{t.status}</span>
            <span style={{ ...MONO }}>{(t.credit_balance ?? 0).toLocaleString()}</span>
            <span style={{ ...MONO, color: 'var(--static)' }}>{(t.lifetime_granted ?? 0).toLocaleString()}</span>
            <span style={{ ...MONO, color: 'var(--static)' }}>{(t.lifetime_used ?? 0).toLocaleString()}</span>
            <Link href={`/admin/tenants/${t.id}`} style={{
              fontFamily: "'Barlow', sans-serif", fontSize: '12px', fontWeight: 600,
              color: 'var(--signal)', textDecoration: 'none',
              letterSpacing: '0.04em',
            }}>
              Manage →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
