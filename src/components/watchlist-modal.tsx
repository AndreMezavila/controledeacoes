'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { watchlistSchema, WatchlistInput } from '@/lib/validations';
import { addWatchlistAction } from '@/actions/watchlist.actions';
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
import { Sliders, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface WatchlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WatchlistModal({ open, onOpenChange }: WatchlistModalProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WatchlistInput>({
    resolver: zodResolver(watchlistSchema),
    defaultValues: {
      ticker: '',
      assetName: '',
      targetBuyPrice: 0,
      targetSellPrice: 0,
      stopLossPrice: null,
      notes: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      setServerSuccess(false);
      reset({
        ticker: '',
        assetName: '',
        targetBuyPrice: 0,
        targetSellPrice: 0,
        stopLossPrice: null,
        notes: '',
      });
    }
  }, [open, reset]);

  const onSubmit = async (values: WatchlistInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await addWatchlistAction(values);
      if (!res.success) {
        setServerError(res.error || 'Erro ao adicionar ativo.');
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
            <Sliders className="h-5 w-5 text-emerald-400" />
            Cadastrar Ativo para Monitorar
          </DialogTitle>
          <DialogDescription>
            Defina o código do ativo e os gatilhos de preço para receber recomendações de Compra, Venda ou Stop Loss.
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
            <span>Ativo adicionado com sucesso ao monitoramento!</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Ticker / Código</label>
              <Input
                placeholder="Ex: PETR4, AAPL"
                {...register('ticker')}
                className="font-mono uppercase text-sm"
              />
              {errors.ticker && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.ticker.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Nome / Descrição</label>
              <Input
                placeholder="Ex: Petrobras PN"
                {...register('assetName')}
                className="text-xs"
              />
              {errors.assetName && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.assetName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-emerald-400 block mb-1">
                Preço-Teto de Compra (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="35.00"
                {...register('targetBuyPrice')}
                className="font-mono text-sm border-emerald-900/60 focus-visible:border-emerald-500"
              />
              {errors.targetBuyPrice && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.targetBuyPrice.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-indigo-400 block mb-1">
                Preço-Alvo de Venda (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="45.00"
                {...register('targetSellPrice')}
                className="font-mono text-sm border-indigo-900/60 focus-visible:border-indigo-500"
              />
              {errors.targetSellPrice && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.targetSellPrice.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-rose-400 block mb-1">
              Stop Loss de Proteção (R$) - Opcional
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="Ex: 30.00"
              {...register('stopLossPrice')}
              className="font-mono text-sm border-rose-950 focus-visible:border-rose-500"
            />
            {errors.stopLossPrice && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.stopLossPrice.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">
              Tese de Investimento / Observações
            </label>
            <Input
              placeholder="Ex: Dividend Yield projetado acima de 10% a.a."
              {...register('notes')}
              className="text-xs"
            />
            {errors.notes && (
              <p className="text-rose-400 text-[11px] mt-1">{errors.notes.message}</p>
            )}
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
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Salvar Monitoramento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
