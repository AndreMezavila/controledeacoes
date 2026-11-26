import { getDashboardOverview } from '@/actions/dashboard.actions';
import { redirect } from 'next/navigation';
import { MonitoradosClient } from './monitorados-client';

export const dynamic = 'force-dynamic';

export default async function MonitoradosPage() {
  const data = await getDashboardOverview();

  if (!data) {
    redirect('/login');
  }

  return <MonitoradosClient watchlist={data.watchlist} />;
}
