'use client';

import * as React from 'react';
import { Transaction } from '@/types';
import { TransactionsTable } from '@/components/transactions-table';
import { TransactionModal } from '@/components/transaction-modal';
import { Button } from '@/components/ui/button';
import { DollarSign, History } from 'lucide-react';

interface OperacoesClientProps {
  transactions: Transaction[];
}

export function OperacoesClient({ transactions }: OperacoesClientProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <History className="h-6 w-6 text-emerald-400" />
            Registro de Operações (Compras e Vendas)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Histórico completo de ordens manuais executadas na corretora com cálculo contábil de Preço Médio.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <DollarSign className="h-3.5 w-3.5" />
          Nova Operação
        </Button>
      </div>

      <TransactionsTable transactions={transactions} />

      <TransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
