import { getSession } from '@/lib/auth';
import { forgeApi } from '@/lib/forge-api';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const EYEBROW: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.18em', textTransform: 'uppercase' as const,
  color: 'var(--static)',
};

const DIMS = [
  { label: 'Concept Score', key: 'concept_score', hero: true },
  { label: 'Intent',        key: 'intent_score' },
  { label: 'Appeal',        key: 'appeal_score' },
  { label: 'Relevance',     key: 'relevance_score' },
  { label: 'Credibility',   key: 'credibility_score' },
  { label: 'Distinctiveness', key: 'distinctiveness_score' },
  { label: 'Value',         key: 'value_score' },
  { label: 'Clarity',       key: 'clarity_score' },
];

function fmt(v: number | null | undefined) {
  return v != null ? Number(v).toFixed(1) : '—';
}

function delta(a: number | null | undefined, b: number | null | undefined): string {
  if (a == null || b == null) return '';
  const d = Number(a) - Number(b);
  if (Math.abs(d) < 0.05) return '';
  return (d > 0 ? '+' : '') + d.toFixed(1);
}

function MemoryBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span style={{
      fontFamily: "'Martian Mono', monospace",
      fontSize: '9px', fontWeight: 500,
      letterSpacing: '0.06em',
      color: 'var(--signal)',
      border: '1px solid var(--green-bd)',
      background: 'var(--green-tint)',
      padding: '2px 8px',
      display: 'inline-block',
    }}>
      MEM·{count}
    </span>
  );
}

function GatesBadge({ gatesPassed }: { gatesPassed: string | null | undefined }) {
  if (!gatesPassed) return null;
  const allPassed = gatesPassed === '4/4';
  return (
    <span style={{
      fontFamily: "'Martian Mono', monospace",
      fontSize: '9px', fontWeight: 500,
      letterSpacing: '0.06em',
      color: allPassed ? 'var(--signal)' : 'var(--static)',
      border: `1px solid ${allPassed ? 'var(--green-bd)' : 'var(--border)'}`,
      background: allPassed ? 'var(--green-tint)' : 'transparent',
      padding: '2px 8px',
      display: 'inline-block',
    }}>
      QG·{gatesPassed}
    </span>
  );
}

