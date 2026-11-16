// Appen (Android og iPhone): filer i appens egen mappe, deling og PDF via telefonens funksjoner.
import { Directory, File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export type Kind = 'bilder' | 'dokumenter' | 'firma';
export const isWeb = false;

function dir(kind: Kind): Directory {
  const d = new Directory(Paths.document, 'sprinklerkontroll', kind);
  if (!d.exists) d.create({ intermediates: true, idempotent: true });
  return d;
}
const file = (kind: Kind, name: string) => new File(dir(kind), name);

export function fileUri(kind: Kind, name: string): string {
  return file(kind, name).uri;
}

export async function fileExists(kind: Kind, name: string): Promise<boolean> {
  try { return file(kind, name).exists; } catch { return false; }
}

export async function writeBytes(kind: Kind, name: string, data: Uint8Array): Promise<void> {
  const f = file(kind, name);
  if (f.exists) f.delete();
  f.create({ overwrite: true });
  await f.write(data);
}

/** Kopierer en fil fra kamera, galleri eller filvelger inn i appen. Returnerer størrelsen. */
export async function importUri(kind: Kind, name: string, srcUri: string): Promise<number | null> {
  const dest = file(kind, name);
  await new File(srcUri).copy(dest, { overwrite: true });
  try { return dest.size; } catch { return null; }
}

export async function readBytes(kind: Kind, name: string): Promise<Uint8Array | null> {
  const f = file(kind, name);
  return f.exists ? await f.bytes() : null;
}

export async function readBase64(kind: Kind, name: string): Promise<string | null> {
  try {
    const f = file(kind, name);
    return f.exists ? await f.base64() : null;
  } catch {
    return null;
  }
}

export async function removeFile(kind: Kind, name: string): Promise<void> {
  try {
    const f = file(kind, name);
    if (f.exists) f.delete();
  } catch {}
}

/** Åpner et dokument i telefonens egen visning, eller tilbyr «Åpne med». */
export async function openFile(kind: Kind, name: string, mime?: string | null): Promise<void> {
  const f = file(kind, name);
  try {
    if (await f.canPreview()) {
      await f.preview();
      return;
    }
  } catch {}
  await Sharing.shareAsync(f.uri, { mimeType: mime ?? undefined, dialogTitle: 'Åpne dokument' });
}

/** Leser en fil valgt med filvelgeren (for eksempel en eksportfil). */
export async function readUri(uri: string): Promise<Uint8Array> {
  return await new File(uri).bytes();
}

/** Lagrer data som en midlertidig fil og åpner delemenyen. */
export async function shareData(fileName: string, data: Uint8Array | string, mime: string, uti: string, title: string): Promise<void> {
  const out = new File(Paths.cache, fileName);
  if (out.exists) out.delete();
  out.create({ overwrite: true });
  await out.write(data);
  await Sharing.shareAsync(out.uri, { mimeType: mime, UTI: uti, dialogTitle: title });
}

export async function sharePdfFromHtml(html: string, fileName: string, title: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });
  const target = new File(Paths.cache, fileName);
  if (target.exists) target.delete();
  await new File(uri).copy(target, { overwrite: true });
  await Sharing.shareAsync(target.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: title });
}

export async function printHtml(html: string): Promise<void> {
  await Print.printAsync({ html });
}
