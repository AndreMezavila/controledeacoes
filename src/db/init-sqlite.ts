import { createClient } from '@libsql/client';

export async function ensureSqliteSchema() {
  const url = process.env.SQLITE_DB_URL || 'file:local.db';
  const client = createClient({ url });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      email_verified TEXT,
      verification_token TEXT,
      verification_code TEXT,
      image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // Alter table if columns don't exist yet in existing database
  try {
    await client.execute(`ALTER TABLE users ADD COLUMN email_verified TEXT;`);
  } catch {}
  try {
    await client.execute(`ALTER TABLE users ADD COLUMN verification_token TEXT;`);
  } catch {}
  try {
    await client.execute(`ALTER TABLE users ADD COLUMN verification_code TEXT;`);
  } catch {}
  try {
    await client.execute(`ALTER TABLE users ADD COLUMN image TEXT;`);
  } catch {}

  await client.execute(`
    CREATE TABLE IF NOT EXISTS watchlist_assets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ticker TEXT NOT NULL,
      asset_name TEXT,
      target_buy_price REAL NOT NULL,
      target_sell_price REAL NOT NULL,
      stop_loss_price REAL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ticker TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      fees REAL DEFAULT 0 NOT NULL,
      trade_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  await client.execute(`CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist_assets(user_id);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_trans_user ON transactions(user_id);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_trans_ticker ON transactions(ticker);`);
}
