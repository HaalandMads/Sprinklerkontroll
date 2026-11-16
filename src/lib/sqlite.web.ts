// Web (PWA): SQLite kjørt i nettleseren med sql.js. Hele databasen lagres i IndexedDB etter hver endring.
// @ts-expect-error: sql.js har ingen egne typer for den innebygde varianten
import initSqlJs from 'sql.js/dist/sql-wasm-inline.js';
import type { Database, SqlValue } from 'sql.js';
import type { BindValue, Db } from './dbtypes';

export type { BindValue, Db } from './dbtypes';

const IDB = 'sprinklerkontroll';
const STORE = 'kv';

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<Uint8Array | undefined> {
  const d = await idb();
  return new Promise((resolve, reject) => {
    const req = d.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as Uint8Array | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: Uint8Array): Promise<void> {
  const d = await idb();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const norm = (params: BindValue[] = []): SqlValue[] =>
  params.map((v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v)) as SqlValue[];

export async function openDb(name: string): Promise<Db> {
  // Be nettleseren om varig lagring, slik at dataene ikke ryddes bort ved lite plass.
  try { await navigator.storage?.persist?.(); } catch {}
  const SQL = await initSqlJs();
  const saved = await idbGet(name);
  const db: Database = new SQL.Database(saved);
  let depth = 0;

  const persist = async () => {
    if (depth > 0) return;
    const bytes = db.export();
    // export() lukker og åpner databasen på nytt, så innstillinger per tilkobling må settes igjen.
    db.exec('PRAGMA foreign_keys = ON');
    await idbSet(name, bytes);
  };

  const all = <T,>(sql: string, params?: BindValue[]): T[] => {
    const st = db.prepare(sql);
    try {
      st.bind(norm(params));
      const rows: T[] = [];
      while (st.step()) rows.push(st.getAsObject() as T);
      return rows;
    } finally {
      st.free();
    }
  };

  return {
    async execAsync(sql) {
      db.exec(sql);
      await persist();
    },
    async runAsync(sql, params) {
      const st = db.prepare(sql);
      try {
        st.run(norm(params));
      } finally {
        st.free();
      }
      const changes = db.getRowsModified();
      await persist();
      return { changes };
    },
    async getAllAsync<T>(sql: string, params?: BindValue[]) {
      return all<T>(sql, params);
    },
    async getFirstAsync<T>(sql: string, params?: BindValue[]) {
      return all<T>(sql, params)[0] ?? null;
    },
    async withTransactionAsync(fn) {
      db.exec('BEGIN');
      depth++;
      try {
        await fn();
        depth--;
        db.exec('COMMIT');
      } catch (e) {
        depth--;
        try { db.exec('ROLLBACK'); } catch {}
        throw e;
      }
      await persist();
    },
  };
}
