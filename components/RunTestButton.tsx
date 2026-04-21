'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RunTestButton({ testId }: { testId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    try {
      await fetch(`/api/tests/${testId}/run`, { method: 'POST' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRun}
      disabled={loading}
      className="px-4 py-2 rounded-lg text-sm font-medium text-white border transition-colors hover:border-orange-500/50 disabled:opacity-50"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      {loading ? '⏳ Running…' : '▶ Re-run Test'}
    </button>
  );
}
