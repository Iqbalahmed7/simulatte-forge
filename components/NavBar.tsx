'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  const active = path.startsWith(href);
  return (
    <Link href={href} style={{
      fontFamily: "'Barlow', sans-serif",
      fontSize: '13px', fontWeight: active ? 600 : 500,
      color: active ? 'var(--parchment)' : 'var(--static)',
      textDecoration: 'none',
      borderBottom: active ? '1px solid var(--signal)' : '1px solid transparent',
      paddingBottom: '2px',
      transition: 'color 0.15s',
    }}>
      {children}
    </Link>
  );
}

export default function NavBar({ tenantId, isAdmin }: { tenantId: string; isAdmin?: boolean }) {
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
      {/* Left: wordmark + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link href="/tests" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          {/* Engine mark — satellite nodes + flow lines + triple-ring core */}
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            {/* Satellite input nodes */}
            <circle cx="8"  cy="14" r="3.5" fill="none" stroke="rgba(233,230,223,0.35)" strokeWidth="1.25"/>
            <circle cx="8"  cy="14" r="1.2" fill="rgba(233,230,223,0.35)"/>
            <circle cx="10" cy="38" r="2.5" fill="none" stroke="rgba(233,230,223,0.22)" strokeWidth="1"/>
            <circle cx="10" cy="38" r=".8"  fill="rgba(233,230,223,0.22)"/>
            <circle cx="6"  cy="50" r="1.8" fill="rgba(233,230,223,0.14)"/>
            {/* Flow lines to core */}
            <line x1="11" y1="15" x2="19" y2="22" stroke="rgba(168,255,62,0.40)" strokeWidth="1"/>
            <line x1="12" y1="37" x2="19" y2="29" stroke="rgba(168,255,62,0.28)" strokeWidth=".75"/>
            <line x1="9"  y1="49" x2="19" y2="35" stroke="rgba(168,255,62,0.18)" strokeWidth=".75"/>
            {/* Triple-ring focal node */}
            <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(168,255,62,0.18)" strokeWidth="1.5"/>
            <circle cx="32" cy="32" r="20" fill="none" stroke="rgba(168,255,62,0.52)" strokeWidth="2"/>
            <circle cx="32" cy="32" r="8"  fill="#A8FF3E"/>
          </svg>

          {/* Wordmark: unified parchment — brand rule: no green in wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: '18px',
              letterSpacing: '-0.01em', color: '#E9E6DF',
            }}>
              Simulatte
            </span>
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600, fontSize: '10px',
              letterSpacing: '0.18em', color: '#9A9997',
              textTransform: 'uppercase', marginTop: '1px',
            }}>
              Forge
            </span>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <NavLink href="/tests">Tests</NavLink>
          <NavLink href="/pools">Pools</NavLink>
          {isAdmin && <NavLink href="/admin">Admin</NavLink>}
        </nav>
      </div>

      {/* Right: tenant + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{
          fontFamily: "'Martian Mono', monospace",
          fontSize: '11px', fontWeight: 500,
          color: 'var(--static)', letterSpacing: '0.02em',
        }}>{tenantId}</span>
        <button
          onClick={signOut}
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: '13px', fontWeight: 500,
            color: 'var(--static)', background: 'none', border: 'none',
            cursor: 'pointer', transition: 'color 0.15s',
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
