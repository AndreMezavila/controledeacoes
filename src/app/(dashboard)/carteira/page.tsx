import { getDashboardOverview } from '@/actions/dashboard.actions';
import { redirect } from 'next/navigation';
import { CarteiraClient } from './carteira-client';

export const dynamic = 'force-dynamic';

export default async function CarteiraPage() {
  const data = await getDashboardOverview();

  if (!data) {
    redirect('/login');
  }

  return <CarteiraClient positions={data.positions} summary={data.summary} />;
}
