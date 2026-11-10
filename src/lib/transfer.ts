import { strFromU8, strToU8, unzipSync, zipSync, Zippable } from 'fflate';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Constants from 'expo-constants';
import type { SQLiteBindValue } from 'expo-sqlite';
import { getDb } from './db';
import { docFile, photoFile } from './files';
import { fmtDate, safeFileName, todayIso } from './format';

// Eksportformat: en zip med manifest.json, data.json og filer under files/bilder og files/dokumenter.
export const FORMAT = 1;
export type Scope = 'database' | 'building' | 'inspection';
type Row = Record<string, SQLiteBindValue>;

// Rekkefølgen sikrer at foreldre settes inn før barn.
const TABLES = ['buildings', 'documents', 'inspections', 'inspection_points', 'deviations', 'photos', 'capacity_tests'] as const;
type Table = (typeof TABLES)[number];
const PK: Record<Table, string[]> = {
  buildings: ['id'], documents: ['id'], inspections: ['id'], inspection_points: ['inspection_id', 'code'],
  deviations: ['id'], photos: ['id'], capacity_tests: ['id'],
};
type Data = Record<Table, Row[]>;

export type Manifest = {
  app: 'Sprinklerkontroll'; format: number; scope: Scope; label: string; created_at: string; app_version: string;
  counts: Record<Table, number>; files: number;
};
export type Package = { manifest: Manifest; data: Data; files: Record<string, Uint8Array> };

const emptyData = (): Data => ({ buildings: [], documents: [], inspections: [], inspection_points: [], deviations: [], photos: [], capacity_tests: [] });

async function collect(scope: Scope, id?: string): Promise<{ data: Data; label: string }> {
  const db = await getDb();
  const all = (sql: string, params: SQLiteBindValue[] = []) => db.getAllAsync<Row>(sql, params);
  const data = emptyData();
  if (scope === 'database') {
    for (const t of TABLES) data[t] = await all(`SELECT * FROM ${t}`);
    return { data, label: 'Hele databasen' };
  }
  if (!id) throw new Error('Mangler ID for eksport.');
  if (scope === 'building') {
    data.buildings = await all('SELECT * FROM buildings WHERE id=?', [id]);
    if (!data.buildings.length) throw new Error('Fant ikke bygget.');
    data.documents = await all('SELECT * FROM documents WHERE building_id=?', [id]);
    data.inspections = await all('SELECT * FROM inspections WHERE building_id=?', [id]);
    data.inspection_points = await all('SELECT * FROM inspection_points WHERE inspection_id IN (SELECT id FROM inspections WHERE building_id=?)', [id]);
    data.deviations = await all('SELECT * FROM deviations WHERE building_id=?', [id]);
    data.photos = await all('SELECT * FROM photos WHERE deviation_id IN (SELECT id FROM deviations WHERE building_id=?)', [id]);
    data.capacity_tests = await all('SELECT * FROM capacity_tests WHERE building_id=?', [id]);
    return { data, label: `Bygg: ${String(data.buildings[0].title)}` };
  }
  // Én kontroll: bygget, kontrollen, status per punkt, avvik registrert i kontrollen og avvik lukket i den.
  // Kontrollene der de lukkede avvikene ble registrert tas med, slik at koblingene holder på mottakertelefonen.
  const insp = await all('SELECT * FROM inspections WHERE id=?', [id]);
  if (!insp.length) throw new Error('Fant ikke kontrollen.');
  const bId = String(insp[0].building_id);
  data.buildings = await all('SELECT * FROM buildings WHERE id=?', [bId]);
  data.deviations = await all('SELECT * FROM deviations WHERE inspection_id=? OR closed_inspection_id=?', [id, id]);
  data.inspections = await all(
    'SELECT * FROM inspections WHERE id=? OR id IN (SELECT inspection_id FROM deviations WHERE closed_inspection_id=?)', [id, id]);
  data.inspection_points = await all('SELECT * FROM inspection_points WHERE inspection_id=?', [id]);
  data.photos = await all('SELECT * FROM photos WHERE deviation_id IN (SELECT id FROM deviations WHERE inspection_id=? OR closed_inspection_id=?)', [id, id]);
  return { data, label: `Kontroll ${fmtDate(String(insp[0].date))}: ${String(data.buildings[0]?.title ?? '')}` };
}

/** Lager eksportfilen og åpner delemenyen (OneDrive, e-post, Teams osv.). */
export async function exportAndShare(scope: Scope, id?: string): Promise<void> {
  const { data, label } = await collect(scope, id);
  const zip: Zippable = {};
  let files = 0;
  for (const p of data.photos) {
    for (const name of [String(p.file), String(p.thumb)]) {
      const f = photoFile(name);
      if (f.exists) { zip[`files/bilder/${name}`] = [await f.bytes(), { level: 0 }]; files++; }
    }
  }
  for (const d of data.documents) {
    const name = String(d.file);
    const f = docFile(name);
    if (f.exists) { zip[`files/dokumenter/${name}`] = [await f.bytes(), { level: 1 }]; files++; }
  }
  const counts = Object.fromEntries(TABLES.map((t) => [t, data[t].length])) as Record<Table, number>;
  const manifest: Manifest = {
    app: 'Sprinklerkontroll', format: FORMAT, scope, label, created_at: new Date().toISOString(),
    app_version: Constants.expoConfig?.version ?? '', counts, files,
  };
  zip['manifest.json'] = strToU8(JSON.stringify(manifest, null, 1));
  zip['data.json'] = strToU8(JSON.stringify(data));
  const bytes = zipSync(zip);
  const kind = scope === 'database' ? 'alt' : scope === 'building' ? 'bygg' : 'kontroll';
  const name = `Sprinklerkontroll_${kind}_${scope === 'database' ? '' : safeFileName(label.replace(/^[^:]*:\s*/, '')) + '_'}${todayIso()}.zip`;
  const out = new File(Paths.cache, name);
  if (out.exists) out.delete();
  out.create({ overwrite: true });
  await out.write(bytes);
  await Sharing.shareAsync(out.uri, { mimeType: 'application/zip', UTI: 'public.zip-archive', dialogTitle: 'Del eksportfil' });
}

