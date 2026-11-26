import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').trim().toLowerCase(),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').trim(),
    email: z.string().email('E-mail inválido').trim().toLowerCase(),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirmação de senha necessária'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const transactionSchema = z.object({
  ticker: z
    .string()
    .min(3, 'Ticker deve ter pelo menos 3 caracteres')
    .max(10, 'Ticker deve ter no máximo 10 caracteres')
    .toUpperCase()
    .trim(),
  type: z.enum(['COMPRA', 'VENDA'], {
    required_error: 'Selecione o tipo de operação',
  }),
  quantity: z
    .coerce
    .number({ invalid_type_error: 'Informe uma quantidade numérica válida' })
    .positive('A quantidade deve ser estritamente maior que zero'),
  unitPrice: z
    .coerce
    .number({ invalid_type_error: 'Informe um preço unitário válido' })
    .positive('O preço unitário deve ser maior que zero'),
  fees: z
    .coerce
    .number({ invalid_type_error: 'Informe o valor de taxas válido' })
    .min(0, 'Taxas não podem ser negativas')
    .default(0),
  tradeDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data da operação deve estar no formato AAAA-MM-DD'),
  notes: z.string().max(300, 'Observações devem ter até 300 caracteres').optional().nullable(),
});

export const watchlistSchema = z
  .object({
    ticker: z
      .string()
      .min(3, 'Ticker deve ter pelo menos 3 caracteres')
      .max(10, 'Ticker deve ter no máximo 10 caracteres')
      .toUpperCase()
      .trim(),
    assetName: z.string().max(80).optional().nullable(),
    targetBuyPrice: z
      .coerce
      .number({ invalid_type_error: 'Preço-teto de compra inválido' })
      .positive('Preço-teto de compra deve ser maior que zero'),
    targetSellPrice: z
      .coerce
      .number({ invalid_type_error: 'Preço-alvo de venda inválido' })
      .positive('Preço-alvo de venda deve ser maior que zero'),
    stopLossPrice: z
      .coerce
      .number({ invalid_type_error: 'Stop loss inválido' })
      .positive('Stop loss deve ser maior que zero')
      .optional()
      .nullable(),
    notes: z.string().max(300, 'Observações devem ter até 300 caracteres').optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.targetSellPrice && data.targetBuyPrice) {
        return data.targetSellPrice > data.targetBuyPrice;
      }
      return true;
    },
    {
      message: 'O preço-alvo de venda deve ser maior que o preço-teto de compra',
      path: ['targetSellPrice'],
    }
  );

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type WatchlistInput = z.infer<typeof watchlistSchema>;
