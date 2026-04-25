import { getSession } from '@/lib/auth';
import { forgeApi } from '@/lib/forge-api';
import NewPoolButton from '@/components/NewPoolButton';

const EYEBROW: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.18em', textTransform: 'uppercase' as const,
  color: 'var(--static)',
};

export default async function PoolsPage() {
  const session = await getSession();
  let pools: any[] = [];
  try {
    const data = await forgeApi.listPools(session!.tenantId) as any;
    pools = data.pools ?? [];
  } catch { pools = []; }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <p style={{ ...EYEBROW, marginBottom: '10px' }}>Persona Pools</p>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800,
            color: 'var(--parchment)', lineHeight: 0.96, letterSpacing: '0.01em',
          }}>
            Who <span style={{ color: 'var(--signal)' }}>responds.</span>
          </h1>
          <p style={{
            fontFamily: "'Barlow', sans-serif", fontSize: '15px',
            color: 'rgba(233,230,223,0.72)', marginTop: '10px', maxWidth: '480px',
          }}>
            Cohorts created in Iris or here are shared across the suite.
            Attach a pool to any test to run simulations against the same people every time.
          </p>
        </div>
        <NewPoolButton />
      </div>

      {/* Iris integration callout */}
      <div style={{
        background: 'var(--green-tint)', border: '1px solid var(--green-bd)',
        padding: '16px 20px', marginBottom: '32px',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
          <circle cx="8" cy="8" r="7" stroke="#A8FF3E" strokeWidth="1" opacity="0.8" />
          <circle cx="8" cy="8" r="4" stroke="#A8FF3E" strokeWidth="1" opacity="0.5" />
          <circle cx="8" cy="8" r="1.5" fill="#A8FF3E" />
        </svg>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.88)' }}>
          <strong style={{ color: 'var(--signal)', fontWeight: 600 }}>Iris cohorts sync here.</strong>{' '}
          Any cohort your Iris team exports will appear below automatically — no re-import needed.
          Test the same population across both products for directly comparable results.
        </p>
      </div>

      {pools.length === 0 ? (
        <div style={{
          border: '1px solid var(--border)', padding: '64px 24px',
          textAlign: 'center',
        }}>
          <p style={{ ...EYEBROW, marginBottom: '16px' }}>No pools yet</p>
          <h3 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '28px', fontWeight: 800,
            color: 'var(--parchment)', marginBottom: '8px',
          }}>Create your first cohort</h3>
          <p style={{
            fontFamily: "'Barlow', sans-serif", fontSize: '15px',
            color: 'var(--static)', marginBottom: '28px', maxWidth: '360px', margin: '0 auto 28px',
          }}>
            Define a pool of synthetic personas once, reuse them across every test.
          </p>
          <NewPoolButton />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
          {/* Header row */}
          <div style={{
            background: 'var(--layer)', padding: '10px 20px',
            display: 'grid', gridTemplateColumns: '1fr 120px 80px 100px 120px',
            gap: '16px',
          }}>
            {['Pool Name', 'Category', 'Market', 'Personas', 'Created'].map(h => (
              <span key={h} style={{ ...EYEBROW, fontSize: '10px' }}>{h}</span>
            ))}
          </div>
          <style>{`.pool-row:hover { background: var(--layer) !important; }`}</style>
          {pools.map((pool: any) => (
            <div key={pool.id} className="pool-row" style={{
              background: 'var(--void)', padding: '16px 20px',
              display: 'grid', gridTemplateColumns: '1fr 120px 80px 100px 120px',
              gap: '16px', alignItems: 'center',
              transition: 'background 0.15s',
            }}>
              <div>
                <p style={{
                  fontFamily: "'Barlow', sans-serif", fontSize: '14px',
                  fontWeight: 600, color: 'var(--parchment)', marginBottom: '2px',
                }}>{pool.name}</p>
                {pool.id && (
                  <p style={{
                    fontFamily: "'Martian Mono', monospace", fontSize: '10px',
                    color: 'var(--static)',
                  }}>{pool.id.slice(0, 16)}…</p>
                )}
              </div>
              <span style={{
                fontFamily: "'Barlow', sans-serif", fontSize: '13px',
                color: 'rgba(233,230,223,0.72)',
              }}>{pool.category ?? '—'}</span>
              <span style={{
                fontFamily: "'Martian Mono', monospace", fontSize: '11px',
                color: 'var(--static)',
              }}>{pool.market ?? '—'}</span>
              <span style={{
                fontFamily: "'Martian Mono', monospace", fontSize: '13px',
                fontWeight: 500, color: 'var(--parchment)',
              }}>{pool.persona_count ?? pool.size ?? '—'}</span>
              <span style={{
                fontFamily: "'Martian Mono', monospace", fontSize: '10px',
                color: 'var(--static)',
              }}>
                {pool.created_at ? new Date(pool.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
