'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Forge dashboard error]', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--background)', flexDirection: 'column', gap: '16px', padding: '24px',
    }}>
      <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#A8FF3E', letterSpacing: '0.1em' }}>
        RUNTIME ERROR
      </p>
      <pre style={{
        fontFamily: 'monospace', fontSize: '13px',
        color: 'rgba(233,230,223,0.88)', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(233,230,223,0.1)', padding: '20px', maxWidth: '680px',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {error.message}
        {error.digest ? `\n\nDigest: ${error.digest}` : ''}
      </pre>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={reset} style={{
          fontFamily: 'monospace', fontSize: '12px', padding: '8px 20px',
          background: '#A8FF3E', color: '#050505', border: 'none', cursor: 'pointer',
        }}>
          Retry
        </button>
        <a href="/login" style={{
          fontFamily: 'monospace', fontSize: '12px', padding: '8px 20px',
          background: 'transparent', color: 'rgba(233,230,223,0.72)',
          border: '1px solid rgba(233,230,223,0.15)', textDecoration: 'none',
          display: 'flex', alignItems: 'center',
        }}>
          Back to login
        </a>
      </div>
    </div>
  );
}
