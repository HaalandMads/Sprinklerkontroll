import * as SQLite from 'expo-sqlite';
import type { Severity } from './theme';
import { uid } from './format';

export type Building = {
  id: string; title: string; street: string; postal_code: string; city: string;
  contact_name: string; contact_phone: string; contact_email: string;
  created_at: string; updated_at: string;
};
export type BuildingListItem = Building & {
  open_stor: number; open_middels: number; open_liten: number; open_merknad: number;
  last_inspection: string | null;
};
export type Doc = { id: string; building_id: string; name: string; file: string; mime: string | null; size: number | null; added_at: string };
export type InspectionType = 'forste' | 'rutine';
export type SystemChoice = '12845' | '16925' | 'begge';
export type PointStatus = '' | 'ok' | 'avvik' | 'ia';
export type Inspection = {
  id: string; building_id: string; date: string; type: InspectionType; system: SystemChoice;
  inspector: string; notes: string; created_at: string;
};
export type InspectionListItem = Inspection & { new_count: number; closed_count: number };
export type Deviation = {
  id: string; building_id: string; inspection_id: string; nr: number; point_code: string | null;
  title: string; location: string; comment: string; severity: Severity;
  status: 'apen' | 'lukket'; closed_at: string | null; closed_comment: string; closed_inspection_id: string | null;
  created_at: string;
};
export type DeviationListItem = Deviation & { inspection_date: string; photo_count: number; first_photo: string | null };
export type Photo = { id: string; deviation_id: string; file: string; thumb: string; sort: number; created_at: string };

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('sprinklerkontroll.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS buildings (
          id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, street TEXT NOT NULL DEFAULT '',
          postal_code TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '',
          contact_name TEXT NOT NULL DEFAULT '', contact_phone TEXT NOT NULL DEFAULT '', contact_email TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY NOT NULL, building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
          name TEXT NOT NULL, file TEXT NOT NULL, mime TEXT, size INTEGER, added_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS inspections (
          id TEXT PRIMARY KEY NOT NULL, building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
          date TEXT NOT NULL, type TEXT NOT NULL, system TEXT NOT NULL, inspector TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS deviations (
          id TEXT PRIMARY KEY NOT NULL, building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
          inspection_id TEXT NOT NULL REFERENCES inspections(id) ON DELETE CASCADE, nr INTEGER NOT NULL, point_code TEXT,
          title TEXT NOT NULL, location TEXT NOT NULL DEFAULT '', comment TEXT NOT NULL DEFAULT '',
          severity TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'apen', closed_at TEXT,
          closed_comment TEXT NOT NULL DEFAULT '', closed_inspection_id TEXT, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS photos (
          id TEXT PRIMARY KEY NOT NULL, deviation_id TEXT NOT NULL REFERENCES deviations(id) ON DELETE CASCADE,
          file TEXT NOT NULL, thumb TEXT NOT NULL, sort INTEGER NOT NULL, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS inspection_points (
          inspection_id TEXT NOT NULL REFERENCES inspections(id) ON DELETE CASCADE, code TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '', PRIMARY KEY (inspection_id, code));
        CREATE INDEX IF NOT EXISTS ix_dev_building ON deviations(building_id);
        CREATE INDEX IF NOT EXISTS ix_insp_building ON inspections(building_id);
      `);
      return db;
    })();
  }
  return dbPromise;
}

const now = () => new Date().toISOString();

// ---------- Bygg ----------
export async function listBuildings(search = ''): Promise<BuildingListItem[]> {
  const db = await getDb();
  const q = `%${search.trim()}%`;
  return db.getAllAsync<BuildingListItem>(
    `SELECT b.*,
      (SELECT COUNT(*) FROM deviations d WHERE d.building_id=b.id AND d.status='apen' AND d.severity='stor') AS open_stor,
      (SELECT COUNT(*) FROM deviations d WHERE d.building_id=b.id AND d.status='apen' AND d.severity='middels') AS open_middels,
      (SELECT COUNT(*) FROM deviations d WHERE d.building_id=b.id AND d.status='apen' AND d.severity='liten') AS open_liten,
      (SELECT COUNT(*) FROM deviations d WHERE d.building_id=b.id AND d.status='apen' AND d.severity='merknad') AS open_merknad,
      (SELECT MAX(date) FROM inspections i WHERE i.building_id=b.id) AS last_inspection
     FROM buildings b
     WHERE b.title LIKE ? OR b.street LIKE ? OR b.city LIKE ? OR b.postal_code LIKE ?
     ORDER BY b.title COLLATE NOCASE`,
    [q, q, q, q],
  );
}

export async function getBuilding(id: string) {
  const db = await getDb();
  return db.getFirstAsync<Building>('SELECT * FROM buildings WHERE id=?', [id]);
}

export type BuildingInput = Omit<Building, 'id' | 'created_at' | 'updated_at'>;

export async function saveBuilding(input: BuildingInput, id?: string): Promise<string> {
  const db = await getDb();
  if (id) {
    await db.runAsync(
      `UPDATE buildings SET title=?, street=?, postal_code=?, city=?, contact_name=?, contact_phone=?, contact_email=?, updated_at=? WHERE id=?`,
      [input.title, input.street, input.postal_code, input.city, input.contact_name, input.contact_phone, input.contact_email, now(), id],
    );
    return id;
  }
  const newId = uid();
  await db.runAsync(
    `INSERT INTO buildings (id,title,street,postal_code,city,contact_name,contact_phone,contact_email,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [newId, input.title, input.street, input.postal_code, input.city, input.contact_name, input.contact_phone, input.contact_email, now(), now()],
  );
  return newId;
}

export async function deleteBuildingRows(id: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM buildings WHERE id=?', [id]);
}

// ---------- Dokumenter ----------
export async function listDocs(buildingId: string) {
  const db = await getDb();
  return db.getAllAsync<Doc>('SELECT * FROM documents WHERE building_id=? ORDER BY added_at DESC', [buildingId]);
}
export async function addDocRow(d: Omit<Doc, 'added_at'>) {
  const db = await getDb();
  await db.runAsync('INSERT INTO documents (id,building_id,name,file,mime,size,added_at) VALUES (?,?,?,?,?,?,?)',
    [d.id, d.building_id, d.name, d.file, d.mime, d.size, now()]);
}
export async function deleteDocRow(id: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM documents WHERE id=?', [id]);
}

// ---------- Kontroller ----------
export async function listInspections(buildingId: string) {
  const db = await getDb();
  return db.getAllAsync<InspectionListItem>(
    `SELECT i.*,
      (SELECT COUNT(*) FROM deviations d WHERE d.inspection_id=i.id) AS new_count,
      (SELECT COUNT(*) FROM deviations d WHERE d.closed_inspection_id=i.id) AS closed_count
     FROM inspections i WHERE i.building_id=? ORDER BY i.date DESC, i.created_at DESC`, [buildingId]);
}
export async function getInspection(id: string) {
  const db = await getDb();
  return db.getFirstAsync<Inspection>('SELECT * FROM inspections WHERE id=?', [id]);
}
export type InspectionInput = Omit<Inspection, 'id' | 'created_at'>;
export async function saveInspection(input: InspectionInput, id?: string): Promise<string> {
  const db = await getDb();
  if (id) {
    await db.runAsync('UPDATE inspections SET date=?, type=?, system=?, inspector=?, notes=? WHERE id=?',
      [input.date, input.type, input.system, input.inspector, input.notes, id]);
    return id;
  }
  const newId = uid();
  await db.runAsync('INSERT INTO inspections (id,building_id,date,type,system,inspector,notes,created_at) VALUES (?,?,?,?,?,?,?,?)',
    [newId, input.building_id, input.date, input.type, input.system, input.inspector, input.notes, now()]);
  return newId;
}
export async function deleteInspectionRows(id: string) {
  const db = await getDb();
  await db.runAsync("UPDATE deviations SET closed_inspection_id=NULL WHERE closed_inspection_id=?", [id]);
  await db.runAsync('DELETE FROM inspections WHERE id=?', [id]);
}
export async function lastInspector(): Promise<string> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ inspector: string }>("SELECT inspector FROM inspections WHERE inspector<>'' ORDER BY created_at DESC LIMIT 1");
  return r?.inspector ?? '';
}

// ---------- Avvik ----------
const devSelect = `SELECT d.*, i.date AS inspection_date,
  (SELECT COUNT(*) FROM photos p WHERE p.deviation_id=d.id) AS photo_count,
  (SELECT p.thumb FROM photos p WHERE p.deviation_id=d.id ORDER BY p.sort LIMIT 1) AS first_photo
  FROM deviations d JOIN inspections i ON i.id=d.inspection_id`;
const sevOrder = `CASE d.severity WHEN 'stor' THEN 0 WHEN 'middels' THEN 1 WHEN 'liten' THEN 2 ELSE 3 END`;

export async function listDeviationsForBuilding(buildingId: string) {
  const db = await getDb();
  return db.getAllAsync<DeviationListItem>(
    `${devSelect} WHERE d.building_id=? ORDER BY CASE d.status WHEN 'apen' THEN 0 ELSE 1 END, ${sevOrder}, d.nr`, [buildingId]);
}
export async function listDeviationsForInspection(inspectionId: string) {
  const db = await getDb();
  return db.getAllAsync<DeviationListItem>(`${devSelect} WHERE d.inspection_id=? ORDER BY ${sevOrder}, d.nr`, [inspectionId]);
}
/** Åpne avvik fra tidligere kontroller på samme bygg, og avvik lukket under denne kontrollen. */
export async function listCarriedDeviations(inspection: Inspection) {
  const db = await getDb();
  return db.getAllAsync<DeviationListItem>(
    `${devSelect} WHERE d.building_id=? AND d.inspection_id<>? AND (d.status='apen' OR d.closed_inspection_id=?)
     ORDER BY CASE d.status WHEN 'apen' THEN 0 ELSE 1 END, ${sevOrder}, d.nr`,
    [inspection.building_id, inspection.id, inspection.id]);
}
export async function getDeviation(id: string) {
  const db = await getDb();
  return db.getFirstAsync<DeviationListItem>(`${devSelect} WHERE d.id=?`, [id]);
}
export type DeviationInput = Pick<Deviation, 'title' | 'location' | 'comment' | 'severity' | 'point_code'>;
export async function saveDeviation(input: DeviationInput, ctx: { id?: string; buildingId: string; inspectionId: string }): Promise<string> {
  const db = await getDb();
  if (ctx.id) {
    await db.runAsync('UPDATE deviations SET title=?, location=?, comment=?, severity=?, point_code=? WHERE id=?',
      [input.title, input.location, input.comment, input.severity, input.point_code, ctx.id]);
    return ctx.id;
  }
  const newId = uid();
  const r = await db.getFirstAsync<{ n: number | null }>('SELECT MAX(nr) AS n FROM deviations WHERE building_id=?', [ctx.buildingId]);
  await db.runAsync(
    `INSERT INTO deviations (id,building_id,inspection_id,nr,point_code,title,location,comment,severity,status,created_at) VALUES (?,?,?,?,?,?,?,?,?, 'apen', ?)`,
    [newId, ctx.buildingId, ctx.inspectionId, (r?.n ?? 0) + 1, input.point_code, input.title, input.location, input.comment, input.severity, now()]);
  return newId;
}
export async function closeDeviation(id: string, comment: string, closedAt: string, inspectionId: string | null) {
  const db = await getDb();
  await db.runAsync("UPDATE deviations SET status='lukket', closed_at=?, closed_comment=?, closed_inspection_id=? WHERE id=?",
    [closedAt, comment, inspectionId, id]);
}
export async function reopenDeviation(id: string) {
  const db = await getDb();
  await db.runAsync("UPDATE deviations SET status='apen', closed_at=NULL, closed_comment='', closed_inspection_id=NULL WHERE id=?", [id]);
}
export async function deleteDeviationRows(id: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM deviations WHERE id=?', [id]);
}

// ---------- Bilder ----------
export async function listPhotos(deviationId: string) {
  const db = await getDb();
  return db.getAllAsync<Photo>('SELECT * FROM photos WHERE deviation_id=? ORDER BY sort', [deviationId]);
}
export async function listPhotosForBuilding(buildingId: string) {
  const db = await getDb();
  return db.getAllAsync<Photo>(
    'SELECT p.* FROM photos p JOIN deviations d ON d.id=p.deviation_id WHERE d.building_id=? ORDER BY p.sort', [buildingId]);
}
export async function replacePhotos(deviationId: string, photos: { id: string; file: string; thumb: string }[]) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM photos WHERE deviation_id=?', [deviationId]);
    let i = 0;
    for (const p of photos) {
      await db.runAsync('INSERT INTO photos (id,deviation_id,file,thumb,sort,created_at) VALUES (?,?,?,?,?,?)',
        [p.id, deviationId, p.file, p.thumb, i++, now()]);
    }
  });
}

