import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import {
  Building, DeviationListItem, InspectionListItem, getBuilding, listDeviationsForBuilding,
  listInspections, listPhotosForBuilding,
} from './db';
import { fmtDate, safeFileName, todayIso } from './format';
import { photoBase64, writeTempText } from './files';
import { severityOf } from './theme';
import { pointByCode, systemLabel, typeLabel } from './fg';

export const APP_NAME = 'Sprinklerkontroll';
export const APP_AUTHOR = 'Mads Fjærem';

type Data = { b: Building; devs: DeviationListItem[]; insps: InspectionListItem[]; photos: Map<string, string[]> };

async function load(buildingId: string, includeClosed: boolean): Promise<Data> {
  const b = await getBuilding(buildingId);
  if (!b) throw new Error('Fant ikke bygget.');
  const all = await listDeviationsForBuilding(buildingId);
  const devs = includeClosed ? all : all.filter((d) => d.status === 'apen');
  const insps = await listInspections(buildingId);
  const photos = new Map<string, string[]>();
  for (const p of await listPhotosForBuilding(buildingId)) {
    const arr = photos.get(p.deviation_id) ?? [];
    arr.push(p.thumb);
    photos.set(p.deviation_id, arr);
  }
  return { b, devs, insps, photos };
}

const esc = (s: string) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br/>');

