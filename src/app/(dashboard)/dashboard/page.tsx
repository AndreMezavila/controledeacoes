import { getDashboardOverview } from '@/actions/dashboard.actions';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardOverview();

  if (!data) {
    redirect('/login');
  }

  return <DashboardClient initialData={data} />;
}