// ---------- Status per kontrollpunkt ----------
export type PointState = { code: string; status: PointStatus; note: string };
export async function listPointStates(inspectionId: string): Promise<Map<string, PointState>> {
  const db = await getDb();
  const rows = await db.getAllAsync<PointState>('SELECT code, status, note FROM inspection_points WHERE inspection_id=?', [inspectionId]);
  return new Map(rows.map((r) => [r.code, r]));
}
export async function setPointState(inspectionId: string, code: string, status: PointStatus, note: string) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO inspection_points (inspection_id, code, status, note) VALUES (?,?,?,?)
     ON CONFLICT(inspection_id, code) DO UPDATE SET status=excluded.status, note=excluded.note`,
    [inspectionId, code, status, note]);
}
/** Antall avvik per kontrollpunkt i en kontroll. */
export async function deviationCountsByPoint(inspectionId: string): Promise<Map<string, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ point_code: string; n: number }>(
    'SELECT point_code, COUNT(*) AS n FROM deviations WHERE inspection_id=? AND point_code IS NOT NULL GROUP BY point_code', [inspectionId]);
  return new Map(rows.map((r) => [r.point_code, r.n]));
}
export async function listDeviationsForPoint(inspectionId: string, code: string) {
  const db = await getDb();
  return db.getAllAsync<DeviationListItem>(`${devSelect} WHERE d.inspection_id=? AND d.point_code=? ORDER BY d.nr`, [inspectionId, code]);
}
