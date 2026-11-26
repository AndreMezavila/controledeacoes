import { AlertItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface AlertCardProps {
  alert: AlertItem;
  onSelectAction?: (ticker: string, suggestedType: 'COMPRA' | 'VENDA', price: number) => void;
}

export function AlertCard({ alert, onSelectAction }: AlertCardProps) {
  const getStatusBadge = () => {
    switch (alert.status) {
      case 'COMPRAR':
        return (
          <Badge
            variant="success"
            className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1.5 animate-pulse-subtle"
          >
            <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
            COMPRAR
          </Badge>
        );
      case 'VENDER':
        return (
          <Badge
            variant="info"
            className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border-indigo-500/40 flex items-center gap-1.5 animate-pulse-subtle"
          >
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
            VENDER
          </Badge>
        );
      case 'STOP_LOSS':
        return (
          <Badge
            variant="danger"
            className="text-xs px-2.5 py-1 bg-rose-500/20 text-rose-300 border-rose-500/40 flex items-center gap-1.5 animate-bounce"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            STOP LOSS
          </Badge>
        );
      case 'MANTER':
        return (
          <Badge
            variant="warning"
            className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1.5"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            MANTER
          </Badge>
        );
      case 'AGUARDAR':
      default:
        return (
          <Badge
            variant="outline"
            className="text-xs px-2.5 py-1 bg-zinc-800 text-zinc-400 border-zinc-700 flex items-center gap-1.5"
          >
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            AGUARDAR
          </Badge>
        );
    }
  };

  const getBorderColor = () => {
    switch (alert.status) {
      case 'COMPRAR':
        return 'border-emerald-500/40 hover:border-emerald-500/70 shadow-emerald-950/20';
      case 'VENDER':
        return 'border-indigo-500/40 hover:border-indigo-500/70 shadow-indigo-950/20';
      case 'STOP_LOSS':
        return 'border-rose-500/50 hover:border-rose-500/80 shadow-rose-950/30';
      default:
        return 'border-zinc-800/80 hover:border-zinc-700 shadow-none';
    }
  };

  return (
    <Card className={`border transition-all duration-200 bg-zinc-900/60 shadow-lg ${getBorderColor()}`}>
      <CardContent className="p-5">
        {/* Card Header: Ticker & Status Badge */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-wide">{alert.ticker}</span>
              {alert.custodyQty > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
                  Custódia: {alert.custodyQty}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[200px]">
              {alert.assetName || alert.ticker}
            </p>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Current Price Banner */}
        <div className="mt-4 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-500 block uppercase font-medium">Cotação Atual</span>
            <span className="text-lg font-bold text-white font-mono">{formatCurrency(alert.currentQuote)}</span>
          </div>

          <div className="text-right">
            {alert.custodyAveragePrice > 0 ? (
              <>
                <span className="text-[11px] text-zinc-500 block">Preço Médio (PM)</span>
                <span className="text-xs font-semibold text-zinc-300 font-mono">
                  {formatCurrency(alert.custodyAveragePrice)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] text-zinc-500 block">Sem custódia</span>
                <span className="text-xs text-zinc-500">Fora da carteira</span>
              </>
            )}
          </div>
        </div>

        {/* Configured Targets (Preço-Teto & Preço-Alvo) */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 block font-medium uppercase">Preço-Teto (Compra)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-semibold text-emerald-400 font-mono">
                {formatCurrency(alert.targetBuyPrice)}
              </span>
              <span
                className={`text-[10px] font-mono ${
                  alert.targetBuyDistancePct <= 0 ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                }`}
              >
                {formatPercent(alert.targetBuyDistancePct)}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 block font-medium uppercase">Preço-Alvo (Venda)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-semibold text-indigo-400 font-mono">
                {formatCurrency(alert.targetSellPrice)}
              </span>
              <span
                className={`text-[10px] font-mono ${
                  alert.targetSellDistancePct >= 0 ? 'text-indigo-400 font-bold' : 'text-zinc-500'
                }`}
              >
                {formatPercent(alert.targetSellDistancePct)}
              </span>
            </div>
          </div>
        </div>

        {/* Stop Loss Indicator (if set) */}
        {alert.stopLossPrice && (
          <div className="mt-2 px-2.5 py-1.5 rounded-md bg-rose-950/20 border border-rose-900/30 flex items-center justify-between text-xs">
            <span className="text-[10px] text-rose-400 flex items-center gap-1 font-medium">
              <ShieldAlert className="h-3 w-3" /> Stop Loss Configurado:
            </span>
            <span className="font-mono text-rose-300 font-semibold">
              {formatCurrency(alert.stopLossPrice)}
            </span>
          </div>
        )}

        {/* Advisory Message */}
        <div className="mt-3 text-xs text-zinc-300 leading-relaxed bg-zinc-950/30 p-2.5 rounded-lg border border-zinc-800/60">
          <p className="flex items-start gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <span>{alert.message}</span>
          </p>
        </div>

        {/* Action Button for quick recording */}
        {onSelectAction && (
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-end gap-2">
            {alert.status === 'COMPRAR' && (
              <button
                type="button"
                onClick={() => onSelectAction(alert.ticker, 'COMPRA', alert.currentQuote)}
                className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                Registrar Compra Executada
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {(alert.status === 'VENDER' || alert.status === 'STOP_LOSS') && alert.custodyQty > 0 && (
              <button
                type="button"
                onClick={() => onSelectAction(alert.ticker, 'VENDA', alert.currentQuote)}
                className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                Registrar Venda Executada
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
