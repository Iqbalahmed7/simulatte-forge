'use client';

import { useState } from 'react';

export default function AskPersonaPanel({ testId }: { testId: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`/api/tests/${testId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setResponse(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium" style={{ color: 'var(--muted)' }}>ASK A PERSONA</h2>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:border-orange-500/30"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--card)' }}
        >
          {open ? 'Close' : 'Ask question'}
        </button>
      </div>

      {open && (
        <div className="rounded-xl p-5 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <form onSubmit={handleAsk} className="flex gap-3 mb-4">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. Would you pay £4 for this? Why or why not?"
              required
              className="flex-1 px-3.5 py-2.5 rounded-lg text-sm bg-white/5 border text-white placeholder:text-white/20 outline-none focus:border-orange-500/50 transition-colors"
              style={{ borderColor: 'var(--border)' }}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? '…' : 'Ask'}
            </button>
          </form>

          {response && (
            <div className="space-y-3">
              {response.responses?.map((r: any, i: number) => (
                <div key={i} className="rounded-lg p-4 bg-white/5">
                  <p className="text-xs font-medium text-orange-400 mb-2">{r.persona_name ?? `Persona ${i + 1}`}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{r.response}</p>
                </div>
              ))}
              {response.response && (
                <div className="rounded-lg p-4 bg-white/5">
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{response.response}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
