import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const url = process.env.SQLITE_DB_URL || 'file:local.db';
const client = createClient({ url });

async function seed() {
  console.log('--- Iniciando Seed do Banco Local (SQLite) ---');

  // 1. Criar tabelas se não existirem
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

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

  // 2. Criar Usuário Demo
  const demoUserId = 'usr_demo_investor_01';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);
  const now = new Date().toISOString();

  await client.execute({
    sql: `
      INSERT INTO users (id, name, email, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET password = excluded.password;
    `,
    args: [demoUserId, 'Investidor Demo', 'investidor@demo.com', hashedPassword, now, now],
  });

  console.log('✓ Usuário criado: investidor@demo.com (senha: 123456)');

  // 3. Limpar dados anteriores do usuário demo para seed limpo
  await client.execute({
    sql: 'DELETE FROM watchlist_assets WHERE user_id = ?;',
    args: [demoUserId],
  });
  await client.execute({
    sql: 'DELETE FROM transactions WHERE user_id = ?;',
    args: [demoUserId],
  });

  // 4. Inserir Ativos Monitorados (Watchlist) com gatilhos reais
  const sampleWatchlist = [
    {
      id: 'wl_01',
      ticker: 'PETR4',
      asset_name: 'Petrobras PN',
      target_buy_price: 39.50, // Cotação ~38.45 -> COMPRAR!
      target_sell_price: 44.00,
      stop_loss_price: 33.00,
      notes: 'Fluxo forte de dividendos e bom valuation.',
    },
    {
      id: 'wl_02',
      ticker: 'VALE3',
      asset_name: 'Vale ON',
      target_buy_price: 55.00, // Cotação ~61.20 -> AGUARDAR
      target_sell_price: 68.00,
      stop_loss_price: 49.00,
      notes: 'Dependente da demanda chinesa de minério.',
    },
    {
      id: 'wl_03',
      ticker: 'ITUB4',
      asset_name: 'Itaú Unibanco PN',
      target_buy_price: 32.00, // Cotação ~34.80 -> MANTER (em carteira)
      target_sell_price: 38.00,
      stop_loss_price: 29.00,
      notes: 'Líder em rentabilidade bancária no Brasil.',
    },
    {
      id: 'wl_04',
      ticker: 'WEGE3',
      asset_name: 'WEG ON',
      target_buy_price: 48.00, // Cotação ~54.10 -> VENDER (alvo alcançado)
      target_sell_price: 53.00,
      stop_loss_price: 42.00,
      notes: 'Empresa de alta qualidade secular.',
    },
    {
      id: 'wl_05',
      ticker: 'IVVB11',
      asset_name: 'iShares S&P 500 ETF',
      target_buy_price: 350.00, // Cotação ~345.50 -> COMPRAR!
      target_sell_price: 400.00,
      stop_loss_price: 310.00,
      notes: 'Diversificação cambial em dólar e mercado global.',
    },
  ];

  for (const item of sampleWatchlist) {
    await client.execute({
      sql: `
        INSERT INTO watchlist_assets (id, user_id, ticker, asset_name, target_buy_price, target_sell_price, stop_loss_price, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        item.id,
        demoUserId,
        item.ticker,
        item.asset_name,
        item.target_buy_price,
        item.target_sell_price,
        item.stop_loss_price,
        item.notes,
        now,
        now,
      ],
    });
  }
  console.log(`✓ ${sampleWatchlist.length} ativos monitorados inseridos.`);

  // 5. Inserir Operações Históricas (Compras e Vendas)
  const sampleTransactions = [
    // Operação 1: Compra inicial de PETR4
    {
      id: 'tx_01',
      ticker: 'PETR4',
      type: 'COMPRA',
      quantity: 200,
      unit_price: 36.20,
      fees: 4.50,
      trade_date: '2026-09-10',
      notes: 'Primeira entrada estratégica',
    },
    // Operação 2: Segunda compra de PETR4
    {
      id: 'tx_02',
      ticker: 'PETR4',
      type: 'COMPRA',
      quantity: 100,
      unit_price: 37.10,
      fees: 2.25,
      trade_date: '2026-10-15',
      notes: 'Aporte mensal',
    },
    // Operação 3: Compra de ITUB4
    {
      id: 'tx_03',
      ticker: 'ITUB4',
      type: 'COMPRA',
      quantity: 300,
      unit_price: 31.80,
      fees: 6.00,
      trade_date: '2026-08-05',
      notes: 'Posição fundamentalista',
    },
    // Operação 4: Compra de WEGE3
    {
      id: 'tx_04',
      ticker: 'WEGE3',
      type: 'COMPRA',
      quantity: 150,
      unit_price: 46.50,
      fees: 3.80,
      trade_date: '2026-07-20',
      notes: 'Entrada em correção',
    },
    // Operação 5: Venda parcial de WEGE3 com realização de lucro
    {
      id: 'tx_05',
      ticker: 'WEGE3',
      type: 'VENDA',
      quantity: 50,
      unit_price: 54.00,
      fees: 2.50,
      trade_date: '2026-11-18',
      notes: 'Realização de lucro parcial no alvo',
    },
  ];

  for (const tx of sampleTransactions) {
    await client.execute({
      sql: `
        INSERT INTO transactions (id, user_id, ticker, type, quantity, unit_price, fees, trade_date, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        tx.id,
        demoUserId,
        tx.ticker,
        tx.type,
        tx.quantity,
        tx.unit_price,
        tx.fees,
        tx.trade_date,
        tx.notes,
        now,
      ],
    });
  }
  console.log(`✓ ${sampleTransactions.length} operações registradas.`);
  console.log('--- Seed finalizado com sucesso! ---');
}

seed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
