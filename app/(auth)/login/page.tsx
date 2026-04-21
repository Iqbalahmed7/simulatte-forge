'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, tenantId }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Login failed');
        return;
      }
      router.push('/tests');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">Forge</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            CPG Concept Testing by Simulatte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
              Tenant ID
            </label>
            <input
              type="text"
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
              placeholder="your-company"
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white/5 border text-white placeholder:text-white/20 outline-none focus:border-orange-500/50 transition-colors"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="forge-key-..."
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white/5 border text-white placeholder:text-white/20 outline-none focus:border-orange-500/50 transition-colors"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            {loading ? 'Signing in…' : 'Sign in to Forge'}
          </button>
        </form>
      </div>
    </div>
  );
}
