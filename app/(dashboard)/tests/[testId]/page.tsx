import { getSession } from '@/lib/auth';
import { forgeApi } from '@/lib/forge-api';
import Link from 'next/link';
import RunTestButton from '@/components/RunTestButton';
import AskPersonaPanel from '@/components/AskPersonaPanel';

function score(val: number | null | undefined) {
  if (val == null) return '—';
  return val.toFixed(1);
}

function ScoreCard({ label, value, max = 10 }: { label: string; value: number | null | undefined; max?: number }) {
  const pct = value != null ? (value / max) * 100 : 0;
  return (
    <div className="rounded-xl p-4 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="text-2xl font-semibold text-white mb-0.5">
        {score(value)}<span className="text-sm text-white/30">/{max}</span>
      </div>
      <div className="text-xs mb-2" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
      </div>
    </div>
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
      <div className="text-center py-24">
        <p className="text-white/40">Test not found</p>
        <Link href="/tests" className="text-sm text-orange-400 mt-2 block">← Back to tests</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Link href="/tests" className="text-sm transition-opacity hover:opacity-70 mb-6 inline-block" style={{ color: 'var(--muted)' }}>
        ← All Tests
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-white">{test.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              test.status === 'complete' ? 'bg-green-500/10 text-green-400' :
              test.status === 'running' ? 'bg-blue-500/10 text-blue-400' :
              'bg-yellow-500/10 text-yellow-400'
            }`}>{test.status}</span>
          </div>
          {test.category && <p className="text-sm" style={{ color: 'var(--muted)' }}>{test.category}</p>}
        </div>
        <RunTestButton testId={testId} />
      </div>

      {/* Scorecard */}
      {scorecard ? (
        <section className="mb-8">
          <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--muted)' }}>SCORECARD</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <ScoreCard label="Purchase Intent" value={scorecard.purchase_intent_score} />
            <ScoreCard label="Distinctiveness" value={scorecard.distinctiveness_score} />
            <ScoreCard label="Believability" value={scorecard.believability_score} />
            <ScoreCard label="Relevance" value={scorecard.relevance_score} />
            <ScoreCard label="Value" value={scorecard.value_perception_score} />
            <ScoreCard label="Likelihood" value={scorecard.trial_likelihood} />
          </div>

          {scorecard.headline && (
            <div className="rounded-xl p-5 border mb-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <p className="text-sm font-medium text-white mb-1">Headline Verdict</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{scorecard.headline}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            {scorecard.key_strengths?.length > 0 && (
              <div className="rounded-xl p-4 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium text-green-400 mb-3">STRENGTHS</p>
                <ul className="space-y-1.5">
                  {scorecard.key_strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--muted)' }}>
                      <span className="text-green-400 mt-0.5">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {scorecard.key_weaknesses?.length > 0 && (
              <div className="rounded-xl p-4 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium text-red-400 mb-3">WEAKNESSES</p>
                <ul className="space-y-1.5">
                  {scorecard.key_weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--muted)' }}>
                      <span className="text-red-400 mt-0.5">✗</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {scorecard.recommendations?.length > 0 && (
              <div className="rounded-xl p-4 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium text-orange-400 mb-3">RECOMMENDATIONS</p>
                <ul className="space-y-1.5">
                  {scorecard.recommendations.map((r: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--muted)' }}>
                      <span className="text-orange-400 mt-0.5">→</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="rounded-xl p-8 border mb-8 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {test.status === 'running' ? '⏳ Simulation running — results will appear here shortly' : 'No scorecard yet. Run the test to generate results.'}
          </p>
        </div>
      )}

      {/* Ask Persona */}
      <AskPersonaPanel testId={testId} />

      {/* Concept Card */}
      <section className="mb-8">
        <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--muted)' }}>CONCEPT CARD</h2>
        <div className="rounded-xl p-5 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>{test.concept_card}</p>
        </div>
      </section>

      {/* Runs */}
      {runs.length > 0 && (
        <section>
          <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--muted)' }}>PERSONA RUNS ({runs.length})</h2>
          <div className="space-y-2">
            {runs.map((run: any) => (
              <div key={run.id} className="rounded-xl p-4 border flex items-center justify-between"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div>
                  <p className="text-sm font-medium text-white">{run.persona_name ?? `Persona ${run.id.slice(0, 8)}`}</p>
                  {run.persona_profile?.age && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      {run.persona_profile.age}y · {run.persona_profile.location ?? ''} · {run.persona_profile.occupation ?? ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-right">
                  {run.purchase_intent != null && (
                    <div>
                      <div className="text-sm font-medium text-white">{run.purchase_intent}<span className="text-xs text-white/30">/10</span></div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>intent</div>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${run.status === 'complete' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {run.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
