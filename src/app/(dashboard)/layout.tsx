import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { NavigationBar } from '@/components/navigation-bar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const activeProvider = process.env.DB_PROVIDER || 'sqlite';

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar user={session.user} activeProvider={activeProvider} />
      <NavigationBar />
      <main className="flex-1 container px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
