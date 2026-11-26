'use server';

import { auth } from '@/auth';
import { dbRepository } from '@/repositories';
import { transactionSchema, TransactionInput } from '@/lib/validations';
import { PortfolioService } from '@/services/portfolio.service';
import { revalidatePath } from 'next/cache';

export async function createTransactionAction(data: TransactionInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Sessão expirada ou usuário não autenticado.' };
  }

  const userId = session.user.id;
  const parsed = transactionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Dados inválidos' };
  }

  const { ticker, type, quantity, unitPrice, fees, tradeDate, notes } = parsed.data;

  // Strict Business Rule: If operation is VENDA, verify user has sufficient custody
  if (type === 'VENDA') {
    const userTransactions = await dbRepository.transactions.findByUserId(userId, { ticker });
    const position = PortfolioService.calculateTickerPosition(ticker, userTransactions);

    if (quantity > position.quantity) {
      return {
        success: false,
        error: `Saldo insuficiente em custódia. Você possui atualmente ${position.quantity} ações de ${ticker}, não sendo possível vender ${quantity}.`,
      };
    }
  }

  try {
    const created = await dbRepository.transactions.create(userId, {
      ticker,
      type,
      quantity,
      unitPrice,
      fees,
      tradeDate,
      notes,
    });

    revalidatePath('/dashboard');
    revalidatePath('/operacoes');
    revalidatePath('/carteira');

    return { success: true, transaction: created };
  } catch (err) {
    console.error('Erro ao registrar transação:', err);
    return { success: false, error: 'Falha interna ao registrar a transação no banco.' };
  }
}

export async function deleteTransactionAction(transactionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Sessão expirada ou usuário não autenticado.' };
  }

  const userId = session.user.id;

  try {
    const deleted = await dbRepository.transactions.delete(userId, transactionId);
    if (!deleted) {
      return { success: false, error: 'Transação não encontrada ou você não tem permissão para excluí-la.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/operacoes');
    revalidatePath('/carteira');

    return { success: true };
  } catch (err) {
    console.error('Erro ao deletar transação:', err);
    return { success: false, error: 'Falha ao excluir a transação.' };
  }
}
