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
  fontSize: '13px', fontWeight: 500,
  color: 'var(--parchment)',
};

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{
      background: 'var(--layer)',
      border: `1px solid ${accent ? 'var(--green-bd)' : 'var(--border)'}`,
      padding: '24px',
    }}>
      <p style={{ ...EYEBROW, marginBottom: '12px' }}>{label}</p>
      <p style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: '42px', fontWeight: 800, lineHeight: 1,
        color: accent ? 'var(--signal)' : 'var(--parchment)',
      }}>{value}</p>
    </div>
  );
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect('/tests');

  let stats: any = {};
  try { stats = await forgeApi.adminStats() as any; } catch { /* ok */ }

  return (
    <div>
      <div style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ ...EYEBROW, marginBottom: '10px' }}>Forge Admin</p>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800,
          color: 'var(--parchment)', lineHeight: 0.96,
        }}>
          Control <span style={{ color: 'var(--signal)' }}>Tower.</span>
        </h1>
        <p style={{
          fontFamily: "'Barlow', sans-serif", fontSize: '15px',
          color: 'rgba(233,230,223,0.72)', marginTop: '10px',
        }}>
          Manage tenants, allocate credits, onboard design partners.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', marginBottom: '40px' }}>
        <StatCard label="Active Tenants"    value={stats.active_tenants ?? 0} accent />
        <StatCard label="Tests Run"         value={stats.total_tests ?? 0} />
        <StatCard label="Running Now"       value={stats.running_tests ?? 0} />
        <StatCard label="Persona Pools"     value={stats.total_pools ?? 0} />
        <StatCard label="Credits Granted"   value={(stats.credits_granted_all_time ?? 0).toLocaleString()} />
        <StatCard label="Credits Consumed"  value={(stats.credits_used_all_time ?? 0).toLocaleString()} />
        <StatCard label="Credits Remaining" value={((stats.credits_granted_all_time ?? 0) - (stats.credits_used_all_time ?? 0)).toLocaleString()} />
        <StatCard label="Total Tenants"     value={stats.total_tenants ?? 0} />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link href="/admin/tenants" style={{
          display: 'inline-block', padding: '10px 24px',
          fontFamily: "'Barlow', sans-serif", fontSize: '13px', fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--void)', background: 'var(--signal)',
          border: '1px solid var(--signal)', textDecoration: 'none',
        }}>
          View All Tenants
        </Link>
        <Link href="/admin/tenants/new" style={{
          display: 'inline-block', padding: '10px 24px',
          fontFamily: "'Barlow', sans-serif", fontSize: '13px', fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--parchment)', background: 'transparent',
          border: '1px solid var(--border)', textDecoration: 'none',
        }}>
          + Onboard Partner
        </Link>
      </div>
    </div>
  );
}
