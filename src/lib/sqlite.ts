import * as SQLite from 'expo-sqlite';
import type { Db } from './dbtypes';

export type { BindValue, Db } from './dbtypes';

/** Appen (Android og iPhone): SQLite-databasen på telefonen. */
export async function openDb(name: string): Promise<Db> {
  return (await SQLite.openDatabaseAsync(name)) as unknown as Db;
}
