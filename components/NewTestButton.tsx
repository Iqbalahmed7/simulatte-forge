'use client';

import { useState, useRef } from 'react';
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

function fieldBorder(key: string, filled: Set<string>, missing: Set<string>) {
  if (filled.has(key)) return '1px solid rgba(74,222,128,0.55)';
  if (missing.has(key)) return '1px solid rgba(251,191,36,0.7)';
  return '1px solid var(--border)';
}

function fieldBg(key: string, filled: Set<string>, missing: Set<string>) {
  if (filled.has(key)) return 'rgba(74,222,128,0.04)';
  if (missing.has(key)) return 'rgba(251,191,36,0.04)';
  return 'var(--layer-2)';
}

function inputStyle(
  key: string,
  filled: Set<string>,
  missing: Set<string>,
  extra?: React.CSSProperties
): React.CSSProperties {
  return {
    width: '100%',
    fontFamily: "'Barlow', sans-serif",
    fontSize: '14px',
    color: 'var(--parchment)',
    background: fieldBg(key, filled, missing),
    border: fieldBorder(key, filled, missing),
    padding: '9px 13px',
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
    ...extra,
  };
}

function FieldBadge({ fieldKey, filled, missing }: { fieldKey: string; filled: Set<string>; missing: Set<string> }) {
  if (filled.has(fieldKey)) return (
    <span style={{ marginLeft: 6, fontSize: 10, color: 'rgba(74,222,128,0.8)', fontWeight: 700, letterSpacing: '0.1em' }}>
      ✓ FILLED
    </span>
  );
  if (missing.has(fieldKey)) return (
    <span style={{ marginLeft: 6, fontSize: 10, color: 'rgba(251,191,36,0.9)', fontWeight: 700, letterSpacing: '0.1em' }}>
      ● NEEDED
    </span>
  );
  return null;
}

function Field({
  label, fieldKey, filled, missing, children,
}: {
  label: string; fieldKey: string;
  filled: Set<string>; missing: Set<string>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ ...LABEL, display: 'flex', alignItems: 'center' }}>
        {label}
        <FieldBadge fieldKey={fieldKey} filled={filled} missing={missing} />
      </label>
      {children}
    </div>
  );
}

type ParseState = 'idle' | 'parsing' | 'done' | 'error';

