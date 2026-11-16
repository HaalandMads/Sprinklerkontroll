// Web (PWA): filer i nettleserens Cache Storage. Tjenestearbeideren (sw.js) leverer dem på
// adressen <base>/_files/<type>/<navn>, slik at bilder og dokumenter kan vises med vanlige lenker.
import Constants from 'expo-constants';

export type Kind = 'bilder' | 'dokumenter' | 'firma';
export const isWeb = true;

const CACHE = 'sk-files-v1';
const BASE = ((Constants.expoConfig?.experiments as { baseUrl?: string } | undefined)?.baseUrl ?? '').replace(/\/$/, '');

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', heic: 'image/heic',
  pdf: 'application/pdf', txt: 'text/plain', csv: 'text/csv', zip: 'application/zip',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
const mimeOf = (name: string) => MIME[name.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream';

export function fileUri(kind: Kind, name: string): string {
  return `${location.origin}${BASE}/_files/${kind}/${encodeURIComponent(name)}`;
}

async function store(kind: Kind, name: string, blob: Blob): Promise<void> {
  const c = await caches.open(CACHE);
  const type = blob.type || mimeOf(name);
  await c.put(fileUri(kind, name), new Response(blob, { headers: { 'Content-Type': type, 'Content-Length': String(blob.size) } }));
}

export async function fileExists(kind: Kind, name: string): Promise<boolean> {
  const c = await caches.open(CACHE);
  return !!(await c.match(fileUri(kind, name)));
}

export async function writeBytes(kind: Kind, name: string, data: Uint8Array): Promise<void> {
  await store(kind, name, new Blob([data as BlobPart], { type: mimeOf(name) }));
}

export async function importUri(kind: Kind, name: string, srcUri: string): Promise<number | null> {
  const blob = await (await fetch(srcUri)).blob();
  await store(kind, name, blob);
  return blob.size;
}

export async function readBytes(kind: Kind, name: string): Promise<Uint8Array | null> {
  const c = await caches.open(CACHE);
  const r = await c.match(fileUri(kind, name));
  return r ? new Uint8Array(await r.arrayBuffer()) : null;
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(s);
}

export async function readBase64(kind: Kind, name: string): Promise<string | null> {
  const b = await readBytes(kind, name);
  return b ? toBase64(b) : null;
}

export async function removeFile(kind: Kind, name: string): Promise<void> {
  const c = await caches.open(CACHE);
  await c.delete(fileUri(kind, name));
}

/** Åpner dokumentet i en ny fane. Kalles direkte fra trykket, slik at nettleseren tillater det. */
export async function openFile(kind: Kind, name: string): Promise<void> {
  window.open(fileUri(kind, name), '_blank');
}

export async function readUri(uri: string): Promise<Uint8Array> {
  return new Uint8Array(await (await fetch(uri)).arrayBuffer());
}

function download(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/** Deler filen med telefonens delemeny hvis nettleseren støtter det, ellers lastes den ned. */
export async function shareData(fileName: string, data: Uint8Array | string, mime: string, _uti: string, title: string): Promise<void> {
  const file = new File([data as BlobPart], fileName, { type: mime });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title });
      return;
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
    }
  }
  download(file);
}

/** Skriver ut bare rapporten. Den legges i et eget element som bare vises ved utskrift. */
export async function printHtml(html: string): Promise<void> {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const css = [...doc.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n').replace(/@page[^}]*\}/g, '');
  document.getElementById('sk-print')?.remove();
  document.getElementById('sk-print-style')?.remove();
  const style = document.createElement('style');
  style.id = 'sk-print-style';
  style.textContent = `@media screen { #sk-print { display: none; } }
@media print {
  @page { margin: 16mm 14mm; }
  body > *:not(#sk-print) { display: none !important; }
  #sk-print { display: block; }
  ${css}
}`;
  const root = document.createElement('div');
  root.id = 'sk-print';
  root.innerHTML = doc.body.innerHTML;
  document.head.appendChild(style);
  document.body.appendChild(root);
  await Promise.all([...root.querySelectorAll('img')].map((img) => (img.decode ? img.decode().catch(() => undefined) : undefined)));
  const cleanup = () => { root.remove(); style.remove(); window.removeEventListener('afterprint', cleanup); };
  window.addEventListener('afterprint', cleanup);
  window.print();
}

/** I nettleseren lages PDF via utskriftsvinduet: «Lagre som PDF» eller Del. */
export async function sharePdfFromHtml(html: string, _fileName: string, _title: string): Promise<void> {
  try {
    if (!localStorage.getItem('sk-pdf-tip')) {
      window.alert('Utskriftsvinduet åpnes nå.\n\nAndroid: velg skriveren «Lagre som PDF».\niPhone: trykk Del-knappen i utskriftsvinduet for å lagre eller sende PDF-en.');
      localStorage.setItem('sk-pdf-tip', '1');
    }
  } catch {}
  await printHtml(html);
}
