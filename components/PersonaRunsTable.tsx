'use client';

import { useState } from 'react';

const MONO: React.CSSProperties = {
  fontFamily: "'Martian Mono', monospace",
  fontSize: '11px', fontWeight: 500,
};

const EYEBROW: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.14em', textTransform: 'uppercase' as const,
  color: 'var(--static)',
};

const PAGE_SIZE = 25;

function kpiAvg(scores: Record<string, number> | null): number {
  if (!scores) return 0;
  const vals = Object.values(scores);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function ScorePip({ value }: { value: number }) {
  const color = value >= 7 ? 'var(--signal)' : value >= 5 ? 'var(--parchment)' : 'var(--static)';
  return (
    <span style={{ ...MONO, color }}>{value.toFixed(1)}</span>
  );
}

function TracePanel({ testId, runId }: { testId: string; runId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [trace, setTrace] = useState<any>(null);

  async function load() {
    setState('loading');
    try {
      const r = await fetch(`/api/tests/${testId}/runs/${runId}/trace`);
      const d = await r.json();
      setTrace(d.trace);
      setState('done');
    } catch {
      setState('error');
    }
  }

  if (state === 'idle') {
    return (
      <button onClick={load} style={{
        fontFamily: "'Barlow', sans-serif", fontSize: '12px', fontWeight: 500,
        color: 'var(--signal)', background: 'none', border: 'none', cursor: 'pointer',
        padding: '0', letterSpacing: '0.04em',
      }}>
        Load reasoning trace →
      </button>
    );
  }
  if (state === 'loading') return <span style={{ ...MONO, color: 'var(--static)' }}>loading…</span>;
  if (state === 'error') return <span style={{ ...MONO, color: 'var(--static)' }}>trace unavailable</span>;

  return (
    <div style={{
      fontFamily: "'Barlow', sans-serif", fontSize: '13px',
      color: 'rgba(233,230,223,0.88)', lineHeight: 1.7,
      whiteSpace: 'pre-wrap', maxHeight: '220px', overflowY: 'auto',
    }}>
      {typeof trace === 'string' ? trace
        : trace?.reasoning ?? JSON.stringify(trace, null, 2)}
    </div>
  );
}

export default function PersonaRunsTable({
  testId,
  runs,
}: {
  testId: string;
  runs: any[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<'index' | 'avg'>('index');

  if (!runs || runs.length === 0) return null;

  // Sort
  const sorted = [...runs].sort((a, b) => {
    if (sortKey === 'avg') return kpiAvg(b.kpi_scores) - kpiAvg(a.kpi_scores);
    return (a.persona_index ?? 0) - (b.persona_index ?? 0);
  });

  const pages = Math.ceil(sorted.length / PAGE_SIZE);
  const slice = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Collect all KPI dimension names from first run that has scores
  const firstWithScores = runs.find(r => r.kpi_scores && Object.keys(r.kpi_scores).length > 0);
  const dims: string[] = firstWithScores ? Object.keys(firstWithScores.kpi_scores) : [];

  const headerCell = (label: string, sortVal?: 'index' | 'avg') => (
    <div
      key={label}
      onClick={() => sortVal && setSortKey(sortVal)}
      style={{
        ...EYEBROW,
        padding: '8px 12px',
        cursor: sortVal ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        color: sortVal && sortKey === sortVal ? 'var(--parchment)' : 'var(--static)',
      }}
    >
      {label}{sortVal && sortKey === sortVal ? ' ↓' : ''}
    </div>
  );

  // Grid columns: # | persona | buy | kpi dims... | avg
  const colCount = 3 + dims.length + 1;
  const gridCols = `32px minmax(160px,1fr) 48px ${dims.map(() => '72px').join(' ')} 56px`;

  return (
    <section style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={EYEBROW}>Persona Runs <span style={{ fontWeight: 400, opacity: 0.5 }}>({runs.length})</span></p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSortKey('index')}
            style={{ ...EYEBROW, background: 'none', border: `1px solid ${sortKey === 'index' ? 'var(--border-hi)' : 'var(--border)'}`, padding: '3px 10px', cursor: 'pointer', color: sortKey === 'index' ? 'var(--parchment)' : 'var(--static)' }}
          >Order</button>
          <button
            onClick={() => setSortKey('avg')}
            style={{ ...EYEBROW, background: 'none', border: `1px solid ${sortKey === 'avg' ? 'var(--border-hi)' : 'var(--border)'}`, padding: '3px 10px', cursor: 'pointer', color: sortKey === 'avg' ? 'var(--parchment)' : 'var(--static)' }}
          >Top score</button>
        </div>
      </div>

      <div style={{ border: '1px solid var(--border)', overflowX: 'auto' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: gridCols,
          background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid var(--border)',
          alignItems: 'center',
        }}>
          {headerCell('#')}
          {headerCell('Persona')}
          {headerCell('Buy')}
          {dims.map(d => headerCell(d.replace(/_/g, ' ')))}
          {headerCell('Avg', 'avg')}
        </div>

        {/* Data rows */}
        {slice.map((run) => {
          const spec = run.persona_spec ?? {};
          const scores = run.kpi_scores ?? {};
          const avg = kpiAvg(scores);
          const isOpen = expanded === run.id;
          const bought = run.p1_vote;

          return (
            <div key={run.id}>
              <div
                onClick={() => setExpanded(isOpen ? null : run.id)}
                style={{
                  display: 'grid', gridTemplateColumns: gridCols,
                  borderBottom: `1px solid ${isOpen ? 'var(--border-hi)' : 'var(--border)'}`,
                  background: isOpen ? 'rgba(168,255,62,0.03)' : 'transparent',
                  alignItems: 'center', cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
              >
                {/* # */}
                <div style={{ ...MONO, color: 'var(--static)', padding: '10px 12px' }}>
                  {(run.persona_index ?? 0) + 1}
                </div>

                {/* Persona demographics */}
                <div style={{ padding: '10px 12px' }}>
                  <span style={{
                    fontFamily: "'Barlow', sans-serif", fontSize: '13px',
                    color: 'rgba(233,230,223,0.88)', fontWeight: 500,
                  }}>
                    {spec.age}y {spec.gender}
                  </span>
                  <span style={{ ...MONO, color: 'var(--static)', marginLeft: '8px' }}>
                    {[spec.sec, spec.city_tier].filter(Boolean).join(' · ')}
                  </span>
                </div>

                {/* Buy vote */}
                <div style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{
                    ...MONO,
                    color: bought ? 'var(--signal)' : 'var(--static)',
                  }}>{bought ? '✓' : '–'}</span>
                </div>

                {/* KPI scores */}
                {dims.map(d => (
                  <div key={d} style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <ScorePip value={scores[d] ?? 0} />
                  </div>
                ))}

                {/* Average */}
                <div style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <ScorePip value={avg} />
                </div>
              </div>

              {/* Expanded trace */}
              {isOpen && (
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  background: 'rgba(0,0,0,0.15)',
                }}>
                  <TracePanel testId={testId} runId={run.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '12px', alignItems: 'center' }}>
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            style={{ ...EYEBROW, background: 'none', border: '1px solid var(--border)', padding: '4px 12px', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.3 : 1 }}
          >←</button>
          <span style={{ ...EYEBROW, opacity: 0.5 }}>{page + 1} / {pages}</span>
          <button
            disabled={page === pages - 1}
            onClick={() => setPage(p => p + 1)}
            style={{ ...EYEBROW, background: 'none', border: '1px solid var(--border)', padding: '4px 12px', cursor: page === pages - 1 ? 'not-allowed' : 'pointer', opacity: page === pages - 1 ? 0.3 : 1 }}
          >→</button>
          <span style={{ ...EYEBROW, marginLeft: '8px', opacity: 0.4 }}>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, runs.length)} of {runs.length}
          </span>
        </div>
      )}
    </section>
  );
}
