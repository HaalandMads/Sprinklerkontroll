import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as Sharing from 'expo-sharing';
import { safeFileName, uid } from './format';

// Filene lagres i appens egen dokumentmappe. I databasen lagres bare filnavnet,
// fordi selve stien kan endres når appen oppdateres (særlig på iPhone).
function ensure(dir: Directory): Directory {
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}
const root = () => ensure(new Directory(Paths.document, 'sprinklerkontroll'));
export const photoDir = () => ensure(new Directory(root(), 'bilder'));
export const docDir = () => ensure(new Directory(root(), 'dokumenter'));
export const photoFile = (name: string) => new File(photoDir(), name);
export const docFile = (name: string) => new File(docDir(), name);
export const photoUri = (name: string) => photoFile(name).uri;

async function resized(uri: string, width: number | undefined, max: number, compress: number): Promise<string> {
  let ctx = ImageManipulator.manipulate(uri);
  if (!width || width > max) ctx = ctx.resize({ width: max });
  const ref = await ctx.renderAsync();
  const result = await ref.saveAsync({ compress, format: SaveFormat.JPEG });
  return result.uri;
}

/** Lagrer et bilde i to størrelser: 1600 px for visning og 600 px for rapporter. */
export async function storePhoto(srcUri: string, width?: number): Promise<{ id: string; file: string; thumb: string }> {
  const id = uid();
  const file = `${id}.jpg`;
  const thumb = `${id}_t.jpg`;
  const big = await resized(srcUri, width, 1600, 0.7);
  const small = await resized(srcUri, width, 600, 0.6);
  await new File(big).copy(photoFile(file), { overwrite: true });
  await new File(small).copy(photoFile(thumb), { overwrite: true });
  return { id, file, thumb };
}

export function deletePhotoFiles(p: { file: string; thumb: string }) {
  for (const n of [p.file, p.thumb]) {
    try {
      const f = photoFile(n);
      if (f.exists) f.delete();
    } catch {}
  }
}

/** Kopierer et valgt dokument inn i appen. Returnerer filnavnet som lagres. */
export async function storeDocument(srcUri: string, name: string): Promise<{ file: string; size: number | null }> {
  const file = `${uid()}_${safeFileName(name)}`;
  const dest = docFile(file);
  await new File(srcUri).copy(dest, { overwrite: true });
  let size: number | null = null;
  try { size = dest.size; } catch {}
  return { file, size };
}

export function deleteDocumentFile(file: string) {
  try {
    const f = docFile(file);
    if (f.exists) f.delete();
  } catch {}
}

/** Åpner dokumentet i telefonens egen visning, eller tilbyr "Åpne med" hvis det ikke går. */
export async function openDocument(file: string, mime?: string | null) {
  const f = docFile(file);
  try {
    if (await f.canPreview()) {
      await f.preview();
      return;
    }
  } catch {}
  await Sharing.shareAsync(f.uri, { mimeType: mime ?? undefined, dialogTitle: 'Åpne dokument' });
}

export async function photoBase64(name: string): Promise<string | null> {
  try {
    const f = photoFile(name);
    if (!f.exists) return null;
    return await f.base64();
  } catch {
    return null;
  }
}

/** Skriver en tekstfil til midlertidig mappe og returnerer den. */
export async function writeTempText(name: string, content: string): Promise<File> {
  const f = new File(Paths.cache, name);
  if (f.exists) f.delete();
  f.create({ overwrite: true });
  await f.write(content);
  return f;
}
