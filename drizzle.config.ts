import { defineConfig } from 'drizzle-kit';

const isSupabase = process.env.DB_PROVIDER === 'supabase';

export default defineConfig({
  schema: isSupabase ? './src/db/schema.pg.ts' : './src/db/schema.sqlite.ts',
  out: './drizzle',
  dialect: isSupabase ? 'postgresql' : 'sqlite',
  dbCredentials: isSupabase
    ? {
        url: process.env.DATABASE_URL || '',
      }
    : {
        url: process.env.SQLITE_DB_URL || 'file:local.db',
      },
});
