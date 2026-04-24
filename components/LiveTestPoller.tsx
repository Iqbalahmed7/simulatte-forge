'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Invisible client component — when mounted while a test is running,
 * polls GET /api/tests/:testId every 4 s and triggers a router.refresh()
 * so the Server Component re-fetches the latest status.
 * Stops automatically once status transitions away from 'running'.
 */
export default function LiveTestPoller({ testId, status }: { testId: string; status: string }) {
  const router = useRouter();

  useEffect(() => {
    if (status !== 'running') return;

    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/tests/${testId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        router.refresh();
        if (data?.status !== 'running') clearInterval(id);
      } catch { /* ignore */ }
    }, 4000);

    return () => clearInterval(id);
  }, [testId, status, router]);

  if (status !== 'running') return null;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      fontFamily: "'Martian Mono', monospace", fontSize: '10px',
      color: 'var(--signal)', letterSpacing: '0.08em',
    }}>
      <span style={{
        display: 'inline-block', width: '6px', height: '6px',
        borderRadius: '50%', background: 'var(--signal)',
        animation: 'pulse 1.4s ease-in-out infinite',
      }} />
      LIVE
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }`}</style>
    </div>
  );
}
