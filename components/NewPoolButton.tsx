'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LABEL: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Barlow', sans-serif",
  fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.14em', textTransform: 'uppercase' as const,
  color: 'var(--static)', marginBottom: '6px',
};

const INPUT: React.CSSProperties = {
  width: '100%',
  fontFamily: "'Barlow', sans-serif", fontSize: '14px',
  color: 'var(--parchment)', background: 'var(--layer-2)',
  border: '1px solid var(--border)', padding: '9px 13px', outline: 'none',
};

export default function NewPoolButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', market: 'UK', category: 'general', persona_count: '50',
  });

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }
  function focus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = 'var(--border-hi)';
  }
  function blur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = 'var(--border)';
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, persona_count: parseInt(form.persona_count) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Error ${res.status}`); return; }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        fontFamily: "'Barlow', sans-serif", fontSize: '13px', fontWeight: 600,
        color: 'var(--void)', background: 'var(--signal)',
        border: '1px solid var(--signal)', padding: '8px 20px',
        letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer',
      }}>
        + New Pool
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', background: 'rgba(5,5,5,0.88)',
        }}>
          <div style={{
            width: '100%', maxWidth: '460px',
            background: 'var(--layer)', border: '1px solid var(--border-hi)', padding: '32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '22px', fontWeight: 800, color: 'var(--parchment)', letterSpacing: '0.02em',
              }}>
                New Persona <span style={{ color: 'var(--signal)' }}>Pool</span>
              </h2>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--static)', fontSize: '20px', cursor: 'pointer', background: 'none', border: 'none', lineHeight: 1 }}>×</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={LABEL}>Pool Name</label>
                <input type="text" required value={form.name} onChange={set('name')}
                  placeholder="e.g. UK Health-Conscious Women 25–40"
                  style={INPUT} onFocus={focus} onBlur={blur} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={LABEL}>Market</label>
                  <select value={form.market} onChange={set('market')}
                    style={{ ...INPUT, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
                    <option value="UK">UK</option>
                    <option value="US">US</option>
                    <option value="IN">India</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL}>Persona Count</label>
                  <input type="number" min="10" max="500" required value={form.persona_count} onChange={set('persona_count')}
                    style={INPUT} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div>
                <label style={LABEL}>Category</label>
                <input type="text" value={form.category} onChange={set('category')}
                  placeholder="e.g. health-food, fintech, fashion"
                  style={INPUT} onFocus={focus} onBlur={blur} />
              </div>

              <div style={{
                background: 'var(--green-tint)', border: '1px solid var(--green-bd)',
                padding: '12px 14px',
              }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(233,230,223,0.88)', lineHeight: 1.6 }}>
                  This pool will also be available in <strong style={{ color: 'var(--signal)' }}>Iris</strong> for qualitative research — ensuring both teams test against the same population.
                </p>
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
                  border: '1px solid var(--border)', letterSpacing: '0.04em', textTransform: 'uppercase' as const,
                }}>Cancel</button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Barlow', sans-serif", fontSize: '13px', fontWeight: 600,
                  color: 'var(--void)', background: loading ? 'var(--static)' : 'var(--signal)',
                  border: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? 'Creating…' : 'Create Pool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
