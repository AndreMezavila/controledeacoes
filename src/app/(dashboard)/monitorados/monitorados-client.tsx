'use client';

import * as React from 'react';
import { WatchlistAsset } from '@/types';
import { WatchlistTable } from '@/components/watchlist-table';
import { WatchlistModal } from '@/components/watchlist-modal';
import { Button } from '@/components/ui/button';
import { PlusCircle, Sliders } from 'lucide-react';

interface MonitoradosClientProps {
  watchlist: WatchlistAsset[];
}

export function MonitoradosClient({ watchlist }: MonitoradosClientProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Sliders className="h-6 w-6 text-emerald-400" />
            Ativos Monitorados & Gatilhos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure seu Preço-Teto (para comprar barato) e seu Preço-Alvo (para realizar lucros na venda).
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Adicionar Ativo
        </Button>
      </div>

      <WatchlistTable assets={watchlist} />

      <WatchlistModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
