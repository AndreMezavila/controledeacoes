import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as sqliteSchema from './schema.sqlite';
import * as pgSchema from './schema.pg';

export const isSupabase = process.env.DB_PROVIDER === 'supabase';

// Global singletons to prevent connection exhaustion in Next.js HMR and Serverless
declare global {
  // eslint-disable-next-line no-var
  var __sqliteClient: ReturnType<typeof createClient> | undefined;
  // eslint-disable-next-line no-var
  var __postgresClient: ReturnType<typeof postgres> | undefined;
}

export function getLibsqlDb() {
  const url = process.env.SQLITE_DB_URL || 'file:local.db';
  if (!global.__sqliteClient) {
    global.__sqliteClient = createClient({
      url,
    });
  }
  return drizzleLibsql(global.__sqliteClient, { schema: sqliteSchema });
}

export function getPostgresDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables for DB_PROVIDER=supabase.');
  }

  if (!global.__postgresClient) {
    // Supabase Transaction Pooler (Port 6543) requires prepare: false
    global.__postgresClient = postgres(connectionString, {
      prepare: false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  return drizzlePostgres(global.__postgresClient, { schema: pgSchema });
}
