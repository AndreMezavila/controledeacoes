'use server';

import { auth } from '@/auth';
import { dbRepository } from '@/repositories';
import { watchlistSchema, WatchlistInput } from '@/lib/validations';
import { MarketDataService } from '@/services/market-data.service';
import { revalidatePath } from 'next/cache';

export async function addWatchlistAction(data: WatchlistInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Sessão expirada ou usuário não autenticado.' };
  }

  const userId = session.user.id;
  const parsed = watchlistSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Dados inválidos' };
  }

  const { ticker, assetName, targetBuyPrice, targetSellPrice, stopLossPrice, notes } = parsed.data;

  try {
    const existing = await dbRepository.watchlist.findByTicker(userId, ticker);
    if (existing) {
      return { success: false, error: `O ativo ${ticker} já está na sua lista de monitoramento.` };
    }

    const defaultName = assetName || MarketDataService.getAssetName(ticker);

    const created = await dbRepository.watchlist.create(userId, {
      ticker,
      assetName: defaultName,
      targetBuyPrice,
      targetSellPrice,
      stopLossPrice: stopLossPrice ?? null,
      notes,
    });

    revalidatePath('/dashboard');
    revalidatePath('/monitorados');

    return { success: true, asset: created };
  } catch (err) {
    console.error('Erro ao adicionar ativo monitorado:', err);
    return { success: false, error: 'Falha ao salvar ativo na lista de monitoramento.' };
  }
}

export async function updateWatchlistAction(id: string, data: Partial<WatchlistInput>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Sessão expirada ou usuário não autenticado.' };
  }

  const userId = session.user.id;

  try {
    const updated = await dbRepository.watchlist.update(userId, id, {
      assetName: data.assetName,
      targetBuyPrice: data.targetBuyPrice,
      targetSellPrice: data.targetSellPrice,
      stopLossPrice: data.stopLossPrice ?? null,
      notes: data.notes,
    });

    if (!updated) {
      return { success: false, error: 'Ativo não encontrado ou sem permissão para edição.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/monitorados');

    return { success: true, asset: updated };
  } catch (err) {
    console.error('Erro ao atualizar ativo:', err);
    return { success: false, error: 'Falha ao atualizar parâmetros do ativo.' };
  }
}

export async function deleteWatchlistAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Sessão expirada ou usuário não autenticado.' };
  }

  const userId = session.user.id;

  try {
    const deleted = await dbRepository.watchlist.delete(userId, id);
    if (!deleted) {
      return { success: false, error: 'Ativo não encontrado ou sem permissão para exclusão.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/monitorados');

    return { success: true };
  } catch (err) {
    console.error('Erro ao excluir ativo monitorado:', err);
    return { success: false, error: 'Falha ao excluir o ativo.' };
  }
}
