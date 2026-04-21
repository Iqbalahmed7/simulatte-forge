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
    <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
      <Link href="/tests" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)' }}>
          <span className="text-white font-bold text-xs">F</span>
        </div>
        <span className="font-semibold text-white tracking-tight">Forge</span>
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--card)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
          {tenantId}
        </span>
        <button
          onClick={signOut}
          className="text-xs transition-opacity hover:opacity-70"
          style={{ color: 'var(--muted)' }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
