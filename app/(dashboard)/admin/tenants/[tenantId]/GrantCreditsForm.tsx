'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INPUT: React.CSSProperties = {
  padding: '10px 14px',
  fontFamily: "'Barlow', sans-serif", fontSize: '14px',
  color: 'var(--parchment)', background: 'var(--layer)',
  border: '1px solid var(--border)', outline: 'none',
};

export default function GrantCreditsForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(amount), note: note || undefined }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Failed to grant credits');
        return;
      }
      setSuccess(`Granted ${parseInt(amount).toLocaleString()} credits.`);
      setAmount('');
      setNote('');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleGrant} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div>
        <label style={{
          display: 'block', fontFamily: "'Barlow', sans-serif", fontSize: '11px',
          fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--static)', marginBottom: '6px',
        }}>Amount</label>
        <input
          style={{ ...INPUT, width: '120px' }}
          type="number" min="1" max="100000" required
          placeholder="500"
          value={amount} onChange={e => setAmount(e.target.value)}
        />
      </div>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <label style={{
          display: 'block', fontFamily: "'Barlow', sans-serif", fontSize: '11px',
          fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--static)', marginBottom: '6px',
        }}>Note</label>
        <input
          style={{ ...INPUT, width: '100%', boxSizing: 'border-box' } as React.CSSProperties}
          type="text" placeholder="Pilot onboarding grant"
          value={note} onChange={e => setNote(e.target.value)}
        />
      </div>
      <button type="submit" disabled={loading} style={{
        padding: '10px 24px',
        fontFamily: "'Barlow', sans-serif", fontSize: '13px', fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--void)', background: loading ? 'var(--static)' : 'var(--signal)',
        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
      }}>
        {loading ? 'Granting…' : 'Grant'}
      </button>
      {error && <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: '#FF6B6B', width: '100%' }}>{error}</p>}
      {success && <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'var(--signal)', width: '100%' }}>{success}</p>}
    </form>
  );
}
