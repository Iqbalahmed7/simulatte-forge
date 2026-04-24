'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EYEBROW: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.14em', textTransform: 'uppercase' as const,
  color: 'var(--static)',
};

export default function VariantButton({
  testId,
  conceptCard,
  tenantId,
}: {
  testId: string;
  conceptCard: Record<string, unknown>;
  tenantId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function openModal() {
    setLabel('');
    setName('');
    setError('');
    setLoading(false);
    setOpen(true);
  }

  async function create() {
    if (!label.trim() || !name.trim()) { setError('Name and label are required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/tests/${testId}/variant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          variant_label: label.trim(),
          concept_card: conceptCard,
          config: {},
          tenant_id: tenantId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Error ${res.status}`); setLoading(false); return; }
      setOpen(false);
      const variantId = data.test?.id;
      if (variantId) router.push(`/tests/${variantId}`);
      else router.refresh();
    } catch {
      setError('Request failed.'); setLoading(false);
    }
  }

  const INPUT: React.CSSProperties = {
    fontFamily: "'Barlow', sans-serif", fontSize: '14px',
    background: 'rgba(233,230,223,0.04)', border: '1px solid var(--border)',
    color: 'var(--parchment)', padding: '10px 14px', width: '100%',
    outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <>
      <button
        onClick={openModal}
        style={{
          ...EYEBROW, background: 'none', border: '1px solid var(--border)',
          padding: '6px 14px', cursor: 'pointer',
        }}
      >
        + Variant
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border-hi)',
            padding: '32px', width: '460px', maxWidth: '90vw',
          }}>
            <p style={{ ...EYEBROW, marginBottom: '24px' }}>Create Variant</p>

            <label style={{ ...EYEBROW, display: 'block', marginBottom: '6px' }}>Variant name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Concept A – premium positioning"
              style={{ ...INPUT, marginBottom: '16px' }}
            />

            <label style={{ ...EYEBROW, display: 'block', marginBottom: '6px' }}>Variant label</label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. A / B / premium / low-price"
              style={{ ...INPUT, marginBottom: '8px' }}
            />
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'var(--static)', marginBottom: '24px' }}>
              Short identifier used to compare variants side-by-side.
            </p>

            {error && (
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'var(--static)', marginBottom: '16px' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                style={{ ...EYEBROW, background: 'none', border: '1px solid var(--border)', padding: '8px 20px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={create}
                disabled={loading}
                style={{
                  fontFamily: "'Barlow', sans-serif", fontSize: '13px', fontWeight: 600,
                  background: 'var(--signal)', color: '#050505',
                  border: 'none', padding: '8px 24px', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1, letterSpacing: '0.04em',
                }}
              >
                {loading ? 'Creating…' : 'Create variant →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
