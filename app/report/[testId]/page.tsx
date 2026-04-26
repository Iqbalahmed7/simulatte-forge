import { getSession } from '@/lib/auth';
import { forgeApi } from '@/lib/forge-api';
import { redirect } from 'next/navigation';

function fmt(v: number | null | undefined) {
  return v != null ? v.toFixed(1) : '—';
}

export default async function ReportPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  let test: any = null;
  let scorecard: any = null;
  try { const t = await forgeApi.getTest(testId) as any; test = t?.test ?? t; } catch {}
  try { const s = await forgeApi.getScorecard(testId) as any; scorecard = s?.scorecard ?? s; } catch {}

  const cc = test?.concept_card ?? {};
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Doc 09 aligned dimension display names (internal DB keys unchanged)
  const DIMS = [
    { label: 'Purchase Intent', key: 'intent_score' },
    { label: 'Uniqueness',      key: 'distinctiveness_score' },
    { label: 'Believability',   key: 'credibility_score' },
    { label: 'Relevance',       key: 'relevance_score' },
    { label: 'Price Fit',       key: 'value_score' },
    { label: 'Appeal',          key: 'appeal_score' },
    { label: 'Message Clarity', key: 'clarity_score' },
  ];

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{test?.name ?? 'Forge Report'} — Simulatte</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Barlow:wght@400;500;600&family=Martian+Mono:wght@500&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #050505;
            color: #E9E6DF;
            font-family: 'Barlow', sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page { max-width: 860px; margin: 0 auto; padding: 56px 48px; }
          .eyebrow {
            font-size: 10px; font-weight: 600; letter-spacing: 0.18em;
            text-transform: uppercase; color: #9A9997;
          }
          .border-b { border-bottom: 1px solid rgba(233,230,223,0.08); padding-bottom: 24px; margin-bottom: 24px; }
          .score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(233,230,223,0.08); margin: 20px 0; }
          .score-cell { background: #050505; padding: 16px 12px; }
          .score-val { font-family: 'Martian Mono', monospace; font-size: 22px; font-weight: 500; margin-bottom: 4px; }
          .list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
          .list li { display: flex; gap: 10px; font-size: 14px; color: rgba(233,230,223,0.88); line-height: 1.55; }
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(233,230,223,0.08); }
          .col-cell { background: #050505; padding: 20px; }
          .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
          .bar-track { flex: 1; height: 2px; background: rgba(233,230,223,0.08); }
          .bar-fill { height: 100%; }
          .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid rgba(233,230,223,0.08); display: flex; justify-content: space-between; }
          .print-btn {
            position: fixed; bottom: 24px; right: 24px;
            background: #A8FF3E; color: #050505;
            font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 600;
            border: none; padding: 10px 24px; cursor: pointer; letter-spacing: 0.04em;
          }
          @media print {
            .print-btn { display: none; }
            body { background: #ffffff; color: #050505; }
            .page { padding: 32px; }
            .score-grid, .two-col { background: #e0e0e0; }
            .score-cell, .col-cell { background: #ffffff; }
            .bar-track { background: #e0e0e0; }
          }
        `}</style>
      </head>
      <body>
        <div className="page">
          {/* Header */}
          <div className="border-b">
            <p className="eyebrow" style={{ marginBottom: '10px' }}>Simulatte Forge · Concept Test Report · {date}</p>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '42px', fontWeight: 800, lineHeight: 1, color: '#E9E6DF', marginBottom: '6px' }}>
              {test?.name ?? 'Untitled Test'}
            </h1>
            {cc.brand_name && cc.category && (
              <p style={{ fontSize: '14px', color: '#9A9997' }}>{cc.brand_name} · {cc.category}{cc.market ? ` · ${cc.market}` : ''}</p>
            )}
          </div>

          {/* Concept Score Hero */}
          {scorecard && (
            <>
              <div className="border-b" style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '80px', fontWeight: 800, color: '#A8FF3E', lineHeight: 1 }}>
                  {fmt(scorecard.concept_score)}
                </span>
                <div>
                  <p style={{ fontSize: '13px', color: '#9A9997', marginBottom: '4px' }}>/ 10 · concept score</p>
                  {scorecard.calibration_band && (
                    <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10px', fontWeight: 500, color: '#E9E6DF', border: '1px solid rgba(233,230,223,0.15)', padding: '2px 8px' }}>
                      {scorecard.calibration_band.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Verdict */}
              {scorecard.headline && (
                <div className="border-b">
                  <p className="eyebrow" style={{ marginBottom: '8px' }}>Verdict</p>
                  <p style={{ fontSize: '16px', fontWeight: 500, color: 'rgba(233,230,223,0.88)', lineHeight: 1.65 }}>{scorecard.headline}</p>
                </div>
              )}

              {/* Dimension Scores */}
              <div style={{ marginBottom: '32px' }}>
                <p className="eyebrow" style={{ marginBottom: '16px' }}>Dimension Scores</p>
                {DIMS.map(({ label, key }) => {
                  const v = scorecard[key];
                  if (v == null) return null;
                  const pct = (v / 10) * 100;
                  const col = v >= 7 ? '#A8FF3E' : v >= 5 ? '#E9E6DF' : '#9A9997';
                  return (
                    <div key={key} className="bar-row">
                      <span style={{ width: '140px', fontSize: '12px', color: '#9A9997', flexShrink: 0 }}>{label}</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${pct}%`, background: col }} />
                      </div>
                      <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '12px', fontWeight: 500, color: col, width: '32px', textAlign: 'right', flexShrink: 0 }}>
                        {v.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Strengths + Risks */}
              {(scorecard.top_strengths?.length > 0 || scorecard.top_risks?.length > 0) && (
                <div className="two-col" style={{ marginBottom: '32px' }}>
                  {scorecard.top_strengths?.length > 0 && (
                    <div className="col-cell">
                      <p className="eyebrow" style={{ color: '#A8FF3E', marginBottom: '14px' }}>Strengths</p>
                      <ul className="list">
                        {scorecard.top_strengths.map((s: any, i: number) => {
                          const label = typeof s === 'string' ? s : (s?.dimension ? `${String(s.dimension).replace(/_/g,' ')}${typeof s?.score === 'number' ? ` — ${s.score.toFixed(1)}/10` : ''}` : JSON.stringify(s));
                          return <li key={i}><span style={{ color: '#A8FF3E', flexShrink: 0 }}>↑</span>{label}</li>;
                        })}
                      </ul>
                    </div>
                  )}
                  {scorecard.top_risks?.length > 0 && (
                    <div className="col-cell">
                      <p className="eyebrow" style={{ marginBottom: '14px' }}>Risks</p>
                      <ul className="list">
                        {scorecard.top_risks.map((r: any, i: number) => {
                          const label = typeof r === 'string' ? r : (r?.dimension ? `${String(r.dimension).replace(/_/g,' ')}${typeof r?.score === 'number' ? ` — ${r.score.toFixed(1)}/10` : ''}` : JSON.stringify(r));
                          return <li key={i}><span style={{ color: '#9A9997', flexShrink: 0 }}>↓</span>{label}</li>;
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {scorecard.recommendations?.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <p className="eyebrow" style={{ marginBottom: '14px' }}>Recommendations</p>
                  <ul className="list">
                    {scorecard.recommendations.map((r: any, i: number) => {
                      const label = typeof r === 'string' ? r : (r?.text || r?.dimension || JSON.stringify(r));
                      return <li key={i}><span style={{ color: '#E9E6DF', flexShrink: 0 }}>→</span>{label}</li>;
                    })}
                  </ul>
                </div>
              )}

              {/* Segment Analysis */}
              {scorecard.segment_heatmap && (
                <div style={{ marginBottom: '32px' }}>
                  <p className="eyebrow" style={{ marginBottom: '16px' }}>Segment Analysis — % Positive Intent</p>

                  {/* SEC × City Tier subsegment grid (N≥15 cells only) */}
                  {scorecard.segment_heatmap.by_subsegment && Object.keys(scorecard.segment_heatmap.by_subsegment).length > 0 && (() => {
                    const SECS   = ['SEC-A', 'SEC-B', 'SEC-C'];
                    const TIERS  = ['T1', 'T2', 'T3', 'Rural'];
                    const cells  = scorecard.segment_heatmap.by_subsegment as Record<string, any>;
                    return (
                      <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#9A9997', marginBottom: '10px' }}>SEC × City Tier</p>
                        {/* Header row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '72px repeat(4, 1fr)', gap: '1px', background: 'rgba(233,230,223,0.08)', marginBottom: '1px' }}>
                          <div style={{ background: '#050505', padding: '8px' }} />
                          {TIERS.map(t => (
                            <div key={t} style={{ background: '#050505', padding: '8px' }}>
                              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', fontWeight: 500, color: '#9A9997' }}>{t}</span>
                            </div>
                          ))}
                        </div>
                        {/* Data rows */}
                        {SECS.map(sec => (
                          <div key={sec} style={{ display: 'grid', gridTemplateColumns: '72px repeat(4, 1fr)', gap: '1px', background: 'rgba(233,230,223,0.08)', marginBottom: '1px' }}>
                            <div style={{ background: '#050505', padding: '8px', display: 'flex', alignItems: 'center' }}>
                              <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', fontWeight: 500, color: '#9A9997' }}>{sec.replace('SEC-', '')}</span>
                            </div>
                            {TIERS.map(tier => {
                              const key  = `sec:${sec}__city_tier:${tier}`;
                              const cell = cells[key];
                              if (!cell) {
                                return (
                                  <div key={tier} style={{ background: '#050505', padding: '8px' }}>
                                    <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'rgba(233,230,223,0.24)' }}>n/a</span>
                                  </div>
                                );
                              }
                              const t2b = typeof cell.t2b_pct === 'number' ? cell.t2b_pct : null;
                              const col = t2b == null ? '#9A9997' : t2b >= 65 ? '#A8FF3E' : t2b >= 45 ? '#E9E6DF' : '#9A9997';
                              return (
                                <div key={tier} style={{ background: '#050505', padding: '8px' }}>
                                  <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '12px', fontWeight: 500, color: col, display: 'block' }}>{t2b == null ? '—' : `${t2b.toFixed(0)}%`}</span>
                                  <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9px', color: 'rgba(233,230,223,0.40)' }}>n={cell.n}</span>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                        <p style={{ fontSize: '11px', color: 'rgba(233,230,223,0.40)', marginTop: '6px' }}>n/a = fewer than 15 responses in cell</p>
                      </div>
                    );
                  })()}

                  {/* Per-segment bar charts — sourced from p1_rates sub-key */}
                  {scorecard.segment_heatmap.p1_rates && (Object.entries(scorecard.segment_heatmap.p1_rates) as [string, Record<string, number>][]).map(([dim, cells]) => (
                    <div key={dim} style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#9A9997', marginBottom: '10px' }}>
                        {dim === 'sec' ? 'SEC' : dim === 'city_tier' ? 'City Tier' : dim.charAt(0).toUpperCase() + dim.slice(1)}
                      </p>
                      {Object.entries(cells).map(([label, pct]) => {
                        const col = pct >= 65 ? '#A8FF3E' : pct >= 45 ? '#E9E6DF' : '#9A9997';
                        return (
                          <div key={label} className="bar-row">
                            <span style={{ width: '100px', fontSize: '12px', color: '#9A9997', flexShrink: 0 }}>{label}</span>
                            <div className="bar-track">
                              <div className="bar-fill" style={{ width: `${pct}%`, background: col }} />
                            </div>
                            <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '12px', fontWeight: 500, color: col, width: '44px', textAlign: 'right' as const, flexShrink: 0 }}>
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {/* Dissent signals — stored in method_cert.dissent_signals */}
                  {scorecard.method_cert?.dissent_signals?.length > 0 && (
                    <div style={{ marginTop: '16px', padding: '12px', border: '1px solid rgba(233,230,223,0.08)' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#9A9997', marginBottom: '6px' }}>
                        Dissent Signals — {scorecard.method_cert.dissent_signals.length} persona{scorecard.method_cert.dissent_signals.length !== 1 ? 's' : ''}
                      </p>
                      <p style={{ fontSize: '12px', color: 'rgba(233,230,223,0.56)', lineHeight: 1.55 }}>
                        {scorecard.method_cert.dissent_signals.length} response pattern{scorecard.method_cert.dissent_signals.length !== 1 ? 's' : ''} flagged as statistically extreme (&gt;2.5 SD on 3+ dimensions). Retained in scoring as authentic dissent signal{scorecard.method_cert.dissent_signals.length !== 1 ? 's' : ''}.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Concept Card */}
          {Object.keys(cc).length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <p className="eyebrow" style={{ marginBottom: '16px' }}>Concept Card</p>
              <div className="score-grid">
                {[
                  ['Product', cc.product_name], ['Brand', cc.brand_name],
                  ['Format', cc.format], ['Price', cc.price_point],
                  ['Category', cc.category], ['Market', cc.market],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string} className="score-cell">
                    <p className="eyebrow" style={{ marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontSize: '13px', color: 'rgba(233,230,223,0.88)' }}>{value as string}</p>
                  </div>
                ))}
              </div>
              {cc.description && (
                <p style={{ fontSize: '14px', color: 'rgba(233,230,223,0.72)', lineHeight: 1.7, marginTop: '16px' }}>{cc.description as string}</p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <span className="eyebrow">Simulatte Forge</span>
            <span className="eyebrow">Confidential — {date}</span>
          </div>
        </div>

        {/* Print button (hidden in print) */}
        <button className="print-btn">
          Print / Save as PDF
        </button>
        <script dangerouslySetInnerHTML={{ __html: `
          document.querySelector('.print-btn').addEventListener('click', () => window.print());
        `}} />
      </body>
    </html>
  );
}
