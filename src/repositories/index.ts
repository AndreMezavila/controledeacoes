import { IRepositoryFactory } from './types';
import { sqliteRepositoryFactory } from './sqlite.repository';
import { supabaseRepositoryFactory } from './supabase.repository';

export function getRepository(): IRepositoryFactory {
  const provider = process.env.DB_PROVIDER?.toLowerCase();
  if (provider === 'supabase') {
    return supabaseRepositoryFactory;
  }
  return sqliteRepositoryFactory;
}

export const dbRepository = {
  get users() {
    return getRepository().users;
  },
  get watchlist() {
    return getRepository().watchlist;
  },
  get transactions() {
    return getRepository().transactions;
  },
};
