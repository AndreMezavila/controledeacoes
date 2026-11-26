'use server';

import { auth } from '@/auth';
import { dbRepository } from '@/repositories';
import { AlertService } from '@/services/alert.service';
import { PortfolioService } from '@/services/portfolio.service';
import { AlertItem, CustodyPosition, PortfolioSummary, WatchlistAsset, Transaction } from '@/types';

export interface DashboardOverviewData {
  alerts: AlertItem[];
  positions: CustodyPosition[];
  summary: PortfolioSummary;
  watchlist: WatchlistAsset[];
  transactions: Transaction[];
  activeProvider: string;
}

export async function getDashboardOverview(): Promise<DashboardOverviewData | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  const [watchlist, transactions] = await Promise.all([
    dbRepository.watchlist.findByUserId(userId),
    dbRepository.transactions.findByUserId(userId),
  ]);

  const [alerts, portfolio] = await Promise.all([
    AlertService.evaluateAlerts(watchlist, transactions),
    PortfolioService.getPortfolioData(transactions),
  ]);

  const buyAlertsCount = alerts.filter((a) => a.status === 'COMPRAR').length;
  const sellAlertsCount = alerts.filter((a) => a.status === 'VENDER' || a.status === 'STOP_LOSS').length;

  const summary: PortfolioSummary = {
    ...portfolio.summary,
    buyAlertsCount,
    sellAlertsCount,
  };

  return {
    alerts,
    positions: portfolio.positions,
    summary,
    watchlist,
    transactions,
    activeProvider: process.env.DB_PROVIDER || 'sqlite',
  };
}