function address(b: Building) {
  return [b.street, [b.postal_code, b.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

async function buildHtml(d: Data, includeClosed: boolean): Promise<string> {
  const { b, devs, insps, photos } = d;
  const open = devs.filter((x) => x.status === 'apen');
  const count = (k: string) => open.filter((x) => x.severity === k).length;
  const inspDate = new Map(insps.map((i) => [i.id, i.date]));

  let devHtml = '';
  for (const x of devs) {
    const sev = severityOf(x.severity);
    const imgs: string[] = [];
    for (const t of photos.get(x.id) ?? []) {
      const b64 = await photoBase64(t);
      if (b64) imgs.push(`<img src="data:image/jpeg;base64,${b64}"/>`);
    }
    const closed = x.status === 'lukket';
    const pt = pointByCode(x.point_code);
    devHtml += `
      <div class="dev ${closed ? 'closed' : ''}" style="border-left-color:${closed ? '#2E7D32' : sev.color}">
        <div class="devhead">
          <span class="nr">A-${x.nr}</span>
          <span class="title">${esc(x.title)}</span>
          <span class="sev" style="background:${sev.color};color:${sev.text}">${sev.label}</span>
          <span class="status">${closed ? 'Lukket' : 'Åpen'}</span>
        </div>
        <table class="meta">
          <tr><td>Kontrollpunkt</td><td>${pt ? esc(pt.code + ' ' + pt.title) : 'Annet avvik'}</td></tr>
          <tr><td>Plassering</td><td>${esc(x.location) || '–'}</td></tr>
          <tr><td>Registrert</td><td>${fmtDate(x.inspection_date)}</td></tr>
          ${closed ? `<tr><td>Lukket</td><td>${fmtDate(x.closed_at)}${x.closed_inspection_id && inspDate.get(x.closed_inspection_id) ? ' (kontroll ' + fmtDate(inspDate.get(x.closed_inspection_id)) + ')' : ''}${x.closed_comment ? ': ' + esc(x.closed_comment) : ''}</td></tr>` : ''}
        </table>
        ${x.comment ? `<p class="comment">${esc(x.comment)}</p>` : ''}
        ${imgs.length ? `<div class="imgs">${imgs.join('')}</div>` : ''}
      </div>`;
  }

  const inspRows = insps
    .map((i) => `<tr><td>${fmtDate(i.date)}</td><td>${esc(typeLabel[i.type] ?? i.type)}</td><td>${esc(systemLabel[i.system] ?? i.system)}</td><td>${esc(i.inspector)}</td><td>${i.new_count}</td><td>${i.closed_count}</td></tr>`)
    .join('');

  return `<!DOCTYPE html><html lang="no"><head><meta charset="utf-8"/>
  <style>
    @page { margin: 16mm 14mm; }
    body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color:#16202A; font-size:10.5pt; }
    h1 { font-size:18pt; margin:0 0 2px; } h2 { font-size:12.5pt; margin:18px 0 6px; border-bottom:1px solid #D5DBE0; padding-bottom:3px; }
    .sub { color:#5B6670; margin:0 0 10px; }
    table { border-collapse:collapse; width:100%; } td, th { text-align:left; padding:3px 6px; vertical-align:top; }
    .grid td:first-child { color:#5B6670; width:28%; }
    .list th { background:#F2F4F6; font-size:9.5pt; } .list td { border-bottom:1px solid #E6EAEE; font-size:9.5pt; }
    .sum span { display:inline-block; margin-right:14px; font-weight:600; }
    .dev { border:1px solid #D5DBE0; border-left:6px solid; border-radius:4px; padding:8px 10px; margin:0 0 10px; page-break-inside:avoid; }
    .dev.closed { opacity:.75; }
    .devhead { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
    .nr { font-weight:700; } .title { font-weight:700; flex:1; }
    .sev { font-size:8.5pt; padding:2px 7px; border-radius:10px; font-weight:600; }
    .status { font-size:8.5pt; color:#5B6670; }
    .meta td:first-child { color:#5B6670; width:22%; } .meta td { padding:1px 0; font-size:9.5pt; }
    .comment { margin:4px 0; }
    .imgs { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
    .imgs img { width:31%; border-radius:3px; }
    .foot { margin-top:20px; color:#5B6670; font-size:8.5pt; }
  </style></head><body>
  <h1>Avviksoversikt – ${esc(b.title)}</h1>
  <p class="sub">${esc(address(b))}</p>
  <table class="grid">
    <tr><td>Kontaktperson</td><td>${esc(b.contact_name) || '–'}</td></tr>
    <tr><td>Mobil</td><td>${esc(b.contact_phone) || '–'}</td></tr>
    <tr><td>E-post</td><td>${esc(b.contact_email) || '–'}</td></tr>
    <tr><td>Utskrevet</td><td>${fmtDate(todayIso())}</td></tr>
    <tr><td>Innhold</td><td>${includeClosed ? 'Alle avvik, også lukkede' : 'Bare åpne avvik'}</td></tr>
  </table>
  <h2>Åpne avvik</h2>
  <div class="sum"><span>Stor: ${count('stor')}</span><span>Middels: ${count('middels')}</span><span>Liten: ${count('liten')}</span><span>Merknad: ${count('merknad')}</span></div>
  <h2>Kontroller</h2>
  ${insps.length ? `<table class="list"><tr><th>Dato</th><th>Type</th><th>Anlegg</th><th>Kontrollør</th><th>Nye avvik</th><th>Lukket</th></tr>${inspRows}</table>` : '<p>Ingen kontroller registrert.</p>'}
  <h2>Avvik</h2>
  ${devHtml || '<p>Ingen avvik.</p>'}
  <p class="foot">Laget med ${APP_NAME} av ${APP_AUTHOR}. Kontrollpunkter og kategorier etter FG-920:5. Rapporten inneholder kontaktopplysninger og skal ikke deles utenfor godkjente systemer.</p>
  </body></html>`;
}

function baseName(b: Building) {
  return `Avvik_${safeFileName(b.title)}_${todayIso()}`;
}

export async function sharePdf(buildingId: string, includeClosed: boolean) {
  const d = await load(buildingId, includeClosed);
  const html = await buildHtml(d, includeClosed);
  const { uri } = await Print.printToFileAsync({ html });
  const target = new File(Paths.cache, `${baseName(d.b)}.pdf`);
  if (target.exists) target.delete();
  await new File(uri).copy(target, { overwrite: true });
  await Sharing.shareAsync(target.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Del avviksoversikt' });
}

export async function printReport(buildingId: string, includeClosed: boolean) {
  const d = await load(buildingId, includeClosed);
  await Print.printAsync({ html: await buildHtml(d, includeClosed) });
}

const csvCell = (v: unknown) => {
  const s = String(v ?? '');
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function shareCsv(buildingId: string, includeClosed: boolean) {
  const d = await load(buildingId, includeClosed);
  const inspDate = new Map(d.insps.map((i) => [i.id, i.date]));
  const head = ['Nr', 'Kontrollpunkt', 'Overskrift', 'Plassering', 'Alvorlighetsgrad', 'Status', 'Registrert', 'Kommentar', 'Lukket dato', 'Lukket under kontroll', 'Kommentar ved lukking', 'Antall bilder'];
  const rows = d.devs.map((x) => [
    `A-${x.nr}`, (() => { const p = pointByCode(x.point_code); return p ? `${p.code} ${p.title}` : 'Annet avvik'; })(), x.title, x.location, severityOf(x.severity).label, x.status === 'apen' ? 'Åpen' : 'Lukket',
    fmtDate(x.inspection_date), x.comment, fmtDate(x.closed_at),
    x.closed_inspection_id ? fmtDate(inspDate.get(x.closed_inspection_id) ?? '') : '', x.closed_comment, x.photo_count,
  ]);
  // Semikolon og BOM gjør at norsk Excel åpner filen riktig.
  const csv = '\ufeff' + [head, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n');
  const f = await writeTempText(`${baseName(d.b)}.csv`, csv);
  await Sharing.shareAsync(f.uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text', dialogTitle: 'Del avviksliste (CSV)' });
}