export default function NewTestButton() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pools, setPools] = useState<any[]>([]);

  const [parseState, setParseState] = useState<ParseState>('idle');
  const [parseError, setParseError] = useState('');
  const [filledFields, setFilledFields] = useState<Set<string>>(new Set());
  const [missingFields, setMissingFields] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    name: '', product_name: '', brand_name: '', tagline: '',
    description: '', format: '', price_point: '', target_consumer: '',
    key_benefits: '', category: '', market: 'UK', pool_id: '',
  });

  async function openModal() {
    setOpen(true);
    setParseState('idle');
    setParseError('');
    setFilledFields(new Set());
    setMissingFields(new Set());
    setError('');
    setLoading(false);
    setForm({
      name: '', product_name: '', brand_name: '', tagline: '',
      description: '', format: '', price_point: '', target_consumer: '',
      key_benefits: '', category: '', market: 'UK', pool_id: '',
    });
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
  function focusOut(
    key: string,
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    e.target.style.borderColor = fieldBorder(key, filledFields, missingFields).split(' ').pop()!;
  }

  async function uploadFile(file: File) {
    setParseState('parsing');
    setParseError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/parse-brief', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setParseState('error'); setParseError(data.error ?? 'Parse failed'); return; }

      const { extracted, filled, missing } = data as {
        extracted: Record<string, string>;
        filled: string[];
        missing: string[];
      };

      setForm(f => ({ ...f, ...extracted }));
      setFilledFields(new Set(filled));
      setMissingFields(new Set(missing));
      setParseState('done');
    } catch (e) {
      setParseState('error');
      setParseError(String(e));
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
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
      const testId = data.test?.id;
      if (testId) {
        // run_error means test was created but simulation failed to start (stays draft)
        const dest = data.run_error
          ? `/tests/${testId}?warn=sim_start_failed`
          : `/tests/${testId}`;
        router.push(dest);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  const f = filledFields;
  const m = missingFields;

  return (
    <>
      <button
        onClick={openModal}
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: '13px', fontWeight: 600,
          color: 'var(--void)', background: 'var(--signal)',
          border: '1px solid var(--signal)', padding: '8px 20px',
          letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
        }}
      >
        + New Test
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', overflowY: 'auto',
          background: 'rgba(5,5,5,0.88)',
        }}>
          <div style={{
            width: '100%', maxWidth: '560px',
            background: 'var(--layer)',
            border: '1px solid var(--border-hi)',
            padding: '32px', margin: '32px 0',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
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

            {/* ── Upload zone ── */}
            <div
              onClick={() => parseState !== 'parsing' && fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                marginBottom: '24px',
                border: `1px dashed ${dragOver ? 'var(--signal)' : parseState === 'done' ? 'rgba(74,222,128,0.5)' : 'var(--border-hi)'}`,
                background: dragOver ? 'rgba(var(--signal-rgb),0.04)' : parseState === 'done' ? 'rgba(74,222,128,0.04)' : 'var(--layer-2)',
                padding: '20px',
                textAlign: 'center',
                cursor: parseState === 'parsing' ? 'wait' : 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
              {parseState === 'idle' && (
                <>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>📄</div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'var(--static)', margin: 0 }}>
                    Drop a brief or click to upload
                  </p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'var(--static)', opacity: 0.5, margin: '4px 0 0' }}>
                    PDF · DOCX · TXT — fields auto-filled by AI
                  </p>
                </>
              )}
              {parseState === 'parsing' && (
                <p style={{ fontFamily: "'Martian Mono', monospace", fontSize: '11px', color: 'var(--signal)', margin: 0, letterSpacing: '0.08em' }}>
                  ◌ READING BRIEF…
                </p>
              )}
              {parseState === 'done' && (
                <div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(74,222,128,0.9)', margin: '0 0 4px', fontWeight: 600 }}>
                    ✓ {f.size} field{f.size !== 1 ? 's' : ''} filled from brief
                  </p>
                  {m.size > 0 && (
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(251,191,36,0.85)', margin: 0 }}>
                      ● {m.size} field{m.size !== 1 ? 's' : ''} still needed — highlighted below
                    </p>
                  )}
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'var(--static)', opacity: 0.5, margin: '6px 0 0' }}>
                    Click to replace with a different file
                  </p>
                </div>
              )}
              {parseState === 'error' && (
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'var(--alert)', margin: 0 }}>
                  ✕ {parseError || 'Could not parse brief'} — try a different file
                </p>
              )}
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Field label="Test Name" fieldKey="name" filled={f} missing={m}>
                <input type="text" required value={form.name} onChange={set('name')}
                  placeholder="Oat Protein Bar — Summer 2025"
                  style={inputStyle('name', f, m)}
                  onFocus={focusIn} onBlur={e => focusOut('name', e)} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Product Name" fieldKey="product_name" filled={f} missing={m}>
                  <input type="text" required value={form.product_name} onChange={set('product_name')}
                    placeholder="ProOat Bar"
                    style={inputStyle('product_name', f, m)}
                    onFocus={focusIn} onBlur={e => focusOut('product_name', e)} />
                </Field>
                <Field label="Brand Name" fieldKey="brand_name" filled={f} missing={m}>
                  <input type="text" value={form.brand_name} onChange={set('brand_name')}
                    placeholder="Graze"
                    style={inputStyle('brand_name', f, m)}
                    onFocus={focusIn} onBlur={e => focusOut('brand_name', e)} />
                </Field>
              </div>

              <Field label="Tagline" fieldKey="tagline" filled={f} missing={m}>
                <input type="text" required value={form.tagline} onChange={set('tagline')}
                  placeholder="Fuel your focus, naturally"
                  style={inputStyle('tagline', f, m)}
                  onFocus={focusIn} onBlur={e => focusOut('tagline', e)} />
              </Field>

              <Field label="Description" fieldKey="description" filled={f} missing={m}>
                <textarea required rows={3} value={form.description} onChange={set('description')}
                  placeholder="A high-protein oat bar made with real ingredients. 20g protein per bar."
                  style={inputStyle('description', f, m, { resize: 'none' })}
                  onFocus={focusIn} onBlur={e => focusOut('description', e)} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Format / Pack Size" fieldKey="format" filled={f} missing={m}>
                  <input type="text" required value={form.format} onChange={set('format')}
                    placeholder="60g bar, box of 12"
                    style={inputStyle('format', f, m)}
                    onFocus={focusIn} onBlur={e => focusOut('format', e)} />
                </Field>
                <Field label="Price Point" fieldKey="price_point" filled={f} missing={m}>
                  <input type="text" required value={form.price_point} onChange={set('price_point')}
                    placeholder="£3.50 per bar"
                    style={inputStyle('price_point', f, m)}
                    onFocus={focusIn} onBlur={e => focusOut('price_point', e)} />
                </Field>
              </div>

              <Field label="Target Consumer" fieldKey="target_consumer" filled={f} missing={m}>
                <input type="text" required value={form.target_consumer} onChange={set('target_consumer')}
                  placeholder="Busy professionals 25–40, health-conscious"
                  style={inputStyle('target_consumer', f, m)}
                  onFocus={focusIn} onBlur={e => focusOut('target_consumer', e)} />
              </Field>

              <Field label="Key Benefits — comma-separated" fieldKey="key_benefits" filled={f} missing={m}>
                <input type="text" required value={form.key_benefits} onChange={set('key_benefits')}
                  placeholder="20g protein, no artificial sweeteners, high fibre"
                  style={inputStyle('key_benefits', f, m)}
                  onFocus={focusIn} onBlur={e => focusOut('key_benefits', e)} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Category" fieldKey="category" filled={f} missing={m}>
                  <input type="text" required value={form.category} onChange={set('category')}
                    placeholder="Snacks / Protein Bars"
                    style={inputStyle('category', f, m)}
                    onFocus={focusIn} onBlur={e => focusOut('category', e)} />
                </Field>
                <Field label="Market" fieldKey="market" filled={f} missing={m}>
                  <select value={form.market} onChange={set('market')}
                    style={inputStyle('market', f, m, { cursor: 'pointer' })}
                    onFocus={focusIn} onBlur={e => focusOut('market', e)}>
                    <option value="UK">UK</option>
                    <option value="US">US</option>
                    <option value="IN">India</option>
                  </select>
                </Field>
              </div>

              {/* Persona Pool */}
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
                  <select value={form.pool_id} onChange={set('pool_id')}
                    style={{ width: '100%', fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'var(--parchment)', background: 'var(--layer-2)', border: '1px solid var(--border)', padding: '9px 13px', outline: 'none', cursor: 'pointer' }}
                    onFocus={focusIn} onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}>
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
                  border: '1px solid var(--border)', letterSpacing: '0.04em', textTransform: 'uppercase',
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
