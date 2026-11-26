'use client';

import * as React from 'react';
import { DashboardOverviewData } from '@/actions/dashboard.actions';
import { PortfolioSummaryCards } from './portfolio-summary-cards';
import { AlertsGrid } from './alerts-grid';
import { CustodyTable } from './custody-table';
import { TransactionModal } from './transaction-modal';
import { WatchlistModal } from './watchlist-modal';
import { Button } from './ui/button';
import { PlusCircle, DollarSign, Bell, Briefcase, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardClientProps {
  initialData: DashboardOverviewData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Modals state
  const [isTradeModalOpen, setIsTradeModalOpen] = React.useState(false);
  const [isWatchlistModalOpen, setIsWatchlistModalOpen] = React.useState(false);

  // Pre-fill state for trade modal
  const [prefillTrade, setPrefillTrade] = React.useState<{
    ticker: string;
    type: 'COMPRA' | 'VENDA';
    price?: number;
  }>({
    ticker: '',
    type: 'COMPRA',
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleOpenTradeForAlert = (ticker?: string, type?: 'COMPRA' | 'VENDA', price?: number) => {
    setPrefillTrade({
      ticker: ticker || '',
      type: type || 'COMPRA',
      price,
    });
    setIsTradeModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Dashboard de Alertas & Decisões
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Sistema inteligente de suporte à decisão. Acompanhamento de gatilhos, preço-teto e preço-alvo.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs gap-1.5"
            title="Atualizar cotações e métricas"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsWatchlistModalOpen(true)}
            className="text-xs gap-1.5 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
            Novo Monitoramento
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleOpenTradeForAlert('', 'COMPRA')}
            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-semibold text-white shadow-md shadow-emerald-950/40"
          >
            <DollarSign className="h-3.5 w-3.5" />
            Registrar Operação
          </Button>
        </div>
      </div>

      {/* 1. Summary KPI Cards */}
      <PortfolioSummaryCards summary={initialData.summary} />

      {/* 2. Core Alert Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-400" />
              Recomendações e Status de Mercado
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {initialData.alerts.length} ativos acompanhados
          </span>
        </div>

        <AlertsGrid
          alerts={initialData.alerts}
          onOpenTradeModal={handleOpenTradeForAlert}
        />
      </div>

      {/* 3. Open Custody Positions Preview */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-emerald-400" />
            Posições em Carteira (Custódia Atual)
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            {initialData.positions.length} posições abertas
          </span>
        </div>

        <CustodyTable positions={initialData.positions} />
      </div>

      {/* Transaction & Watchlist Modals */}
      <TransactionModal
        open={isTradeModalOpen}
        onOpenChange={setIsTradeModalOpen}
        initialTicker={prefillTrade.ticker}
        initialType={prefillTrade.type}
        initialPrice={prefillTrade.price}
      />

      <WatchlistModal
        open={isWatchlistModalOpen}
        onOpenChange={setIsWatchlistModalOpen}
      />
    </div>
  );
}
