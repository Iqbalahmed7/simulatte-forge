'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTestButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    category: '',
    concept_card: '',
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Error ${res.status}`);
        return;
      }
      setOpen(false);
      router.push(`/tests/${data.test?.id ?? ''}`);
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
        style={{ background: 'var(--accent)' }}
      >
        + New Test
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 border"
            style={{ background: '#111118', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">New Concept Test</h2>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Test Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Oat Milk Protein Bar — Summer 2025"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white/5 border text-white placeholder:text-white/20 outline-none focus:border-orange-500/50 transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Category <span className="opacity-50">(optional)</span></label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Snacks, Beverages, Personal Care"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white/5 border text-white placeholder:text-white/20 outline-none focus:border-orange-500/50 transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Concept Card</label>
                <textarea
                  required
                  rows={6}
                  value={form.concept_card}
                  onChange={e => setForm(f => ({ ...f, concept_card: e.target.value }))}
                  placeholder="Describe your product concept. Include: what it is, who it's for, key claims, price point, and what makes it different."
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white/5 border text-white placeholder:text-white/20 outline-none focus:border-orange-500/50 transition-colors resize-none"
                  style={{ borderColor: 'var(--border)' }}
                />
                <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>
                  The more detail you include, the more accurate the simulation.
                </p>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
                  style={{ background: 'var(--accent)' }}
                >
                  {loading ? 'Launching…' : 'Launch Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