function ScoreRow({
  label, parent, variants, hero = false,
}: {
  label: string;
  parent: number | null | undefined;
  variants: (number | null | undefined)[];
  hero?: boolean;
}) {
  const pSize = hero ? '28px' : '18px';
  const color = (v: number | null | undefined) => {
    if (v == null) return 'var(--static)';
    return v >= 7 ? 'var(--signal)' : v >= 5 ? 'var(--parchment)' : 'var(--static)';
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `180px repeat(${variants.length + 1}, 1fr)`,
      gap: '1px',
      background: 'var(--border)',
      borderBottom: hero ? '1px solid var(--border)' : undefined,
    }}>
      <div style={{ background: 'var(--layer)', padding: hero ? '16px 12px' : '12px', display: 'flex', alignItems: 'center' }}>
        <span style={{ ...EYEBROW, color: hero ? 'var(--parchment)' : 'var(--static)' }}>{label}</span>
      </div>
      {/* Parent */}
      <div style={{ background: 'var(--surface)', padding: hero ? '16px 12px' : '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontFamily: "'Martian Mono', monospace",
          fontSize: pSize, fontWeight: 500,
          color: color(parent),
        }}>{fmt(parent)}</span>
      </div>
      {/* Variants */}
      {variants.map((v, i) => {
        const d = delta(v, parent);
        const dColor = d.startsWith('+') ? 'var(--signal)' : d ? 'var(--static)' : undefined;
        return (
          <div key={i} style={{ background: 'var(--layer)', padding: hero ? '16px 12px' : '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: "'Martian Mono', monospace",
              fontSize: pSize, fontWeight: 500,
              color: color(v),
            }}>{fmt(v)}</span>
            {d && (
              <span style={{
                fontFamily: "'Martian Mono', monospace",
                fontSize: '10px', fontWeight: 500,
                color: dColor,
              }}>{d}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function ComparePage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch parent test
  let parentTest: any = null;
  let parentScorecard: any = null;
  try { const t = await forgeApi.getTest(testId) as any; parentTest = t?.test ?? t; } catch {}
  try { const s = await forgeApi.getScorecard(testId) as any; parentScorecard = s?.scorecard ?? s; } catch {}

  if (!parentTest) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '80px' }}>
        <p style={{ color: 'var(--static)' }}>Test not found.</p>
        <Link href="/tests" style={{ color: 'var(--signal)', fontFamily: "'Barlow', sans-serif", fontSize: '14px', textDecoration: 'none' }}>← Tests</Link>
      </div>
    );
  }

  const wsId: string = parentTest.workspace_id ?? '';

  // Fetch variants
  let variantTests: any[] = [];
  try {
    const vr = await forgeApi.listVariants(testId, wsId) as any;
    variantTests = vr?.tests ?? [];
  } catch {}

  // Fetch scorecards for each variant (parallel)
  const variantScorecards: (any | null)[] = await Promise.all(
    variantTests.map(async (v: any) => {
      try {
        const s = await forgeApi.getScorecard(v.id) as any;
        return s?.scorecard ?? s;
      } catch {
        return null;
      }
    })
  );

  const cc = parentTest.concept_card ?? {};

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href={`/tests/${testId}`}
        style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'var(--static)', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}
      >
        ← {parentTest.name ?? 'Test'}
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ ...EYEBROW, marginBottom: '8px' }}>Variant Comparison</p>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 800,
          color: 'var(--parchment)', lineHeight: 1, letterSpacing: '0.01em',
          marginBottom: '6px',
        }}>{parentTest.name ?? 'Untitled'}</h1>
        {cc.category && (
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'var(--static)' }}>
            {cc.category}{cc.market ? ` · ${cc.market}` : ''}
          </p>
        )}
      </div>

      {/* No variants state */}
      {variantTests.length === 0 ? (
        <div style={{
          border: '1px solid var(--border)', padding: '48px 32px',
          textAlign: 'center',
        }}>
          <p style={{ ...EYEBROW, marginBottom: '12px' }}>No variants yet</p>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.72)', marginBottom: '20px' }}>
            Create a variant from the test page to compare concepts side-by-side.
          </p>
          <Link
            href={`/tests/${testId}`}
            style={{
              fontFamily: "'Barlow', sans-serif", fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--signal)', border: '1px solid var(--green-bd)',
              padding: '8px 20px', textDecoration: 'none', display: 'inline-block',
            }}
          >
            ← Back to test
          </Link>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `180px repeat(${variantTests.length + 1}, 1fr)`,
            gap: '1px',
            background: 'var(--border)',
            marginBottom: '1px',
          }}>
            <div style={{ background: 'var(--surface)', padding: '12px' }} />
            {/* Parent header */}
            <div style={{ background: 'var(--surface)', padding: '12px' }}>
              <p style={{ ...EYEBROW, marginBottom: '4px', color: 'var(--signal)' }}>Base</p>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'var(--parchment)', fontWeight: 500 }}>
                {parentTest.name}
              </p>
              {(parentScorecard?.method_cert?.hydration_event_count > 0 || parentScorecard?.method_cert?.gates_passed) && (
                <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <MemoryBadge count={parentScorecard.method_cert.hydration_event_count} />
                  <GatesBadge gatesPassed={parentScorecard.method_cert.gates_passed} />
                </div>
              )}
            </div>
            {/* Variant headers */}
            {variantTests.map((v: any, i: number) => (
              <div key={v.id} style={{ background: 'var(--layer)', padding: '12px' }}>
                <p style={{ ...EYEBROW, marginBottom: '4px' }}>
                  {v.variant_label ?? `Variant ${i + 1}`}
                </p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'var(--parchment)', fontWeight: 500 }}>
                  {v.name}
                </p>
                <p style={{
                  fontFamily: "'Martian Mono', monospace", fontSize: '9px',
                  color: v.status === 'complete' ? 'var(--signal)' : 'var(--static)',
                  marginTop: '4px',
                }}>{v.status}</p>
                {(variantScorecards[i]?.method_cert?.hydration_event_count > 0 || variantScorecards[i]?.method_cert?.gates_passed) && (
                  <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <MemoryBadge count={variantScorecards[i].method_cert.hydration_event_count} />
                    <GatesBadge gatesPassed={variantScorecards[i].method_cert.gates_passed} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Score rows */}
          {DIMS.map(({ label, key, hero }) => (
            <ScoreRow
              key={key}
              label={label}
              parent={parentScorecard?.[key]}
              variants={variantScorecards.map((s: any) => s?.[key])}
              hero={hero}
            />
          ))}

          {/* Verdict comparison */}
          {(parentScorecard?.headline || variantScorecards.some((s: any) => s?.headline)) && (
            <div style={{ marginTop: '32px' }}>
              <p style={{ ...EYEBROW, marginBottom: '16px' }}>Verdict</p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${variantTests.length + 1}, 1fr)`,
                gap: '1px',
                background: 'var(--border)',
              }}>
                {/* Parent verdict */}
                <div style={{ background: 'var(--surface)', padding: '16px' }}>
                  <p style={{ ...EYEBROW, marginBottom: '8px', color: 'var(--signal)' }}>Base</p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.88)', lineHeight: 1.65 }}>
                    {parentScorecard?.headline ?? '—'}
                  </p>
                </div>
                {variantScorecards.map((s: any, i: number) => (
                  <div key={i} style={{ background: 'var(--layer)', padding: '16px' }}>
                    <p style={{ ...EYEBROW, marginBottom: '8px' }}>{variantTests[i]?.variant_label ?? `Variant ${i + 1}`}</p>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.88)', lineHeight: 1.65 }}>
                      {s?.headline ?? (variantTests[i]?.status !== 'complete' ? 'Not run yet' : '—')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action row */}
          <div style={{ marginTop: '40px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[{ id: testId, name: parentTest.name }, ...variantTests.map((v: any) => ({ id: v.id, name: v.name }))].map((t) => (
              <Link
                key={t.id}
                href={`/report/${t.id}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: "'Barlow', sans-serif", fontSize: '11px', fontWeight: 600,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--static)', border: '1px solid var(--border)',
                  padding: '6px 14px', textDecoration: 'none', display: 'inline-block',
                }}
              >
                ↓ {t.name} Report
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
