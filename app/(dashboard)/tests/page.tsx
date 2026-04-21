import { getSession } from '@/lib/auth';
import { forgeApi } from '@/lib/forge-api';
import Link from 'next/link';
import NewTestButton from '@/components/NewTestButton';

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    running: 'bg-blue-500/10 text-blue-400',
    complete: 'bg-green-500/10 text-green-400',
    failed: 'bg-red-500/10 text-red-400',
  };
  return map[status] ?? 'bg-white/5 text-white/40';
}

export default async function TestsPage() {
  const session = await getSession();
  let tests: any[] = [];
  try {
    const data = await forgeApi.listTests(session!.tenantId) as any;
    tests = data.tests ?? [];
  } catch {
    tests = [];
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Concept Tests</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Simulate consumer reactions before you launch
          </p>
        </div>
        <NewTestButton />
      </div>

      {/* Tests grid */}
      {tests.length === 0 ? (
        <div className="text-center py-24 rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <div className="text-4xl mb-4">🔥</div>
          <h3 className="text-lg font-medium text-white mb-2">No tests yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            Create your first concept test to see how consumers respond
          </p>
          <NewTestButton />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test: any) => (
            <Link
              key={test.id}
              href={`/tests/${test.id}`}
              className="group block rounded-xl p-5 border transition-colors hover:border-orange-500/30"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(test.status)}`}>
                  {test.status}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {new Date(test.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-medium text-white mb-1 group-hover:text-orange-400 transition-colors line-clamp-2">
                {test.name}
              </h3>
              {test.category && (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{test.category}</p>
              )}
              {test.scorecard && (
                <div className="mt-3 pt-3 border-t flex gap-4" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <div className="text-lg font-semibold text-white">{test.scorecard.purchase_intent_score ?? '—'}<span className="text-xs text-white/30">/10</span></div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>Intent</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{test.scorecard.distinctiveness_score ?? '—'}<span className="text-xs text-white/30">/10</span></div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>Distinct</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{test.scorecard.believability_score ?? '—'}<span className="text-xs text-white/30">/10</span></div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>Belief</div>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
