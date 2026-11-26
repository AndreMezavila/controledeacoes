import { pgTable, text, doublePrecision, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password'),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  verificationToken: text('verification_token'),
  verificationCode: text('verification_code'),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const watchlistAssets = pgTable('watchlist_assets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  assetName: text('asset_name'),
  targetBuyPrice: doublePrecision('target_buy_price').notNull(),
  targetSellPrice: doublePrecision('target_sell_price').notNull(),
  stopLossPrice: doublePrecision('stop_loss_price'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  type: text('type', { enum: ['COMPRA', 'VENDA'] }).notNull(),
  quantity: doublePrecision('quantity').notNull(),
  unitPrice: doublePrecision('unit_price').notNull(),
  fees: doublePrecision('fees').default(0).notNull(),
  tradeDate: text('trade_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type PgUser = typeof users.$inferSelect;
export type PgNewUser = typeof users.$inferInsert;
export type PgWatchlistAsset = typeof watchlistAssets.$inferSelect;
export type PgNewWatchlistAsset = typeof watchlistAssets.$inferInsert;
export type PgTransaction = typeof transactions.$inferSelect;
export type PgNewTransaction = typeof transactions.$inferInsert;