const safeName = (n: string) => n.length > 0 && !n.includes('/') && !n.includes('\\') && n !== '.' && n !== '..';

/** Leser og kontrollerer en eksportfil. */
export async function readPackage(uri: string): Promise<Package> {
  const bytes = await new File(uri).bytes();
  let entries: Record<string, Uint8Array>;
  try { entries = unzipSync(bytes); } catch { throw new Error('Filen er ikke en gyldig eksportfil fra Sprinklerkontroll.'); }
  if (!entries['manifest.json'] || !entries['data.json']) throw new Error('Filen mangler innhold fra Sprinklerkontroll.');
  const manifest = JSON.parse(strFromU8(entries['manifest.json'])) as Manifest;
  if (manifest.app !== 'Sprinklerkontroll') throw new Error('Filen er ikke laget med Sprinklerkontroll.');
  if (manifest.format > FORMAT) throw new Error('Filen er laget med en nyere versjon av appen. Oppdater appen først.');
  const raw = JSON.parse(strFromU8(entries['data.json'])) as Partial<Data>;
  const data = emptyData();
  for (const t of TABLES) data[t] = Array.isArray(raw[t]) ? (raw[t] as Row[]) : [];
  const files: Record<string, Uint8Array> = {};
  for (const [k, v] of Object.entries(entries)) if (k.startsWith('files/')) files[k] = v;
  return { manifest, data, files };
}

export type Policy = 'fil' | 'behold';
export type ImportResult = { added: number; updated: number; skipped: number; files: number; renumbered: number };

/** Importerer en eksportfil. «fil»: innholdet i filen erstatter det som finnes. «behold»: eksisterende data røres ikke. */
export async function importPackage(pkg: Package, policy: Policy): Promise<ImportResult> {
  const db = await getDb();
  const res: ImportResult = { added: 0, updated: 0, skipped: 0, files: 0, renumbered: 0 };

  // Filer først, slik at bildene finnes når radene settes inn.
  for (const [key, bytes] of Object.entries(pkg.files)) {
    const m = /^files\/(bilder|dokumenter)\/(.+)$/.exec(key);
    if (!m || !safeName(m[2])) continue;
    const f = m[1] === 'bilder' ? photoFile(m[2]) : docFile(m[2]);
    if (f.exists && policy === 'behold') continue;
    if (f.exists) f.delete();
    f.create({ overwrite: true });
    await f.write(bytes);
    res.files++;
  }

  await db.withTransactionAsync(async () => {
    for (const t of TABLES) {
      const info = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${t})`);
      const allowed = new Set(info.map((c) => c.name));
      for (const raw of pkg.data[t]) {
        const row: Row = {};
        for (const [k, v] of Object.entries(raw)) if (allowed.has(k)) row[k] = v;
        if (PK[t].some((k) => row[k] === undefined || row[k] === null)) { res.skipped++; continue; }
        const where = PK[t].map((k) => `${k}=?`).join(' AND ');
        const exists = !!(await db.getFirstAsync(`SELECT 1 FROM ${t} WHERE ${where}`, PK[t].map((k) => row[k])));
        if (exists && policy === 'behold') { res.skipped++; continue; }
        if (t === 'deviations') {
          // Avviksnummeret skal være unikt per bygg. Er filens nummer tatt av et annet avvik,
          // får et nytt avvik neste ledige nummer, og et eksisterende avvik beholder sitt nummer.
          const clash = await db.getFirstAsync<{ id: string }>('SELECT id FROM deviations WHERE building_id=? AND nr=? AND id<>?', [row.building_id, row.nr, row.id]);
          if (clash) {
            if (exists) {
              const cur = await db.getFirstAsync<{ nr: number }>('SELECT nr FROM deviations WHERE id=?', [row.id]);
              row.nr = cur?.nr ?? row.nr;
            } else {
              const mx = await db.getFirstAsync<{ n: number | null }>('SELECT MAX(nr) AS n FROM deviations WHERE building_id=?', [row.building_id]);
              row.nr = (mx?.n ?? 0) + 1;
              res.renumbered++;
            }
          }
        }
        const cols = Object.keys(row);
        const upd = cols.filter((c) => !PK[t].includes(c));
        const conflict = upd.length ? `DO UPDATE SET ${upd.map((c) => `${c}=excluded.${c}`).join(', ')}` : 'DO NOTHING';
        await db.runAsync(
          `INSERT INTO ${t} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')}) ON CONFLICT(${PK[t].join(',')}) ${conflict}`,
          cols.map((c) => row[c]));
        if (exists) res.updated++; else res.added++;
      }
    }
  });
  return res;
}

export const scopeLabel: Record<Scope, string> = {
  database: 'Hele databasen',
  building: 'Ett bygg med all historikk',
  inspection: 'Én kontroll',
};
