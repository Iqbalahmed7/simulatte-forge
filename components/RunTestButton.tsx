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
      style={{
        fontFamily: "'Barlow', sans-serif",
        fontSize: '13px',
        fontWeight: 600,
        color: loading ? 'var(--static)' : 'var(--void)',
        background: loading ? 'transparent' : 'var(--signal)',
        border: loading ? '1px solid var(--border)' : '1px solid var(--signal)',
        padding: '8px 20px',
        letterSpacing: '0.04em',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.15s',
        opacity: loading ? 0.5 : 1,
        textTransform: 'uppercase',
      }}
    >
      {loading ? 'Running…' : 'Run Test'}
    </button>
  );
}
