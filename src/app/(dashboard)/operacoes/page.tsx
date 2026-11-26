import { getDashboardOverview } from '@/actions/dashboard.actions';
import { redirect } from 'next/navigation';
import { OperacoesClient } from './operacoes-client';

export const dynamic = 'force-dynamic';

export default async function OperacoesPage() {
  const data = await getDashboardOverview();

  if (!data) {
    redirect('/login');
  }

  return <OperacoesClient transactions={data.transactions} />;
}
