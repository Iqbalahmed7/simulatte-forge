'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NavBar({ tenantId }: { tenantId: string }) {
  const router = useRouter();

  async function signOut() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header
      className="px-6 py-4 flex items-center justify-between border-b"
      style={{ background: 'var(--layer)', borderColor: 'var(--border)' }}
    >
      <Link href="/tests" className="flex items-center gap-3">
        {/* Engine mark — concentric rings in signal green */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="9" stroke="#A8FF3E" strokeWidth="1" opacity="0.9" />
          <circle cx="10" cy="10" r="5.5" stroke="#A8FF3E" strokeWidth="1" opacity="0.6" />
          <circle cx="10" cy="10" r="2" fill="#A8FF3E" opacity="0.9" />
        </svg>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: '16px',
          letterSpacing: '0.04em',
          color: 'var(--parchment)',
        }}>
          SIMULATTE{' '}
          <span style={{ color: 'var(--signal)' }}>FORGE</span>
        </span>
      </Link>

      <div className="flex items-center gap-5">
        <span
          style={{
            fontFamily: "'Martian Mono', monospace",
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--static)',
            letterSpacing: '0.02em',
          }}
        >
          {tenantId}
        </span>
        <button
          onClick={signOut}
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--static)',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--parchment)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--static)')}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
