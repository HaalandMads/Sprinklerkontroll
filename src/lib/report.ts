import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import {
  Building, CapacityTest, DeviationListItem, InspectionListItem, deviationCountsByPoint, getBuilding, getInspection,
  listCapacityTests, listCarriedDeviations, listDeviationsForBuilding, listDeviationsForInspection, listInspections,
  listPhotosForBuilding, listPointStates,
} from './db';
import { chartSvgString, evaluate } from './capacity';
import { fmtDate, safeFileName, todayIso } from './format';
import { photoBase64, writeTempText } from './files';
import { severityOf } from './theme';
import { groupByPosition, pointByCode, pointsFor, systemLabel, typeLabel } from './fg';
import { getCompany, logoDataUrl } from './settings';

export const APP_NAME = 'Sprinklerkontroll';
export const APP_AUTHOR = 'Mads Fjærem';

const esc = (s: string) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br/>');

function address(b: Building) {
  return [b.street, [b.postal_code, b.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

const CSS = `
  @page { margin: 16mm 14mm; }
  body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color:#16202A; font-size:10.5pt; }
  h1 { font-size:18pt; margin:0 0 2px; } h2 { font-size:12.5pt; margin:18px 0 6px; border-bottom:1px solid #D5DBE0; padding-bottom:3px; }
  h3 { font-size:10.5pt; margin:10px 0 4px; color:#5B6670; }
  .sub { color:#5B6670; margin:0 0 10px; }
  .brand { display:flex; align-items:center; justify-content:space-between; gap:12px; border-bottom:2px solid #16202A; padding-bottom:8px; margin-bottom:12px; }
  .brand img { max-height:48px; max-width:220px; }
  .brand .firm { font-size:11pt; font-weight:700; text-align:right; }
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
  .st-ok { color:#2E7D32; font-weight:600; } .st-avvik { color:#C62828; font-weight:600; } .st-ia { color:#5B6670; } .st-none { color:#8A949E; }
  .note { color:#5B6670; font-size:9pt; }
  .foot { margin-top:20px; color:#5B6670; font-size:8.5pt; }
`;

/** Topptekst med kontrollørens firmanavn og logo, hvis de er lagt inn. */
async function brandHtml(): Promise<string> {
  const c = await getCompany();
  const logo = await logoDataUrl(c.logo);
  if (!c.name && !logo) return '';
  return `<div class="brand"><div>${logo ? `<img src="${logo}"/>` : ''}</div><div class="firm">${esc(c.name)}</div></div>`;
}

function page(title: string, body: string, brand: string): string {
  return `<!DOCTYPE html><html lang="no"><head><meta charset="utf-8"/><title>${esc(title)}</title><style>${CSS}</style></head><body>
  ${brand}${body}
  <p class="foot">Laget med ${APP_NAME} av ${APP_AUTHOR}. Kontrollpunkter og kategorier etter FG-920:5. Rapporten inneholder kontaktopplysninger og skal ikke deles utenfor godkjente systemer.</p>
  </body></html>`;
}

function contactTable(b: Building, extra: [string, string][]): string {
  const rows: [string, string][] = [
    ['Kontaktperson', b.contact_name || '–'],
    ['Mobil', b.contact_phone || '–'],
    ['E-post', b.contact_email || '–'],
    ...extra,
  ];
  return `<table class="grid">${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>`;
}

async function photosByDeviation(buildingId: string): Promise<Map<string, string[]>> {
  const m = new Map<string, string[]>();
  for (const p of await listPhotosForBuilding(buildingId)) {
    const arr = m.get(p.deviation_id) ?? [];
    arr.push(p.thumb);
    m.set(p.deviation_id, arr);
  }
  return m;
}

async function devBlock(x: DeviationListItem, photos: Map<string, string[]>, inspDate: Map<string, string>): Promise<string> {
  const sev = severityOf(x.severity);
  const imgs: string[] = [];
  for (const t of photos.get(x.id) ?? []) {
    const b64 = await photoBase64(t);
    if (b64) imgs.push(`<img src="data:image/jpeg;base64,${b64}"/>`);
  }
  const closed = x.status === 'lukket';
  const pt = pointByCode(x.point_code);
  const closedInsp = x.closed_inspection_id ? inspDate.get(x.closed_inspection_id) : undefined;
  return `
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
        ${closed ? `<tr><td>Lukket</td><td>${fmtDate(x.closed_at)}${closedInsp ? ' (kontroll ' + fmtDate(closedInsp) + ')' : ''}${x.closed_comment ? ': ' + esc(x.closed_comment) : ''}</td></tr>` : ''}
      </table>
      ${x.comment ? `<p class="comment">${esc(x.comment)}</p>` : ''}
      ${imgs.length ? `<div class="imgs">${imgs.join('')}</div>` : ''}
    </div>`;
}

async function devList(list: DeviationListItem[], photos: Map<string, string[]>, inspDate: Map<string, string>, empty: string) {
  if (!list.length) return `<p>${esc(empty)}</p>`;
  let out = '';
  for (const x of list) out += await devBlock(x, photos, inspDate);
  return out;
}

function sumLine(list: DeviationListItem[]): string {
  const c = (k: string) => list.filter((x) => x.severity === k).length;
  return `<div class="sum"><span>Stor: ${c('stor')}</span><span>Middels: ${c('middels')}</span><span>Liten: ${c('liten')}</span><span>Merknad: ${c('merknad')}</span></div>`;
}

function capHtml(caps: CapacityTest[]): string {
  if (!caps.length) return '';
  const n = (x: number, dd = 2) => x.toFixed(dd).replace('.', ',');
  let out = '<h2>Kapasitetsmålinger</h2>';
  for (const t of caps) {
    const ev = evaluate(t.points, t.reqs);
    const status = ev.status === 'innenfor' ? '<b style="color:#2E7D32">Innenfor kravet</b>' : ev.status === 'utenfor' ? '<b style="color:#C62828">Utenfor kravet</b>' : '<b>Ikke nok data</b>';
    const pts = t.points.map((p) => `<tr><td>${n(p.q, 0)}</td><td>${n(p.p)}</td></tr>`).join('');
    const reqs = ev.results.map((r) => `<tr><td>${esc(r.label || 'Krav')}</td><td>${n(r.q, 0)}</td><td>${n(r.p)}</td><td>${n(r.available)}</td><td>${r.margin >= 0 ? '+' : ''}${n(r.margin)}${r.extrapolated ? ' (ekstrapolert)' : ''}</td></tr>`).join('');
    out += `<div class="dev" style="border-left-color:#1D5C8C">
      <div class="devhead"><span class="title">${fmtDate(t.date)}${t.location ? ' – ' + esc(t.location) : ''}</span><span>${status}</span></div>
      <table class="list"><tr><th>Vannmengde (l/min)</th><th>Trykk (bar)</th></tr>${pts}</table>
      ${reqs ? `<table class="list" style="margin-top:6px"><tr><th>Krav</th><th>l/min</th><th>Krav bar</th><th>Tilgjengelig bar</th><th>Margin bar</th></tr>${reqs}</table>` : ''}
      <p class="comment">${esc(ev.message)}</p>
      <div style="margin-top:6px">${chartSvgString(t.points, t.reqs)}</div>
      ${t.notes ? `<p class="comment">${esc(t.notes)}</p>` : ''}
    </div>`;
  }
  return out;
}

// ---------- Avviksoversikt for et bygg ----------

type BuildingData = { b: Building; devs: DeviationListItem[]; insps: InspectionListItem[]; photos: Map<string, string[]>; caps: CapacityTest[] };

async function loadBuilding(buildingId: string, includeClosed: boolean): Promise<BuildingData> {
  const b = await getBuilding(buildingId);
  if (!b) throw new Error('Fant ikke bygget.');
  const all = await listDeviationsForBuilding(buildingId);
  return {
    b,
    devs: includeClosed ? all : all.filter((d) => d.status === 'apen'),
    insps: await listInspections(buildingId),
    photos: await photosByDeviation(buildingId),
    caps: await listCapacityTests(buildingId),
  };
}

async function buildingHtml(d: BuildingData, includeClosed: boolean): Promise<string> {
  const { b, devs, insps, photos, caps } = d;
  const inspDate = new Map(insps.map((i) => [i.id, i.date]));
  const inspRows = insps
    .map((i) => `<tr><td>${fmtDate(i.date)}</td><td>${esc(typeLabel[i.type] ?? i.type)}</td><td>${esc(systemLabel[i.system] ?? i.system)}</td><td>${esc(i.inspector)}</td><td>${i.new_count}</td><td>${i.closed_count}</td></tr>`)
    .join('');
  const body = `
  <h1>Avviksoversikt – ${esc(b.title)}</h1>
  <p class="sub">${esc(address(b))}</p>
  ${contactTable(b, [['Utskrevet', fmtDate(todayIso())], ['Innhold', includeClosed ? 'Alle avvik, også lukkede' : 'Bare åpne avvik']])}
  <h2>Åpne avvik</h2>
  ${sumLine(devs.filter((x) => x.status === 'apen'))}
  <h2>Kontroller</h2>
  ${insps.length ? `<table class="list"><tr><th>Dato</th><th>Type</th><th>Anlegg</th><th>Kontrollør</th><th>Nye avvik</th><th>Lukket</th></tr>${inspRows}</table>` : '<p>Ingen kontroller registrert.</p>'}
  <h2>Avvik</h2>
  ${await devList(devs, photos, inspDate, 'Ingen avvik.')}
  ${capHtml(caps)}`;
  return page(`Avviksoversikt ${b.title}`, body, await brandHtml());
}

// ---------- Rapport for én kontroll ----------

const statusText = (st: string | undefined, n: number) => {
  if (n > 0 || st === 'avvik') return `<span class="st-avvik">Avvik${n > 0 ? ` (${n})` : ''}</span>`;
  if (st === 'ok') return '<span class="st-ok">OK</span>';
  if (st === 'ia') return '<span class="st-ia">Ikke aktuelt</span>';
  return '<span class="st-none">Ikke vurdert</span>';
};

async function inspectionHtml(inspectionId: string): Promise<{ html: string; name: string }> {
  const insp = await getInspection(inspectionId);
  if (!insp) throw new Error('Fant ikke kontrollen.');
  const b = await getBuilding(insp.building_id);
  if (!b) throw new Error('Fant ikke bygget.');
  const company = await getCompany();
  const newDevs = await listDeviationsForInspection(inspectionId);
  const carried = await listCarriedDeviations(insp);
  const closedHere = carried.filter((d) => d.status === 'lukket');
  const stillOpen = carried.filter((d) => d.status === 'apen');
  const states = await listPointStates(inspectionId);
  const counts = await deviationCountsByPoint(inspectionId);
  const groups = groupByPosition(pointsFor(insp.system, insp.type));
  const all = groups.flatMap((g) => g.points);
  const photos = await photosByDeviation(b.id);
  const inspDate = new Map((await listInspections(b.id)).map((i) => [i.id, i.date]));
  const caps = (await listCapacityTests(b.id)).filter((t) => t.date === insp.date);

  const nOk = all.filter((p) => states.get(p.code)?.status === 'ok' && !(counts.get(p.code) ?? 0)).length;
  const nAvvik = all.filter((p) => (counts.get(p.code) ?? 0) > 0 || states.get(p.code)?.status === 'avvik').length;
  const nIa = all.filter((p) => states.get(p.code)?.status === 'ia' && !(counts.get(p.code) ?? 0)).length;
  const nNone = all.length - nOk - nAvvik - nIa;

  const checklist = groups.map((g) => `
    <h3>Pos. ${g.pos} ${esc(g.title)}</h3>
    <table class="list"><tr><th style="width:9%">Punkt</th><th>Kontrollpunkt</th><th style="width:15%">Status</th><th style="width:34%">Notat</th></tr>
    ${g.points.map((p) => `<tr><td>${p.code}</td><td>${esc(p.title)}</td><td>${statusText(states.get(p.code)?.status, counts.get(p.code) ?? 0)}</td><td>${esc(states.get(p.code)?.note ?? '')}</td></tr>`).join('')}
    </table>`).join('');

  const body = `
  <h1>Kontrollrapport – ${esc(b.title)}</h1>
  <p class="sub">${esc(address(b))}</p>
  ${contactTable(b, [
    ['Kontrolldato', fmtDate(insp.date)],
    ['Kontrolltype', typeLabel[insp.type] ?? insp.type],
    ['Anlegg', systemLabel[insp.system] ?? insp.system],
    ['Kontrollør', [insp.inspector, company.name].filter(Boolean).join(', ') || '–'],
    ['Utskrevet', fmtDate(todayIso())],
  ])}
  ${insp.notes ? `<p class="comment">${esc(insp.notes)}</p>` : ''}

  <h2>Oppsummering</h2>
  <p>${all.length} kontrollpunkter etter FG-920:5: ${nOk} OK, ${nAvvik} med avvik, ${nIa} ikke aktuelle, ${nNone} ikke vurdert.</p>
  <h3>Nye avvik i denne kontrollen (${newDevs.length})</h3>
  ${sumLine(newDevs)}
  <p>${closedHere.length} tidligere avvik lukket i kontrollen. ${stillOpen.length} tidligere avvik fortsatt åpne.</p>

  <h2>Avvik registrert i kontrollen</h2>
  ${await devList(newDevs, photos, inspDate, 'Ingen nye avvik.')}

  ${closedHere.length ? `<h2>Tidligere avvik lukket i kontrollen</h2>${await devList(closedHere, photos, inspDate, '')}` : ''}

  ${stillOpen.length ? `<h2>Tidligere avvik som fortsatt er åpne</h2><p class="note">Status per utskriftsdato.</p>${await devList(stillOpen, photos, inspDate, '')}` : ''}

  ${capHtml(caps)}

  <h2>Sjekkliste</h2>
  ${checklist}`;
  return { html: page(`Kontrollrapport ${b.title}`, body, await brandHtml()), name: `Kontroll_${safeFileName(b.title)}_${insp.date}` };
}

// ---------- Deling og utskrift ----------

async function sharePdfHtml(html: string, name: string, title: string) {
  const { uri } = await Print.printToFileAsync({ html });
  const target = new File(Paths.cache, `${name}.pdf`);
  if (target.exists) target.delete();
  await new File(uri).copy(target, { overwrite: true });
  await Sharing.shareAsync(target.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: title });
}

const buildingName = (b: Building) => `Avvik_${safeFileName(b.title)}_${todayIso()}`;

export async function sharePdf(buildingId: string, includeClosed: boolean) {
  const d = await loadBuilding(buildingId, includeClosed);
  await sharePdfHtml(await buildingHtml(d, includeClosed), buildingName(d.b), 'Del avviksoversikt');
}

export async function printReport(buildingId: string, includeClosed: boolean) {
  const d = await loadBuilding(buildingId, includeClosed);
  await Print.printAsync({ html: await buildingHtml(d, includeClosed) });
}

export async function shareInspectionPdf(inspectionId: string) {
  const { html, name } = await inspectionHtml(inspectionId);
  await sharePdfHtml(html, name, 'Del kontrollrapport');
}

export async function printInspectionReport(inspectionId: string) {
  const { html } = await inspectionHtml(inspectionId);
  await Print.printAsync({ html });
}

const csvCell = (v: unknown) => {
  const s = String(v ?? '');
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function shareCsv(buildingId: string, includeClosed: boolean) {
  const d = await loadBuilding(buildingId, includeClosed);
  const inspDate = new Map(d.insps.map((i) => [i.id, i.date]));
  const head = ['Nr', 'Kontrollpunkt', 'Overskrift', 'Plassering', 'Alvorlighetsgrad', 'Status', 'Registrert', 'Kommentar', 'Lukket dato', 'Lukket under kontroll', 'Kommentar ved lukking', 'Antall bilder'];
  const rows = d.devs.map((x) => [
    `A-${x.nr}`, (() => { const p = pointByCode(x.point_code); return p ? `${p.code} ${p.title}` : 'Annet avvik'; })(), x.title, x.location, severityOf(x.severity).label, x.status === 'apen' ? 'Åpen' : 'Lukket',
    fmtDate(x.inspection_date), x.comment, fmtDate(x.closed_at),
    x.closed_inspection_id ? fmtDate(inspDate.get(x.closed_inspection_id) ?? '') : '', x.closed_comment, x.photo_count,
  ]);
  // Semikolon og BOM gjør at norsk Excel åpner filen riktig.
  const csv = '\ufeff' + [head, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n');
  const f = await writeTempText(`${buildingName(d.b)}.csv`, csv);
  await Sharing.shareAsync(f.uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text', dialogTitle: 'Del avviksliste (CSV)' });
}
