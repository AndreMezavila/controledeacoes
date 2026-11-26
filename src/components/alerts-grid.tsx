'use client';

import * as React from 'react';
import { AlertItem, AlertStatus } from '@/types';
import { AlertCard } from './alert-card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, SlidersHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';

interface AlertsGridProps {
  alerts: AlertItem[];
  onOpenTradeModal?: (ticker?: string, type?: 'COMPRA' | 'VENDA', price?: number) => void;
}

export function AlertsGrid({ alerts, onOpenTradeModal }: AlertsGridProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredAlerts = React.useMemo(() => {
    return alerts.filter((item) => {
      // Status filter
      if (selectedFilter !== 'TODOS') {
        if (selectedFilter === 'VENDER' && (item.status === 'VENDER' || item.status === 'STOP_LOSS')) {
          // match
        } else if (item.status !== selectedFilter) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toUpperCase().trim();
        return (
          item.ticker.includes(query) ||
          (item.assetName && item.assetName.toUpperCase().includes(query))
        );
      }

      return true;
    });
  }, [alerts, selectedFilter, searchQuery]);

  const counts = React.useMemo(() => {
    return {
      TODOS: alerts.length,
      COMPRAR: alerts.filter((a) => a.status === 'COMPRAR').length,
      VENDER: alerts.filter((a) => a.status === 'VENDER' || a.status === 'STOP_LOSS').length,
      MANTER: alerts.filter((a) => a.status === 'MANTER').length,
      AGUARDAR: alerts.filter((a) => a.status === 'AGUARDAR').length,
    };
  }, [alerts]);

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {(['TODOS', 'COMPRAR', 'VENDER', 'MANTER', 'AGUARDAR'] as const).map((filter) => {
            const count = counts[filter];
            const isActive = selectedFilter === filter;

            let activeColor = 'bg-zinc-800 text-white';
            if (isActive) {
              if (filter === 'COMPRAR') activeColor = 'bg-emerald-600 text-white font-bold';
              else if (filter === 'VENDER') activeColor = 'bg-indigo-600 text-white font-bold';
              else if (filter === 'MANTER') activeColor = 'bg-amber-600 text-white font-bold';
              else if (filter === 'AGUARDAR') activeColor = 'bg-zinc-700 text-white font-bold';
            }

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? activeColor
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
                }`}
              >
                <span>{filter}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Buscar ativo (ex: PETR4)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-zinc-900/70 border-zinc-800"
          />
        </div>
      </div>

      {/* Grid of Alert Cards */}
      {filteredAlerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onSelectAction={(ticker, type, price) => {
                onOpenTradeModal?.(ticker, type, price);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
          <SlidersHorizontal className="mx-auto h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-200">Nenhum alerta encontrado</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            {alerts.length === 0
              ? 'Você ainda não cadastrou nenhum ativo na sua lista de monitoramento. Adicione seus primeiros ativos para receber recomendações de Compra e Venda.'
              : 'Nenhum ativo monitorado corresponde ao filtro selecionado no momento.'}
          </p>

          {alerts.length === 0 && (
            <div className="mt-5">
              <Link href="/monitorados">
                <Button size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Cadastrar Ativo para Monitorar
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
