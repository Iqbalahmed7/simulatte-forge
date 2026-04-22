'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LABEL: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Barlow', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--static)',
  marginBottom: '6px',
};

const INPUT: React.CSSProperties = {
  width: '100%',
  fontFamily: "'Barlow', sans-serif",
  fontSize: '14px',
  color: 'var(--parchment)',
  background: 'var(--layer-2)',
  border: '1px solid var(--border)',
  padding: '9px 13px',
  outline: 'none',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  );
}

export default function NewTestButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pools, setPools] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', product_name: '', brand_name: '', tagline: '',
    description: '', format: '', price_point: '', target_consumer: '',
    key_benefits: '', category: '', market: 'UK', pool_id: '',
  });

  async function openModal() {
    setOpen(true);
    try {
      const res = await fetch('/api/pools');
      if (res.ok) { const d = await res.json(); setPools(d.pools ?? []); }
    } catch { /* pools optional */ }
  }

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  function focusIn(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.target.style.borderColor = 'var(--border-hi)';
  }
  function focusOut(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.target.style.borderColor = 'var(--border)';
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
        body: JSON.stringify({
          name: form.name,
          concept_card,
          ...(form.pool_id ? { pool_id: form.pool_id } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Error ${res.status}`); return; }
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
        onClick={openModal}
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--void)',
          background: 'var(--signal)',
          border: '1px solid var(--signal)',
          padding: '8px 20px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        + New Test
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px', overflowY: 'auto',
            background: 'rgba(5,5,5,0.88)',
          }}
        >
          <div style={{
            width: '100%', maxWidth: '560px',
            background: 'var(--layer)',
            border: '1px solid var(--border-hi)',
            padding: '32px',
            margin: '32px 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '22px', fontWeight: 800,
                color: 'var(--parchment)', letterSpacing: '0.02em',
              }}>
                New Concept <span style={{ color: 'var(--signal)' }}>Test</span>
              </h2>
              <button
                onClick={() => setOpen(false)}
                style={{ color: 'var(--static)', fontSize: '20px', cursor: 'pointer', background: 'none', border: 'none', lineHeight: 1 }}
              >×</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Field label="Test Name">
                <input type="text" required value={form.name} onChange={set('name')}
                  placeholder="Oat Protein Bar — Summer 2025" style={INPUT}
                  onFocus={focusIn} onBlur={focusOut} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Product Name">
                  <input type="text" required value={form.product_name} onChange={set('product_name')}
                    placeholder="ProOat Bar" style={INPUT} onFocus={focusIn} onBlur={focusOut} />
                </Field>
                <Field label="Brand Name">
                  <input type="text" value={form.brand_name} onChange={set('brand_name')}
                    placeholder="Graze" style={INPUT} onFocus={focusIn} onBlur={focusOut} />
                </Field>
              </div>

              <Field label="Tagline">
                <input type="text" required value={form.tagline} onChange={set('tagline')}
                  placeholder="Fuel your focus, naturally" style={INPUT} onFocus={focusIn} onBlur={focusOut} />
              </Field>

              <Field label="Description">
                <textarea required rows={3} value={form.description} onChange={set('description')}
                  placeholder="A high-protein oat bar made with real ingredients. 20g protein per bar."
                  style={{ ...INPUT, resize: 'none' }} onFocus={focusIn} onBlur={focusOut} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Format / Pack Size">
                  <input type="text" required value={form.format} onChange={set('format')}
                    placeholder="60g bar, box of 12" style={INPUT} onFocus={focusIn} onBlur={focusOut} />
                </Field>
                <Field label="Price Point">
                  <input type="text" required value={form.price_point} onChange={set('price_point')}
                    placeholder="£3.50 per bar" style={INPUT} onFocus={focusIn} onBlur={focusOut} />
                </Field>
              </div>

              <Field label="Target Consumer">
                <input type="text" required value={form.target_consumer} onChange={set('target_consumer')}
                  placeholder="Busy professionals 25–40, health-conscious" style={INPUT} onFocus={focusIn} onBlur={focusOut} />
              </Field>

              <Field label={`Key Benefits \u2014 comma-separated`}>
                <input type="text" required value={form.key_benefits} onChange={set('key_benefits')}
                  placeholder="20g protein, no artificial sweeteners, high fibre" style={INPUT} onFocus={focusIn} onBlur={focusOut} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Category">
                  <input type="text" required value={form.category} onChange={set('category')}
                    placeholder="Snacks / Protein Bars" style={INPUT} onFocus={focusIn} onBlur={focusOut} />
                </Field>
                <Field label="Market">
                  <select value={form.market} onChange={set('market')}
                    style={{ ...INPUT, cursor: 'pointer' }} onFocus={focusIn} onBlur={focusOut}>
                    <option value="UK">UK</option>
                    <option value="US">US</option>
                    <option value="IN">India</option>
                  </select>
                </Field>
              </div>

              {/* Persona Pool — optional, loads from /api/pools */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <label style={LABEL}>
                  Persona Pool{' '}
                  <span style={{ fontWeight: 400, letterSpacing: '0.02em', textTransform: 'none' as const, opacity: 0.6 }}>— optional</span>
                </label>
                {pools.length === 0 ? (
                  <div style={{
                    fontFamily: "'Barlow', sans-serif", fontSize: '13px',
                    color: 'var(--static)', padding: '9px 13px',
                    border: '1px solid var(--border)', background: 'var(--layer-2)',
                  }}>
                    No pools yet —{' '}
                    <a href="/pools" target="_blank" style={{ color: 'var(--signal)', textDecoration: 'none' }}>
                      create one in Pools ↗
                    </a>
                    {' '}or Iris will sync cohorts here automatically.
                  </div>
                ) : (
                  <select
                    value={form.pool_id}
                    onChange={set('pool_id')}
                    style={{ ...INPUT, cursor: 'pointer' }}
                    onFocus={focusIn} onBlur={focusOut}
                  >
                    <option value="">Auto-generate personas for this test</option>
                    {pools.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.market} · {p.persona_count ?? p.size ?? '?'} personas
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {error && (
                <p style={{
                  fontFamily: "'Barlow', sans-serif", fontSize: '13px',
                  color: 'var(--alert)', background: 'rgba(224,85,85,0.08)',
                  border: '1px solid rgba(224,85,85,0.20)', padding: '10px 14px',
                }}>{error}</p>
              )}

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setOpen(false)} style={{
                  flex: 1, padding: '10px', cursor: 'pointer',
                  fontFamily: "'Barlow', sans-serif", fontSize: '13px', fontWeight: 500,
                  color: 'var(--static)', background: 'transparent',
                  border: '1px solid var(--border)', letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>Cancel</button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Barlow', sans-serif", fontSize: '13px', fontWeight: 600,
                  color: 'var(--void)', background: loading ? 'var(--static)' : 'var(--signal)',
                  border: 'none', letterSpacing: '0.06em', textTransform: 'uppercase',
                  opacity: loading ? 0.7 : 1,
                }}>
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
