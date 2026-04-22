import { getSession } from '@/lib/auth';
import { forgeApi } from '@/lib/forge-api';
import Link from 'next/link';
import NewTestButton from '@/components/NewTestButton';

const EYEBROW: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.18em', textTransform: 'uppercase' as const,
  color: 'var(--static)',
};

function StatusTag({ status }: { status: string }) {
  const isComplete = status === 'complete';
  const isRunning = status === 'running';
  return (
    <span style={{
      fontFamily: "'Martian Mono', monospace",
      fontSize: '10px', fontWeight: 500,
      letterSpacing: '0.04em',
      color: isComplete ? 'var(--signal)' : 'var(--static)',
      border: `1px solid ${isComplete ? 'var(--green-bd)' : 'var(--border)'}`,
      background: isComplete ? 'var(--green-tint)' : 'transparent',
      padding: '2px 8px',
    }}>
      {isRunning ? '● ' : ''}{status}
    </span>
  );
}

export default async function TestsPage() {
  const session = await getSession();
  let tests: any[] = [];
  try {
    const data = await forgeApi.listTests(session!.tenantId) as any;
    tests = data.tests ?? [];
  } catch { tests = []; }

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <p style={{ ...EYEBROW, marginBottom: '10px' }}>Concept Testing</p>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800,
            color: 'var(--parchment)', lineHeight: 0.96, letterSpacing: '0.01em',
          }}>
            Simulate <span style={{ color: 'var(--signal)' }}>reality.</span>
          </h1>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '15px', color: 'rgba(233,230,223,0.72)', marginTop: '10px' }}>
            Test how real consumers respond before you launch.
          </p>
        </div>
        <NewTestButton />
      </div>

      {tests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px solid var(--border)' }}>
          <p style={{ ...EYEBROW, marginBottom: '16px' }}>No tests yet</p>
          <h3 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '28px', fontWeight: 800, color: 'var(--parchment)',
            marginBottom: '8px',
          }}>
            Run your first test
          </h3>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '15px', color: 'var(--static)', marginBottom: '28px' }}>
            Create a concept and see how consumers respond.
          </p>
          <NewTestButton />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', background: 'var(--border)' }}>
          {tests.map((test: any) => (
            <Link
              key={test.id}
              href={`/tests/${test.id}`}
              style={{ display: 'block', background: 'var(--void)', padding: '24px', textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--layer)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--void)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <StatusTag status={test.status} />
                <span style={{
                  fontFamily: "'Martian Mono', monospace",
                  fontSize: '10px', color: 'var(--static)',
                }}>
                  {new Date(test.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <h3 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '20px', fontWeight: 700,
                color: 'var(--parchment)', marginBottom: '4px',
                lineHeight: 1.2,
              }}>{test.name}</h3>

              {test.concept_card?.category && (
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'var(--static)' }}>
                  {test.concept_card.category}
                </p>
              )}

              {test.scorecard && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '24px' }}>
                  {[
                    { label: 'Intent', val: test.scorecard.purchase_intent_score },
                    { label: 'Distinct', val: test.scorecard.distinctiveness_score },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <div style={{
                        fontFamily: "'Martian Mono', monospace",
                        fontSize: '18px', fontWeight: 500,
                        color: 'var(--parchment)',
                      }}>{val != null ? val.toFixed(1) : '—'}<span style={{ fontSize: '11px', color: 'var(--static)' }}>/10</span></div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'var(--static)', marginTop: '2px' }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
