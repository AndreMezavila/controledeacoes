'use client';

import * as React from 'react';
import { WatchlistAsset } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { deleteWatchlistAction } from '@/actions/watchlist.actions';
import { Trash2, Loader2, Sliders } from 'lucide-react';

interface WatchlistTableProps {
  assets: WatchlistAsset[];
}

export function WatchlistTable({ assets }: WatchlistTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string, ticker: string) => {
    if (!confirm(`Remover ${ticker} da lista de monitoramento?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteWatchlistAction(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (assets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/40">
        <Sliders className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
        <h4 className="text-sm font-semibold text-zinc-300">Nenhum ativo monitorado</h4>
        <p className="text-xs text-zinc-500 mt-1">
          Cadastre os ativos da B3 ou exterior que você deseja acompanhar e configure seus preços-alvo.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-md">
      <table className="w-full text-left text-xs text-zinc-300">
        <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 font-semibold">
          <tr>
            <th scope="col" className="px-4 py-3.5">Ticker</th>
            <th scope="col" className="px-4 py-3.5">Nome / Descrição</th>
            <th scope="col" className="px-4 py-3.5 text-right">Preço-Teto Compra</th>
            <th scope="col" className="px-4 py-3.5 text-right">Preço-Alvo Venda</th>
            <th scope="col" className="px-4 py-3.5 text-right">Stop Loss</th>
            <th scope="col" className="px-4 py-3.5">Observações</th>
            <th scope="col" className="px-4 py-3.5 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/70 font-mono">
          {assets.map((item) => (
            <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
              <td className="px-4 py-3.5 font-bold text-white text-sm">
                {item.ticker}
              </td>
              <td className="px-4 py-3.5 text-zinc-300 font-sans">
                {item.assetName || item.ticker}
              </td>
              <td className="px-4 py-3.5 text-right font-semibold text-emerald-400">
                {formatCurrency(item.targetBuyPrice)}
              </td>
              <td className="px-4 py-3.5 text-right font-semibold text-indigo-400">
                {formatCurrency(item.targetSellPrice)}
              </td>
              <td className="px-4 py-3.5 text-right font-medium text-rose-400">
                {item.stopLossPrice ? formatCurrency(item.stopLossPrice) : '-'}
              </td>
              <td className="px-4 py-3.5 text-zinc-400 max-w-[200px] truncate font-sans text-xs">
                {item.notes || '-'}
              </td>
              <td className="px-4 py-3.5 text-center">
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.ticker)}
                  disabled={deletingId === item.id}
                  title="Excluir monitoramento"
                  className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors disabled:opacity-50"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
