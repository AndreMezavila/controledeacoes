import { CustodyPosition } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface CustodyTableProps {
  positions: CustodyPosition[];
}

export function CustodyTable({ positions }: CustodyTableProps) {
  if (positions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/40">
        <Layers className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
        <h4 className="text-sm font-semibold text-zinc-300">Nenhum ativo em custódia no momento</h4>
        <p className="text-xs text-zinc-500 mt-1">
          Registre uma operação de COMPRA para que sua carteira e Preço Médio sejam calculados automaticamente.
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
            <th scope="col" className="px-4 py-3.5 text-right">Qtd em Custódia</th>
            <th scope="col" className="px-4 py-3.5 text-right">Preço Médio (PM)</th>
            <th scope="col" className="px-4 py-3.5 text-right">Custo Total</th>
            <th scope="col" className="px-4 py-3.5 text-right">Cotação Atual</th>
            <th scope="col" className="px-4 py-3.5 text-right">Valor de Mercado</th>
            <th scope="col" className="px-4 py-3.5 text-right">Lucro/Prej. Não Realizado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/70 font-mono">
          {positions.map((pos) => {
            const isProfit = pos.unrealizedProfitLoss >= 0;

            return (
              <tr key={pos.ticker} className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-4 py-3.5 font-bold text-white text-sm">
                  {pos.ticker}
                </td>
                <td className="px-4 py-3.5 text-right font-medium text-zinc-200">
                  {pos.quantity}
                </td>
                <td className="px-4 py-3.5 text-right text-zinc-300">
                  {formatCurrency(pos.averagePrice)}
                </td>
                <td className="px-4 py-3.5 text-right text-zinc-300">
                  {formatCurrency(pos.totalInvested)}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-white">
                  {formatCurrency(pos.currentQuote)}
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-white">
                  {formatCurrency(pos.grossValue)}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex flex-col items-end">
                    <span
                      className={`inline-flex items-center gap-0.5 font-bold ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {formatPercent(pos.unrealizedProfitLossPct)}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {formatCurrency(pos.unrealizedProfitLoss)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
