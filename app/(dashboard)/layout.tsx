import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import NavBar from '@/components/NavBar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <NavBar tenantId={session.tenantId} isAdmin={session.isAdmin} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
