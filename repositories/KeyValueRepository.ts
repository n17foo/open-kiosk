import { db } from '../utils/db';

export class KeyValueRepository {
  async setItem(key: string, value: string | object | number | boolean): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO key_value_store (key, value, created_at, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, stringValue, now, now]
    );
  }

  async getItem(key: string): Promise<string | null> {
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM key_value_store WHERE key = ?', [key]);
    return row?.value ?? null;
  }

  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    await db.runAsync('DELETE FROM key_value_store WHERE key = ?', [key]);
  }

  async containsKey(key: string): Promise<boolean> {
    const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM key_value_store WHERE key = ?', [key]);
    return (row?.count ?? 0) > 0;
  }

  async getAllKeys(): Promise<string[]> {
    const rows = await db.getAllAsync<{ key: string }>('SELECT key FROM key_value_store ORDER BY key');
    return rows.map((r: { key: string }) => r.key);
  }
}

export const keyValueRepository = new KeyValueRepository();
