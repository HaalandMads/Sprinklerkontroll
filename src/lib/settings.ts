import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { getDb } from './db';
import { uid } from './format';
import { fileUri, importUri, readBase64, removeFile } from './platform';

// Innstillinger for kontrollørens firma. Lagres bare på denne telefonen og følger ikke med i eksport.
export type Company = { name: string; logo: string };

let ready = false;
async function db() {
  const d = await getDb();
  if (!ready) {
    await d.execAsync('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)');
    ready = true;
  }
  return d;
}

export async function getSetting(key: string): Promise<string> {
  const d = await db();
  const r = await d.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key=?', [key]);
  return r?.value ?? '';
}

export async function setSetting(key: string, value: string) {
  const d = await db();
  await d.runAsync('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key, value]);
}

export async function getCompany(): Promise<Company> {
  return { name: await getSetting('company_name'), logo: await getSetting('company_logo') };
}

export const logoUri = (name: string) => fileUri('firma', name);

/** Lagrer logoen som PNG (beholder gjennomsiktig bakgrunn), høyst 600 px bred. */
export async function storeLogo(uri: string, width?: number): Promise<string> {
  let ctx = ImageManipulator.manipulate(uri);
  if (!width || width > 600) ctx = ctx.resize({ width: 600 });
  const ref = await ctx.renderAsync();
  const saved = await ref.saveAsync({ format: SaveFormat.PNG });
  const name = `logo_${uid()}.png`;
  await importUri('firma', name, saved.uri);
  await removeLogo();
  await setSetting('company_logo', name);
  return name;
}

export async function removeLogo() {
  const old = await getSetting('company_logo');
  if (old) await removeFile('firma', old);
  await setSetting('company_logo', '');
}

/** Logoen som data-URL til rapporter, eller tom tekst hvis det ikke finnes noen logo. */
export async function logoDataUrl(name: string): Promise<string> {
  if (!name) return '';
  const b64 = await readBase64('firma', name);
  return b64 ? `data:image/png;base64,${b64}` : '';
}
