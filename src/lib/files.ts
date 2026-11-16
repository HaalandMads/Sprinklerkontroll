import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { safeFileName, uid } from './format';
import { fileUri, importUri, openFile, readBase64, removeFile } from './platform';

// I databasen lagres bare filnavnet. Selve plasseringen bestemmes av plattformlaget
// (appens egen mappe på telefonen, eller nettleserens lagring i web-versjonen).

export const photoUri = (name: string) => fileUri('bilder', name);

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
  await importUri('bilder', file, await resized(srcUri, width, 1600, 0.7));
  await importUri('bilder', thumb, await resized(srcUri, width, 600, 0.6));
  return { id, file, thumb };
}

export async function deletePhotoFiles(p: { file: string; thumb: string }) {
  await removeFile('bilder', p.file);
  await removeFile('bilder', p.thumb);
}

/** Kopierer et valgt dokument inn i appen. Returnerer filnavnet som lagres. */
export async function storeDocument(srcUri: string, name: string): Promise<{ file: string; size: number | null }> {
  const file = `${uid()}_${safeFileName(name)}`;
  const size = await importUri('dokumenter', file, srcUri);
  return { file, size };
}

export async function deleteDocumentFile(file: string) {
  await removeFile('dokumenter', file);
}

export async function openDocument(file: string, mime?: string | null) {
  await openFile('dokumenter', file, mime);
}

export async function photoBase64(name: string): Promise<string | null> {
  return readBase64('bilder', name);
}
