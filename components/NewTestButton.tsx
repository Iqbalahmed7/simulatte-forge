'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INPUT = "w-full px-3.5 py-2.5 rounded-lg text-sm bg-white/5 border text-white placeholder:text-white/20 outline-none focus:border-orange-500/50 transition-colors";
const BORDER = { borderColor: 'var(--border)' };

export default function NewTestButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    product_name: '',
    brand_name: '',
    tagline: '',
    description: '',
    format: '',
    price_point: '',
    target_consumer: '',
    key_benefits: '',   // comma-separated, split before sending
    category: '',
    market: 'UK',
  });

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const concept_card = {
        product_name: form.product_name,
        brand_name: form.brand_name,
        tagline: form.tagline,
        description: form.description,
        format: form.format,
        price_point: form.price_point,
        target_consumer: form.target_consumer,
        key_benefits: form.key_benefits.split(',').map(s => s.trim()).filter(Boolean),
        category: form.category,
        market: form.market,
      };

      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, concept_card }),
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-xl rounded-2xl p-6 border my-8"
            style={{ background: '#111118', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">New Concept Test</h2>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              {/* Test name */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Test Name</label>
                <input type="text" required value={form.name} onChange={set('name')}
                  placeholder="e.g. Oat Protein Bar — Summer 2025" className={INPUT} style={BORDER} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Product Name</label>
                  <input type="text" required value={form.product_name} onChange={set('product_name')}
                    placeholder="ProOat Bar" className={INPUT} style={BORDER} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Brand Name</label>
                  <input type="text" value={form.brand_name} onChange={set('brand_name')}
                    placeholder="Graze" className={INPUT} style={BORDER} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Tagline</label>
                <input type="text" required value={form.tagline} onChange={set('tagline')}
                  placeholder="Fuel your focus, naturally" className={INPUT} style={BORDER} />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Description</label>
                <textarea required rows={3} value={form.description} onChange={set('description')}
                  placeholder="A high-protein oat bar made with real ingredients. No artificial sweeteners. 20g protein per bar."
                  className={INPUT + " resize-none"} style={BORDER} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Format / Pack Size</label>
                  <input type="text" required value={form.format} onChange={set('format')}
                    placeholder="60g bar, box of 12" className={INPUT} style={BORDER} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Price Point</label>
                  <input type="text" required value={form.price_point} onChange={set('price_point')}
                    placeholder="£3.50 per bar" className={INPUT} style={BORDER} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Target Consumer</label>
                <input type="text" required value={form.target_consumer} onChange={set('target_consumer')}
                  placeholder="Busy professionals 25-40, health-conscious, gym-goers" className={INPUT} style={BORDER} />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Key Benefits <span className="opacity-50">(comma-separated)</span></label>
                <input type="text" required value={form.key_benefits} onChange={set('key_benefits')}
                  placeholder="20g protein, no artificial sweeteners, high fibre, convenient" className={INPUT} style={BORDER} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Category</label>
                  <input type="text" required value={form.category} onChange={set('category')}
                    placeholder="Snacks / Protein Bars" className={INPUT} style={BORDER} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Market</label>
                  <select value={form.market} onChange={set('market')} className={INPUT} style={BORDER}>
                    <option value="UK">UK</option>
                    <option value="US">US</option>
                    <option value="IN">India</option>
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
                  style={{ background: 'var(--accent)' }}>
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
