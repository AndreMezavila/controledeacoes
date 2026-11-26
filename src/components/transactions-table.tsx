'use client';

import * as React from 'react';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { deleteTransactionAction } from '@/actions/transaction.actions';
import { Trash2, Loader2, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string, ticker: string) => {
    if (!confirm(`Tem certeza que deseja excluir esta operação de ${ticker}? O Preço Médio será recalculado.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteTransactionAction(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/40">
        <History className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
        <h4 className="text-sm font-semibold text-zinc-300">Nenhuma operação cadastrada</h4>
        <p className="text-xs text-zinc-500 mt-1">
          Utilize o botão acima para registrar suas compras e vendas executadas na corretora.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-md">
      <table className="w-full text-left text-xs text-zinc-300">
        <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 font-semibold">
          <tr>
            <th scope="col" className="px-4 py-3.5">Data</th>
            <th scope="col" className="px-4 py-3.5">Ticker</th>
            <th scope="col" className="px-4 py-3.5">Tipo</th>
            <th scope="col" className="px-4 py-3.5 text-right">Qtd</th>
            <th scope="col" className="px-4 py-3.5 text-right">Preço Unit.</th>
            <th scope="col" className="px-4 py-3.5 text-right">Taxas</th>
            <th scope="col" className="px-4 py-3.5 text-right">Total Financeiro</th>
            <th scope="col" className="px-4 py-3.5">Obs</th>
            <th scope="col" className="px-4 py-3.5 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/70 font-mono">
          {transactions.map((tx) => {
            const isBuy = tx.type === 'COMPRA';
            const gross = tx.quantity * tx.unitPrice;
            const total = isBuy ? gross + tx.fees : Math.max(0, gross - tx.fees);

            return (
              <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-4 py-3.5 text-zinc-400 whitespace-nowrap font-sans">
                  {formatDate(tx.tradeDate)}
                </td>
                <td className="px-4 py-3.5 font-bold text-white text-sm">
                  {tx.ticker}
                </td>
                <td className="px-4 py-3.5 font-sans">
                  <Badge
                    variant={isBuy ? 'success' : 'info'}
                    className={`text-[10px] font-bold ${
                      isBuy ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                    }`}
                  >
                    {tx.type}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-right font-medium text-zinc-200">
                  {tx.quantity}
                </td>
                <td className="px-4 py-3.5 text-right text-zinc-300">
                  {formatCurrency(tx.unitPrice)}
                </td>
                <td className="px-4 py-3.5 text-right text-zinc-400">
                  {formatCurrency(tx.fees)}
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-white">
                  {formatCurrency(total)}
                </td>
                <td className="px-4 py-3.5 text-zinc-400 max-w-[160px] truncate font-sans text-xs">
                  {tx.notes || '-'}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => handleDelete(tx.id, tx.ticker)}
                    disabled={deletingId === tx.id}
                    title="Excluir operação"
                    className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors disabled:opacity-50"
                  >
                    {deletingId === tx.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
