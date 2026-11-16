// Felles databasegrensesnitt for app (expo-sqlite) og web (sql.js).
export type BindValue = string | number | null | boolean | Uint8Array;

export interface Db {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: BindValue[]): Promise<unknown>;
  getAllAsync<T = unknown>(sql: string, params?: BindValue[]): Promise<T[]>;
  getFirstAsync<T = unknown>(sql: string, params?: BindValue[]): Promise<T | null>;
  withTransactionAsync(fn: () => Promise<void>): Promise<void>;
}
