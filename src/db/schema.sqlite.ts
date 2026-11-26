import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password'),
  emailVerified: text('email_verified'),
  verificationToken: text('verification_token'),
  verificationCode: text('verification_code'),
  image: text('image'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const watchlistAssets = sqliteTable('watchlist_assets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  assetName: text('asset_name'),
  targetBuyPrice: real('target_buy_price').notNull(),
  targetSellPrice: real('target_sell_price').notNull(),
  stopLossPrice: real('stop_loss_price'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  type: text('type', { enum: ['COMPRA', 'VENDA'] }).notNull(),
  quantity: real('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  fees: real('fees').default(0).notNull(),
  tradeDate: text('trade_date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type SqliteUser = typeof users.$inferSelect;
export type SqliteNewUser = typeof users.$inferInsert;
export type SqliteWatchlistAsset = typeof watchlistAssets.$inferSelect;
export type SqliteNewWatchlistAsset = typeof watchlistAssets.$inferInsert;
export type SqliteTransaction = typeof transactions.$inferSelect;
export type SqliteNewTransaction = typeof transactions.$inferInsert;
