import { getSession } from '@/lib/auth';
import { forgeApi } from '@/lib/forge-api';
import Link from 'next/link';
import RunTestButton from '@/components/RunTestButton';
import AskPersonaPanel from '@/components/AskPersonaPanel';
import LiveTestPoller from '@/components/LiveTestPoller';
import PersonaRunsTable from '@/components/PersonaRunsTable';

const EYEBROW: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.18em', textTransform: 'uppercase' as const,
  color: 'var(--static)',
};

function fmt(val: number | null | undefined) {
  return val != null ? val.toFixed(1) : '—';
}

function ScoreCard({ label, value, max = 10, highlight = false }: {
  label: string; value: number | null | undefined; max?: number; highlight?: boolean;
}) {
  const pct = value != null ? (value / max) * 100 : 0;
  return (
    <div style={{
      background: highlight ? 'var(--green-tint)' : 'var(--layer)',
      border: `1px solid ${highlight ? 'var(--green-bd)' : 'var(--border)'}`,
      padding: '16px',
    }}>
      <div style={{
        fontFamily: "'Martian Mono', monospace",
        fontSize: '24px', fontWeight: 500,
        color: highlight ? 'var(--signal)' : 'var(--parchment)',
        lineHeight: 1, marginBottom: '4px',
      }}>
        {fmt(value)}<span style={{ fontSize: '11px', color: 'var(--static)', fontWeight: 400 }}>/{max}</span>
      </div>
      <div style={{ ...EYEBROW, marginBottom: '10px', letterSpacing: '0.12em' }}>{label}</div>
      <div style={{ height: '2px', background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: highlight ? 'var(--signal)' : 'rgba(233,230,223,0.20)', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  const isComplete = status === 'complete';
  return (
    <span style={{
      fontFamily: "'Martian Mono', monospace",
      fontSize: '10px', fontWeight: 500,
      letterSpacing: '0.06em',
      color: isComplete ? 'var(--signal)' : 'var(--static)',
      border: `1px solid ${isComplete ? 'var(--green-bd)' : 'var(--border)'}`,
      background: isComplete ? 'var(--green-tint)' : 'transparent',
      padding: '3px 10px',
    }}>{status}</span>
  );
}

export default async function TestDetailPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  await getSession();

  let test: any = null;
  let scorecard: any = null;
  let runs: any[] = [];

  try { test = await forgeApi.getTest(testId) as any; } catch {}
  try { scorecard = await forgeApi.getScorecard(testId) as any; } catch {}
  try { const r = await forgeApi.listRuns(testId) as any; runs = r.runs ?? []; } catch {}

  if (!test) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '80px' }}>
        <p style={{ color: 'var(--static)', marginBottom: '12px' }}>Test not found.</p>
        <Link href="/tests" style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'var(--signal)', textDecoration: 'none' }}>← Back to tests</Link>
      </div>
    );
  }

  const cc = test.concept_card ?? {};

  return (
    <div>
      {/* Breadcrumb */}
      <Link href="/tests" style={{
        fontFamily: "'Barlow', sans-serif", fontSize: '13px',
        color: 'var(--static)', textDecoration: 'none', display: 'inline-block', marginBottom: '24px',
      }}>← All Tests</Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <StatusTag status={test.status} />
            <LiveTestPoller testId={testId} status={test.status} />
            {cc.market && (
              <span style={{
                fontFamily: "'Martian Mono', monospace", fontSize: '10px',
                color: 'var(--static)', border: '1px solid var(--border)', padding: '3px 10px',
              }}>{cc.market}</span>
            )}
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 800,
            color: 'var(--parchment)', lineHeight: 1, letterSpacing: '0.01em',
          }}>{test.name}</h1>
          {cc.category && (
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'var(--static)', marginTop: '6px' }}>{cc.category}</p>
          )}
        </div>
        <RunTestButton testId={testId} />
      </div>

      {/* Scorecard */}
      {scorecard ? (
        <section style={{ marginBottom: '48px' }}>
          {/* Concept Score hero */}
          {scorecard.concept_score != null && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(56px,7vw,88px)', fontWeight: 800,
                color: 'var(--signal)', lineHeight: 1,
              }}>{Number(scorecard.concept_score).toFixed(1)}</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'var(--static)', fontWeight: 500 }}>
                / 10 &nbsp;·&nbsp; concept score
              </span>
              {scorecard.calibration_band && (
                <span style={{
                  fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 500,
                  color: 'var(--parchment)', border: '1px solid var(--border-hi)',
                  padding: '3px 10px', letterSpacing: '0.06em',
                }}>{scorecard.calibration_band.toUpperCase()}</span>
              )}
            </div>
          )}
          <p style={{ ...EYEBROW, marginBottom: '16px' }}>Dimension Scores</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1px', background: 'var(--border)', marginBottom: '24px' }}>
            <ScoreCard label="Purchase Intent" value={scorecard.intent_score} highlight />
            <ScoreCard label="Distinctiveness" value={scorecard.distinctiveness_score} />
            <ScoreCard label="Credibility" value={scorecard.credibility_score} />
            <ScoreCard label="Relevance" value={scorecard.relevance_score} />
            <ScoreCard label="Value" value={scorecard.value_score} />
            <ScoreCard label="Appeal" value={scorecard.appeal_score} />
          </div>

          {scorecard.headline && (
            <div style={{ background: 'var(--layer)', border: '1px solid var(--border)', padding: '20px', marginBottom: '16px' }}>
              <p style={{ ...EYEBROW, marginBottom: '8px' }}>Verdict</p>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '16px', fontWeight: 500, color: 'rgba(233,230,223,0.88)', lineHeight: 1.65 }}>
                {scorecard.headline}
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', background: 'var(--border)' }}>
            {scorecard.top_strengths?.length > 0 && (
              <div style={{ background: 'var(--layer)', padding: '20px' }}>
                <p style={{ ...EYEBROW, color: 'var(--signal)', marginBottom: '14px' }}>Strengths</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scorecard.top_strengths.map((s: string, i: number) => (
                    <li key={i} style={{ display: 'flex', gap: '10px', fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.88)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--signal)', flexShrink: 0, marginTop: '1px' }}>↑</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {scorecard.top_risks?.length > 0 && (
              <div style={{ background: 'var(--layer)', padding: '20px' }}>
                <p style={{ ...EYEBROW, marginBottom: '14px' }}>Risks</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scorecard.top_risks.map((w: string, i: number) => (
                    <li key={i} style={{ display: 'flex', gap: '10px', fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.88)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--static)', flexShrink: 0, marginTop: '1px' }}>↓</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {scorecard.recommendations?.length > 0 && (
              <div style={{ background: 'var(--layer)', padding: '20px' }}>
                <p style={{ ...EYEBROW, marginBottom: '14px' }}>Recommendations</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scorecard.recommendations.map((r: string, i: number) => (
                    <li key={i} style={{ display: 'flex', gap: '10px', fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.88)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--parchment)', flexShrink: 0, marginTop: '1px' }}>→</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      ) : (
        <div style={{ background: 'var(--layer)', border: '1px solid var(--border)', padding: '32px', textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'var(--static)' }}>
            {test.status === 'running' ? 'Simulation running — results will appear here shortly.' : 'No scorecard yet. Run the test to generate results.'}
          </p>
        </div>
      )}

      {/* Segment Heatmap */}
      {scorecard?.segment_heatmap && Object.keys(scorecard.segment_heatmap).length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <p style={{ ...EYEBROW, marginBottom: '16px' }}>Segment Heatmap</p>
          <div style={{ border: '1px solid var(--border)', background: 'var(--layer)' }}>
            {/* column headers */}
            {(() => {
              const segments = scorecard.segment_heatmap as Record<string, Record<string, number>>;
              const dims = Array.from(new Set(Object.values(segments).flatMap(d => Object.keys(d))));
              return (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `180px repeat(${dims.length}, 1fr)`,
                    padding: '8px 16px',
                    borderBottom: '1px solid var(--border)',
                    background: 'rgba(0,0,0,0.2)',
                  }}>
                    <span style={{ ...EYEBROW }}>Segment</span>
                    {dims.map(d => <span key={d} style={{ ...EYEBROW, textAlign: 'center' }}>{d.replace(/_/g, ' ')}</span>)}
                  </div>
                  {Object.entries(segments).map(([seg, scores]) => (
                    <div key={seg} style={{
                      display: 'grid',
                      gridTemplateColumns: `180px repeat(${dims.length}, 1fr)`,
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--border)',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'var(--parchment)', fontWeight: 500 }}>{seg}</span>
                      {dims.map(d => {
                        const v = scores[d] ?? 0;
                        const pct = (v / 10) * 100;
                        const heat = v >= 7 ? 'var(--signal)' : v >= 5 ? 'var(--parchment)' : 'var(--static)';
                        return (
                          <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '13px', color: heat }}>{v.toFixed(1)}</span>
                            <div style={{ width: '80%', height: '2px', background: 'var(--border)' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: heat }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* Ask Persona */}
      <AskPersonaPanel testId={testId} />

      {/* Concept Card */}
      {Object.keys(cc).length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <p style={{ ...EYEBROW, marginBottom: '16px' }}>Concept Card</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1px', background: 'var(--border)' }}>
            {[
              { key: 'product_name', label: 'Product' },
              { key: 'brand_name', label: 'Brand' },
              { key: 'format', label: 'Format' },
              { key: 'price_point', label: 'Price' },
              { key: 'target_consumer', label: 'Target Consumer' },
              { key: 'category', label: 'Category' },
            ].filter(f => cc[f.key]).map(({ key, label }) => (
              <div key={key} style={{ background: 'var(--layer)', padding: '16px' }}>
                <p style={{ ...EYEBROW, marginBottom: '6px' }}>{label}</p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.88)' }}>{cc[key]}</p>
              </div>
            ))}
            {cc.tagline && (
              <div style={{ background: 'var(--layer)', padding: '16px', gridColumn: '1 / -1' }}>
                <p style={{ ...EYEBROW, marginBottom: '6px' }}>Tagline</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px', color: 'var(--parchment)' }}>{cc.tagline}</p>
              </div>
            )}
            {cc.description && (
              <div style={{ background: 'var(--layer)', padding: '16px', gridColumn: '1 / -1' }}>
                <p style={{ ...EYEBROW, marginBottom: '6px' }}>Description</p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.88)', lineHeight: 1.7 }}>{cc.description}</p>
              </div>
            )}
            {cc.key_benefits?.length > 0 && (
              <div style={{ background: 'var(--layer)', padding: '16px', gridColumn: '1 / -1' }}>
                <p style={{ ...EYEBROW, marginBottom: '10px' }}>Key Benefits</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {cc.key_benefits.map((b: string, i: number) => (
                    <span key={i} style={{
                      fontFamily: "'Barlow', sans-serif", fontSize: '13px',
                      color: 'rgba(233,230,223,0.88)',
                      border: '1px solid var(--border)', padding: '4px 12px',
                    }}>{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Persona Runs */}
      <PersonaRunsTable testId={testId} runs={runs} />
    </div>
  );
}
