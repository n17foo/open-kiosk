import * as SQLite from 'expo-sqlite';

let database: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!database) {
    database = SQLite.openDatabaseSync('openkiosk.db');
  }
  return database;
}

export const db = new Proxy({} as SQLite.SQLiteDatabase, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});
