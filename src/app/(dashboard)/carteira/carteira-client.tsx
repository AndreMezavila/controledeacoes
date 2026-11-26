'use client';

import * as React from 'react';
import { CustodyPosition, PortfolioSummary } from '@/types';
import { CustodyTable } from '@/components/custody-table';
import { PortfolioSummaryCards } from '@/components/portfolio-summary-cards';
import { Button } from '@/components/ui/button';
import { TransactionModal } from '@/components/transaction-modal';
import { DollarSign, Briefcase } from 'lucide-react';

interface CarteiraClientProps {
  positions: CustodyPosition[];
  summary: PortfolioSummary;
}

export function CarteiraClient({ positions, summary }: CarteiraClientProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-emerald-400" />
            Carteira & Posições em Custódia
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Posição consolidada calculada a partir de todas as ordens de compra e venda registradas.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <DollarSign className="h-3.5 w-3.5" />
          Registrar Operação
        </Button>
      </div>

      <PortfolioSummaryCards summary={summary} />

      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">Detalhamento por Ativo</h2>
        <CustodyTable positions={positions} />
      </div>

      <TransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
