import { eq, and, desc } from 'drizzle-orm';
import { getLibsqlDb } from '@/db/client';
import { users, watchlistAssets, transactions } from '@/db/schema.sqlite';
import { ensureSqliteSchema } from '@/db/init-sqlite';
import {
  IUserRepository,
  IWatchlistRepository,
  ITransactionRepository,
  IRepositoryFactory,
} from './types';
import { User, WatchlistAsset, Transaction, OperationType } from '@/types';

let schemaInitialized = false;
async function ensureDb() {
  if (!schemaInitialized) {
    await ensureSqliteSchema();
    schemaInitialized = true;
  }
  return getLibsqlDb();
}

export class SqliteUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const db = await ensureDb();
    const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      password: rows[0].password,
      emailVerified: rows[0].emailVerified,
      verificationToken: rows[0].verificationToken,
      verificationCode: rows[0].verificationCode,
      image: rows[0].image,
      createdAt: rows[0].createdAt,
      updatedAt: rows[0].updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const db = await ensureDb();
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      password: rows[0].password,
      emailVerified: rows[0].emailVerified,
      verificationToken: rows[0].verificationToken,
      verificationCode: rows[0].verificationCode,
      image: rows[0].image,
      createdAt: rows[0].createdAt,
      updatedAt: rows[0].updatedAt,
    };
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const db = await ensureDb();
    const rows = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      password: rows[0].password,
      emailVerified: rows[0].emailVerified,
      verificationToken: rows[0].verificationToken,
      verificationCode: rows[0].verificationCode,
      image: rows[0].image,
      createdAt: rows[0].createdAt,
      updatedAt: rows[0].updatedAt,
    };
  }

  async findByVerificationCode(email: string, code: string): Promise<User | null> {
    const db = await ensureDb();
    const rows = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email.toLowerCase()), eq(users.verificationCode, code)))
      .limit(1);
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      password: rows[0].password,
      emailVerified: rows[0].emailVerified,
      verificationToken: rows[0].verificationToken,
      verificationCode: rows[0].verificationCode,
      image: rows[0].image,
      createdAt: rows[0].createdAt,
      updatedAt: rows[0].updatedAt,
    };
  }

  async create(userData: {
    id: string;
    name: string | null;
    email: string;
    password?: string | null;
    emailVerified?: string | null;
    verificationToken?: string | null;
    verificationCode?: string | null;
    image?: string | null;
  }): Promise<User> {
    const db = await ensureDb();
    const now = new Date().toISOString();
    await db.insert(users).values({
      id: userData.id,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password || null,
      emailVerified: userData.emailVerified || null,
      verificationToken: userData.verificationToken || null,
      verificationCode: userData.verificationCode || null,
      image: userData.image || null,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      emailVerified: userData.emailVerified || null,
      verificationToken: userData.verificationToken || null,
      verificationCode: userData.verificationCode || null,
      image: userData.image || null,
      createdAt: now,
      updatedAt: now,
    };
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const db = await ensureDb();
    const now = new Date().toISOString();
    await db
      .update(users)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email.toLowerCase() }),
        ...(data.password !== undefined && { password: data.password }),
        ...(data.emailVerified !== undefined && { emailVerified: data.emailVerified }),
        ...(data.verificationToken !== undefined && { verificationToken: data.verificationToken }),
        ...(data.verificationCode !== undefined && { verificationCode: data.verificationCode }),
        ...(data.image !== undefined && { image: data.image }),
        updatedAt: now,
      })
      .where(eq(users.id, id));

    return this.findById(id);
  }

  async verifyEmail(id: string): Promise<boolean> {
    const db = await ensureDb();
    const now = new Date().toISOString();
    const res = await db
      .update(users)
      .set({
        emailVerified: now,
        verificationToken: null,
        verificationCode: null,
        updatedAt: now,
      })
      .where(eq(users.id, id));
    return (res.rowsAffected ?? 1) > 0;
  }
}

