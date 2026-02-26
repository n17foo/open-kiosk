import type { SQLiteDatabase } from 'expo-sqlite';

export const LATEST_DB_VERSION = 1;

export async function initializeSchema(database: SQLiteDatabase): Promise<void> {
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;
  if (currentVersion < LATEST_DB_VERSION) {
    await migrateDatabase(database, currentVersion, LATEST_DB_VERSION);
  }
}

async function migrateDatabase(database: SQLiteDatabase, fromVersion: number, toVersion: number): Promise<void> {
  await database.withTransactionAsync(async () => {
    if (fromVersion < 1) {
      // v1: Base tables
      await database.runAsync(`
        CREATE TABLE IF NOT EXISTS key_value_store (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
        )
      `);

      await database.runAsync(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY NOT NULL,
          platform TEXT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL DEFAULT 0,
          image_url TEXT,
          category_id TEXT,
          sku TEXT,
          barcode TEXT,
          in_stock INTEGER NOT NULL DEFAULT 1,
          stock_quantity INTEGER,
          sync_status TEXT NOT NULL DEFAULT 'synced',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);

      await database.runAsync(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY NOT NULL,
          platform TEXT,
          platform_order_id TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          subtotal REAL NOT NULL DEFAULT 0,
          tax REAL NOT NULL DEFAULT 0,
          total REAL NOT NULL DEFAULT 0,
          currency TEXT NOT NULL DEFAULT 'GBP',
          customer_name TEXT,
          customer_email TEXT,
          payment_method TEXT,
          payment_transaction_id TEXT,
          sync_status TEXT NOT NULL DEFAULT 'pending',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);

      await database.runAsync(`
        CREATE TABLE IF NOT EXISTS order_items (
          id TEXT PRIMARY KEY NOT NULL,
          order_id TEXT NOT NULL,
          product_id TEXT,
          name TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price REAL NOT NULL DEFAULT 0,
          line_total REAL NOT NULL DEFAULT 0,
          variants TEXT,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
      `);

      await database.runAsync(`
        CREATE TABLE IF NOT EXISTS baskets (
          id TEXT PRIMARY KEY NOT NULL,
          register_id TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          subtotal REAL NOT NULL DEFAULT 0,
          tax REAL NOT NULL DEFAULT 0,
          total REAL NOT NULL DEFAULT 0,
          currency TEXT NOT NULL DEFAULT 'GBP',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);

      await database.runAsync(`
        CREATE TABLE IF NOT EXISTS basket_items (
          id TEXT PRIMARY KEY NOT NULL,
          basket_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          name TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price REAL NOT NULL DEFAULT 0,
          line_total REAL NOT NULL DEFAULT 0,
          variants TEXT,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (basket_id) REFERENCES baskets(id) ON DELETE CASCADE
        )
      `);

      await database.runAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          role TEXT NOT NULL DEFAULT 'cashier',
          pin_hash TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);

      await database.runAsync(`
        CREATE TABLE IF NOT EXISTS customers_cache (
          id TEXT PRIMARY KEY NOT NULL,
          platform TEXT,
          platform_customer_id TEXT,
          name TEXT,
          email TEXT,
          phone TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);
    }

    // Future migrations:
    // if (fromVersion < 2) { /* v2: additive columns / new tables */ }

    await database.runAsync(`PRAGMA user_version = ${toVersion}`);
  });
}
