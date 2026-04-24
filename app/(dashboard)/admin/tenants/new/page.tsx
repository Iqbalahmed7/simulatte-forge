'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const EYEBROW: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.18em', textTransform: 'uppercase' as const,
  color: 'var(--static)',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ ...EYEBROW, display: 'block', marginBottom: '8px' }}>{label}</label>
      {children}
    </div>
  );
}

const INPUT: React.CSSProperties = {
  width: '100%', padding: '10px 14px', boxSizing: 'border-box',
  fontFamily: "'Barlow', sans-serif", fontSize: '14px',
  color: 'var(--parchment)', background: 'var(--layer)',
  border: '1px solid var(--border)', outline: 'none',
};

export default function NewTenantPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    id: '', name: '', tier: 'pilot', contact_email: '',
    initial_credits: '500', notes: '',
    commission_pool: false, pool_name: '', pool_market: 'IN', pool_category: 'general', pool_size: '100',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          tier: form.tier,
          contact_email: form.contact_email || null,
          initial_credits: parseInt(form.initial_credits) || 0,
          notes: form.notes || null,
          ...(form.commission_pool ? {
            commission_pool: {
              name: form.pool_name,
              market: form.pool_market,
              category: form.pool_category,
              target_size: parseInt(form.pool_size) || 100,
            }
          } : {}),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Failed to create tenant');
        return;
      }
      router.push(`/admin/tenants/${form.id}`);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ ...EYEBROW, marginBottom: '8px' }}>
          <Link href="/admin" style={{ color: 'var(--static)', textDecoration: 'none' }}>Admin</Link>
          {' / '}
          <Link href="/admin/tenants" style={{ color: 'var(--static)', textDecoration: 'none' }}>Tenants</Link>
          {' / '}New
        </p>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(28px,3vw,40px)', fontWeight: 800,
          color: 'var(--parchment)', lineHeight: 0.96,
        }}>
          Onboard <span style={{ color: 'var(--signal)' }}>Partner.</span>
        </h1>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.6)', marginTop: '8px' }}>
          Creates the tenant, allocates initial credits, and optionally commissions a custom persona pool.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tenant Identity */}
        <div style={{ padding: '24px', border: '1px solid var(--border)', background: 'var(--layer)', marginBottom: '16px' }}>
          <p style={{ ...EYEBROW, marginBottom: '20px', color: 'var(--parchment)' }}>Identity</p>
          <Field label="Tenant ID (slug, permanent)">
            <input
              style={INPUT} type="text" required placeholder="acme-foods"
              value={form.id} onChange={e => set('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            />
          </Field>
          <Field label="Company Name">
            <input style={INPUT} type="text" required placeholder="Acme Foods Pvt Ltd"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Tier">
              <select style={{ ...INPUT }} value={form.tier} onChange={e => set('tier', e.target.value)}>
                <option value="pilot">Pilot</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </Field>
            <Field label="Contact Email">
              <input style={INPUT} type="email" placeholder="founder@acme.com"
                value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
            </Field>
          </div>
          <Field label="Notes (internal)">
            <textarea style={{ ...INPUT, height: '72px', resize: 'vertical' } as React.CSSProperties}
              placeholder="Referred by…"
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </Field>
        </div>

        {/* Credits */}
        <div style={{ padding: '24px', border: '1px solid var(--border)', background: 'var(--layer)', marginBottom: '16px' }}>
          <p style={{ ...EYEBROW, marginBottom: '20px', color: 'var(--parchment)' }}>Initial Credits</p>
          <Field label="Credits to grant on creation">
            <input style={INPUT} type="number" min="0" max="100000"
              value={form.initial_credits} onChange={e => set('initial_credits', e.target.value)} />
          </Field>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'var(--static)' }}>
            1 credit = 1 persona concept test run. Pilot default: 500.
          </p>
        </div>

        {/* Commission Pool */}
        <div style={{ padding: '24px', border: '1px solid var(--border)', background: 'var(--layer)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <input
              type="checkbox" id="commission_pool"
              checked={form.commission_pool}
              onChange={e => set('commission_pool', e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--signal)' }}
            />
            <label htmlFor="commission_pool" style={{ ...EYEBROW, color: 'var(--parchment)', cursor: 'pointer' }}>
              Commission Custom Persona Pool
            </label>
          </div>

          {form.commission_pool && (
            <div style={{ paddingTop: '4px' }}>
              <Field label="Pool Name">
                <input style={INPUT} type="text" required placeholder="Acme — Urban Millennials"
                  value={form.pool_name} onChange={e => set('pool_name', e.target.value)} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <Field label="Market">
                  <select style={{ ...INPUT }} value={form.pool_market} onChange={e => set('pool_market', e.target.value)}>
                    <option value="IN">India (IN)</option>
                    <option value="US">USA (US)</option>
                    <option value="UK">UK</option>
                    <option value="SG">Singapore</option>
                  </select>
                </Field>
                <Field label="Category">
                  <input style={INPUT} type="text" placeholder="cpg-snacks"
                    value={form.pool_category} onChange={e => set('pool_category', e.target.value)} />
                </Field>
                <Field label="Target Size">
                  <input style={INPUT} type="number" min="10" max="1000"
                    value={form.pool_size} onChange={e => set('pool_size', e.target.value)} />
                </Field>
              </div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'var(--static)' }}>
                Pool metadata is registered now. Personas are populated by Iris when ready.
              </p>
            </div>
          )}
        </div>

        {error && (
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: '#FF6B6B', marginBottom: '16px', padding: '12px 16px', border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.06)' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={loading} style={{
            padding: '12px 32px',
            fontFamily: "'Barlow', sans-serif", fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--void)', background: loading ? 'var(--static)' : 'var(--signal)',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Creating…' : 'Create Partner'}
          </button>
          <Link href="/admin/tenants" style={{
            display: 'inline-block', padding: '12px 24px',
            fontFamily: "'Barlow', sans-serif", fontSize: '13px', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--static)', background: 'transparent',
            border: '1px solid var(--border)', textDecoration: 'none',
          }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