export class SqliteWatchlistRepository implements IWatchlistRepository {
  async findByUserId(userId: string): Promise<WatchlistAsset[]> {
    const db = await ensureDb();
    const rows = await db
      .select()
      .from(watchlistAssets)
      .where(eq(watchlistAssets.userId, userId))
      .orderBy(watchlistAssets.ticker);

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      ticker: r.ticker.toUpperCase(),
      assetName: r.assetName,
      targetBuyPrice: r.targetBuyPrice,
      targetSellPrice: r.targetSellPrice,
      stopLossPrice: r.stopLossPrice,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async findById(userId: string, id: string): Promise<WatchlistAsset | null> {
    const db = await ensureDb();
    const rows = await db
      .select()
      .from(watchlistAssets)
      .where(and(eq(watchlistAssets.userId, userId), eq(watchlistAssets.id, id)))
      .limit(1);

    if (!rows[0]) return null;
    const r = rows[0];
    return {
      id: r.id,
      userId: r.userId,
      ticker: r.ticker.toUpperCase(),
      assetName: r.assetName,
      targetBuyPrice: r.targetBuyPrice,
      targetSellPrice: r.targetSellPrice,
      stopLossPrice: r.stopLossPrice,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async findByTicker(userId: string, ticker: string): Promise<WatchlistAsset | null> {
    const db = await ensureDb();
    const rows = await db
      .select()
      .from(watchlistAssets)
      .where(and(eq(watchlistAssets.userId, userId), eq(watchlistAssets.ticker, ticker.toUpperCase())))
      .limit(1);

    if (!rows[0]) return null;
    const r = rows[0];
    return {
      id: r.id,
      userId: r.userId,
      ticker: r.ticker.toUpperCase(),
      assetName: r.assetName,
      targetBuyPrice: r.targetBuyPrice,
      targetSellPrice: r.targetSellPrice,
      stopLossPrice: r.stopLossPrice,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async create(
    userId: string,
    data: {
      id?: string;
      ticker: string;
      assetName?: string | null;
      targetBuyPrice: number;
      targetSellPrice: number;
      stopLossPrice?: number | null;
      notes?: string | null;
    }
  ): Promise<WatchlistAsset> {
    const db = await ensureDb();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(watchlistAssets).values({
      id,
      userId,
      ticker: data.ticker.toUpperCase().trim(),
      assetName: data.assetName || null,
      targetBuyPrice: data.targetBuyPrice,
      targetSellPrice: data.targetSellPrice,
      stopLossPrice: data.stopLossPrice ?? null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      userId,
      ticker: data.ticker.toUpperCase().trim(),
      assetName: data.assetName || null,
      targetBuyPrice: data.targetBuyPrice,
      targetSellPrice: data.targetSellPrice,
      stopLossPrice: data.stopLossPrice ?? null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };
  }

  async update(
    userId: string,
    id: string,
    data: Partial<{
      assetName: string | null;
      targetBuyPrice: number;
      targetSellPrice: number;
      stopLossPrice: number | null;
      notes: string | null;
    }>
  ): Promise<WatchlistAsset | null> {
    const db = await ensureDb();
    const now = new Date().toISOString();

    await db
      .update(watchlistAssets)
      .set({
        ...(data.assetName !== undefined && { assetName: data.assetName }),
        ...(data.targetBuyPrice !== undefined && { targetBuyPrice: data.targetBuyPrice }),
        ...(data.targetSellPrice !== undefined && { targetSellPrice: data.targetSellPrice }),
        ...(data.stopLossPrice !== undefined && { stopLossPrice: data.stopLossPrice }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updatedAt: now,
      })
      .where(and(eq(watchlistAssets.userId, userId), eq(watchlistAssets.id, id)));

    return this.findById(userId, id);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const db = await ensureDb();
    const res = await db
      .delete(watchlistAssets)
      .where(and(eq(watchlistAssets.userId, userId), eq(watchlistAssets.id, id)));
    return (res.rowsAffected ?? 1) > 0;
  }
}

export class SqliteTransactionRepository implements ITransactionRepository {
  async findByUserId(
    userId: string,
    filters?: { ticker?: string; type?: OperationType }
  ): Promise<Transaction[]> {
    const db = await ensureDb();
    const conditions = [eq(transactions.userId, userId)];

    if (filters?.ticker) {
      conditions.push(eq(transactions.ticker, filters.ticker.toUpperCase()));
    }
    if (filters?.type) {
      conditions.push(eq(transactions.type, filters.type));
    }

    const rows = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.tradeDate), desc(transactions.createdAt));

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      ticker: r.ticker.toUpperCase(),
      type: r.type as OperationType,
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      fees: r.fees,
      tradeDate: r.tradeDate,
      notes: r.notes,
      createdAt: r.createdAt,
    }));
  }

  async findById(userId: string, id: string): Promise<Transaction | null> {
    const db = await ensureDb();
    const rows = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.id, id)))
      .limit(1);

    if (!rows[0]) return null;
    const r = rows[0];
    return {
      id: r.id,
      userId: r.userId,
      ticker: r.ticker.toUpperCase(),
      type: r.type as OperationType,
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      fees: r.fees,
      tradeDate: r.tradeDate,
      notes: r.notes,
      createdAt: r.createdAt,
    };
  }

  async create(
    userId: string,
    data: {
      id?: string;
      ticker: string;
      type: OperationType;
      quantity: number;
      unitPrice: number;
      fees: number;
      tradeDate: string;
      notes?: string | null;
    }
  ): Promise<Transaction> {
    const db = await ensureDb();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(transactions).values({
      id,
      userId,
      ticker: data.ticker.toUpperCase().trim(),
      type: data.type,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      fees: data.fees,
      tradeDate: data.tradeDate,
      notes: data.notes || null,
      createdAt: now,
    });

    return {
      id,
      userId,
      ticker: data.ticker.toUpperCase().trim(),
      type: data.type,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      fees: data.fees,
      tradeDate: data.tradeDate,
      notes: data.notes || null,
      createdAt: now,
    };
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const db = await ensureDb();
    const res = await db
      .delete(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.id, id)));
    return (res.rowsAffected ?? 1) > 0;
  }
}

export const sqliteRepositoryFactory: IRepositoryFactory = {
  users: new SqliteUserRepository(),
  watchlist: new SqliteWatchlistRepository(),
  transactions: new SqliteTransactionRepository(),
};
