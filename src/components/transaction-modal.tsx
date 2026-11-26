'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionInput } from '@/lib/validations';
import { createTransactionAction } from '@/actions/transaction.actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTicker?: string;
  initialType?: 'COMPRA' | 'VENDA';
  initialPrice?: number;
}

export function TransactionModal({
  open,
  onOpenChange,
  initialTicker = '',
  initialType = 'COMPRA',
  initialPrice,
}: TransactionModalProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      ticker: initialTicker,
      type: initialType,
      quantity: 100,
      unitPrice: initialPrice || 0,
      fees: 0,
      tradeDate: today,
      notes: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      setServerSuccess(false);
      reset({
        ticker: initialTicker || '',
        type: initialType || 'COMPRA',
        quantity: 100,
        unitPrice: initialPrice || 0,
        fees: 0,
        tradeDate: today,
        notes: '',
      });
    }
  }, [open, initialTicker, initialType, initialPrice, reset, today]);

  const watchedType = watch('type');
  const watchedQuantity = watch('quantity') || 0;
  const watchedPrice = watch('unitPrice') || 0;
  const watchedFees = watch('fees') || 0;

  // Real-time financial estimation
  const totalFinancial = React.useMemo(() => {
    const gross = Number(watchedQuantity) * Number(watchedPrice);
    if (watchedType === 'COMPRA') {
      return gross + Number(watchedFees);
    } else {
      return Math.max(0, gross - Number(watchedFees));
    }
  }, [watchedQuantity, watchedPrice, watchedFees, watchedType]);

  const onSubmit = async (values: TransactionInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await createTransactionAction(values);
      if (!res.success) {
        setServerError(res.error || 'Erro ao salvar operação.');
      } else {
        setServerSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      }
    } catch (err) {
      setServerError('Falha de comunicação com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            Registrar Operação Realizada
          </DialogTitle>
          <DialogDescription>
            Registre manualmente a compra ou venda efetuada na sua corretora para atualizar seu Preço Médio e posição de custódia.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {serverSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Operação gravada com sucesso! Recalculando carteira...</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Operation Type Switch */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">
              Tipo de Operação
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue('type', 'COMPRA')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                  watchedType === 'COMPRA'
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                COMPRA
              </button>
              <button
                type="button"
                onClick={() => setValue('type', 'VENDA')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                  watchedType === 'VENDA'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                VENDA
              </button>
            </div>
            {errors.type && <p className="text-rose-400 text-[11px] mt-1">{errors.type.message}</p>}
          </div>

          {/* Ticker & Trade Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Ticker do Ativo</label>
              <Input
                placeholder="Ex: PETR4"
                {...register('ticker')}
                className="font-mono uppercase text-sm"
              />
              {errors.ticker && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.ticker.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Data da Operação</label>
              <Input type="date" {...register('tradeDate')} className="text-sm font-mono" />
              {errors.tradeDate && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.tradeDate.message}</p>
              )}
            </div>
          </div>

          {/* Quantity & Unit Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Quantidade</label>
              <Input
                type="number"
                step="any"
                placeholder="100"
                {...register('quantity')}
                className="font-mono text-sm"
              />
              {errors.quantity && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Preço Unitário (R$)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="38.50"
                {...register('unitPrice')}
                className="font-mono text-sm"
              />
              {errors.unitPrice && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.unitPrice.message}</p>
              )}
            </div>
          </div>

          {/* Fees */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">
              Taxas B3 / Corretagem (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('fees')}
              className="font-mono text-sm"
            />
            {errors.fees && <p className="text-rose-400 text-[11px] mt-1">{errors.fees.message}</p>}
          </div>

          {/* Financial Calculation Banner */}
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Total Financeiro Estimado:</span>
            <span className="text-base font-bold text-white font-mono">
              {formatCurrency(totalFinancial)}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">
              Observações (Opcional)
            </label>
            <Input
              placeholder="Ex: Ordem executada via Home Broker XP"
              {...register('notes')}
              className="text-xs"
            />
            {errors.notes && <p className="text-rose-400 text-[11px] mt-1">{errors.notes.message}</p>}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || serverSuccess}
              className={`gap-1.5 ${
                watchedType === 'COMPRA' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {watchedType === 'COMPRA' ? 'Confirmar Compra' : 'Confirmar Venda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
