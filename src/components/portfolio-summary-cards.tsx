import { PortfolioSummary } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Wallet, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PortfolioSummaryCardsProps {
  summary: PortfolioSummary;
}

export function PortfolioSummaryCards({ summary }: PortfolioSummaryCardsProps) {
  const isPositiveUnrealized = summary.totalUnrealizedProfitLoss >= 0;
  const isPositiveRealized = summary.totalRealizedProfitLoss >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Patrimônio Bruto em Custódia */}
      <Card className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Patrimônio em Custódia</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white">
              {formatCurrency(summary.totalGrossValue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span
                className={`flex items-center font-medium ${
                  isPositiveUnrealized ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositiveUnrealized ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {formatPercent(summary.totalUnrealizedProfitLossPct)}
              </span>
              <span className="text-zinc-500">
                ({formatCurrency(summary.totalUnrealizedProfitLoss)})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Investido */}
      <Card className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Investido (Custo)</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white">
              {formatCurrency(summary.totalInvested)}
            </div>
            <div className="mt-1.5 text-xs text-zinc-500">
              {summary.positionsCount} {summary.positionsCount === 1 ? 'ativo em carteira' : 'ativos em carteira'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Lucro/Prejuízo Realizado */}
      <Card className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Lucro Realizado (Vendas)</span>
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                isPositiveRealized ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold tracking-tight ${
                isPositiveRealized ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(summary.totalRealizedProfitLoss)}
            </div>
            <div className="mt-1.5 text-xs text-zinc-500">
              Histórico acumulado de vendas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Alertas de Decisão */}
      <Card className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Gatilhos Acionados</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-emerald-400">{summary.buyAlertsCount} Compra</span>
              <span className="text-zinc-600 font-normal">/</span>
              <span className="text-indigo-400">{summary.sellAlertsCount} Venda</span>
            </div>
            <div className="mt-1.5 text-xs text-zinc-500">
              Alertas para tomada de decisão
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
