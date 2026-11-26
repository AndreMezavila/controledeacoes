import { User, WatchlistAsset, Transaction, OperationType } from '@/types';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByVerificationToken(token: string): Promise<User | null>;
  findByVerificationCode(email: string, code: string): Promise<User | null>;
  create(userData: {
    id: string;
    name: string | null;
    email: string;
    password?: string | null;
    emailVerified?: string | null;
    verificationToken?: string | null;
    verificationCode?: string | null;
    image?: string | null;
  }): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  verifyEmail(id: string): Promise<boolean>;
}

export interface IWatchlistRepository {
  findByUserId(userId: string): Promise<WatchlistAsset[]>;
  findById(userId: string, id: string): Promise<WatchlistAsset | null>;
  findByTicker(userId: string, ticker: string): Promise<WatchlistAsset | null>;
  create(
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
  ): Promise<WatchlistAsset>;
  update(
    userId: string,
    id: string,
    data: Partial<{
      assetName: string | null;
      targetBuyPrice: number;
      targetSellPrice: number;
      stopLossPrice: number | null;
      notes: string | null;
    }>
  ): Promise<WatchlistAsset | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

export interface ITransactionRepository {
  findByUserId(
    userId: string,
    filters?: { ticker?: string; type?: OperationType }
  ): Promise<Transaction[]>;
  findById(userId: string, id: string): Promise<Transaction | null>;
  create(
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
  ): Promise<Transaction>;
  delete(userId: string, id: string): Promise<boolean>;
}

export interface IRepositoryFactory {
  users: IUserRepository;
  watchlist: IWatchlistRepository;
  transactions: ITransactionRepository;
}
