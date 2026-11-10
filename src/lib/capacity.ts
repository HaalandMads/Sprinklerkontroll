import type { MeasPoint, ReqPoint } from './db';

export const EXP = 1.85; // samme eksponent som i Hazen-Williams

export type Fit = { p0: number; k: number; qMax: number; n: number };
export type ReqResult = ReqPoint & { available: number; margin: number; ok: boolean; extrapolated: boolean };
export type Evaluation = { fit: Fit | null; results: ReqResult[]; status: 'innenfor' | 'utenfor' | 'ukjent'; message: string };

/** Godtar komma som desimaltegn. Tom eller ugyldig tekst gir NaN. */
export function parseNum(s: string): number {
  const t = s.trim().replace(/\s/g, '').replace(',', '.');
  return t === '' ? NaN : Number(t);
}

/** Tilpasser p = p0 - k·Q^1,85 med minste kvadraters metode. */
export function fitCurve(points: MeasPoint[]): Fit | null {
  const pts = points.filter((x) => Number.isFinite(x.q) && Number.isFinite(x.p) && x.q >= 0);
  if (pts.length < 2) return null;
  const xs = pts.map((x) => Math.pow(x.q, EXP));
  const ys = pts.map((x) => x.p);
  const n = pts.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); }
  if (sxx === 0) return null;
  const slope = sxy / sxx; // = -k
  const k = Math.max(0, -slope);
  const p0 = k === 0 ? my : my + k * mx;
  return { p0, k, qMax: Math.max(...pts.map((x) => x.q)), n };
}

export const pressureAt = (f: Fit, q: number) => f.p0 - f.k * Math.pow(Math.max(0, q), EXP);

export function evaluate(points: MeasPoint[], reqs: ReqPoint[]): Evaluation {
  const fit = fitCurve(points);
  const valid = reqs.filter((r) => Number.isFinite(r.q) && Number.isFinite(r.p) && r.q > 0);
  if (!fit) return { fit, results: [], status: 'ukjent', message: 'Legg inn minst to målepunkter med ulik vannmengde, for eksempel statisk trykk (0 l/min) og ett punkt med uttak.' };
  if (valid.length === 0) return { fit, results: [], status: 'ukjent', message: 'Legg inn minstekravet fra dokumentasjonen (vannmengde og trykk).' };
  const results = valid.map((r) => {
    const available = pressureAt(fit, r.q);
    const margin = available - r.p;
    return { ...r, available, margin, ok: margin >= 0, extrapolated: r.q > fit.qMax * 1.0001 };
  });
  const allOk = results.every((r) => r.ok);
  const extra = results.some((r) => r.extrapolated);
  let message = allOk ? 'Målt kapasitet dekker minstekravet.' : 'Målt kapasitet dekker ikke minstekravet.';
  if (extra) message += ' Minst ett krav ligger over største målte vannmengde, så tilgjengelig trykk er regnet ut fra kurven (ekstrapolert). Etter FG-920 5.3 gir delvis måling merknad når den stemmer med en kalibrert nettverksberegning, ellers avvik.';
  return { fit, results, status: allOk ? 'innenfor' : 'utenfor', message };
}

// ---------- Grafmodell (felles for app og PDF) ----------
export type ChartShape =
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number; color: string; width: number; dash?: string }
  | { t: 'path'; d: string; color: string; width: number; dash?: string }
  | { t: 'circle'; x: number; y: number; r: number; fill: string; stroke: string }
  | { t: 'rect'; x: number; y: number; w: number; h: number; fill: string; stroke: string }
  | { t: 'text'; x: number; y: number; text: string; size: number; color: string; anchor: 'start' | 'middle' | 'end'; bold?: boolean };

function niceStep(max: number, ticks: number) {
  const raw = max / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}

export function chartModel(points: MeasPoint[], reqs: ReqPoint[], w: number, h: number): ChartShape[] {
  const ev = evaluate(points, reqs);
  const pad = { l: 44, r: 12, t: 12, b: 40 };
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
  const qs = [...points.map((x) => x.q), ...reqs.map((x) => x.q)].filter(Number.isFinite);
  const ps = [...points.map((x) => x.p), ...reqs.map((x) => x.p), ev.fit ? ev.fit.p0 : 0].filter(Number.isFinite);
  const qMax = Math.max(10, ...qs) * 1.15;
  const pMax = Math.max(1, ...ps) * 1.15;
  const qStep = niceStep(qMax, 5), pStep = niceStep(pMax, 5);
  const qTop = Math.ceil(qMax / qStep) * qStep, pTop = Math.ceil(pMax / pStep) * pStep;
  const X = (q: number) => pad.l + (q / qTop) * pw;
  const Y = (p: number) => pad.t + ph - (Math.max(0, p) / pTop) * ph;
  const grid = '#E3E7EB', ax = '#8A949E', ink = '#16202A';
  const s: ChartShape[] = [];
  for (let q = 0; q <= qTop + 1e-9; q += qStep) {
    s.push({ t: 'line', x1: X(q), y1: pad.t, x2: X(q), y2: pad.t + ph, color: grid, width: 1 });
    s.push({ t: 'text', x: X(q), y: pad.t + ph + 14, text: String(Math.round(q)), size: 10, color: ax, anchor: 'middle' });
  }
  for (let p = 0; p <= pTop + 1e-9; p += pStep) {
    s.push({ t: 'line', x1: pad.l, y1: Y(p), x2: pad.l + pw, y2: Y(p), color: grid, width: 1 });
    s.push({ t: 'text', x: pad.l - 6, y: Y(p) + 3, text: String(Math.round(p * 10) / 10).replace('.', ','), size: 10, color: ax, anchor: 'end' });
  }
  s.push({ t: 'line', x1: pad.l, y1: pad.t + ph, x2: pad.l + pw, y2: pad.t + ph, color: ax, width: 1 });
  s.push({ t: 'line', x1: pad.l, y1: pad.t, x2: pad.l, y2: pad.t + ph, color: ax, width: 1 });
  s.push({ t: 'text', x: pad.l + pw / 2, y: h - 6, text: 'Vannmengde (l/min)', size: 11, color: ink, anchor: 'middle' });
  s.push({ t: 'text', x: 4, y: pad.t + 2, text: 'bar', size: 11, color: ink, anchor: 'start' });
  if (ev.fit) {
    const f = ev.fit;
    const seg = (from: number, to: number) => {
      let d = '';
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const q = from + ((to - from) * i) / steps;
        const p = pressureAt(f, q);
        if (p < 0) break;
        d += `${i === 0 ? 'M' : 'L'}${X(q).toFixed(1)} ${Y(p).toFixed(1)} `;
      }
      return d;
    };
    s.push({ t: 'path', d: seg(0, f.qMax), color: '#1D5C8C', width: 2.5 });
    if (qTop > f.qMax) s.push({ t: 'path', d: seg(f.qMax, qTop), color: '#1D5C8C', width: 2, dash: '5 4' });
  }
  for (const m of points) if (Number.isFinite(m.q) && Number.isFinite(m.p)) s.push({ t: 'circle', x: X(m.q), y: Y(m.p), r: 4.5, fill: '#1D5C8C', stroke: '#FFFFFF' });
  for (const r of ev.results) {
    const c = r.ok ? '#2E7D32' : '#C62828';
    s.push({ t: 'rect', x: X(r.q) - 5, y: Y(r.p) - 5, w: 10, h: 10, fill: c, stroke: '#FFFFFF' });
    s.push({ t: 'text', x: X(r.q) + 8, y: Y(r.p) - 7, text: r.label || 'Krav', size: 10, color: c, anchor: 'start', bold: true });
  }
  return s;
}

export function chartSvgString(points: MeasPoint[], reqs: ReqPoint[], w = 520, h = 260): string {
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const body = chartModel(points, reqs, w, h).map((x) => {
    switch (x.t) {
      case 'line': return `<line x1="${x.x1}" y1="${x.y1}" x2="${x.x2}" y2="${x.y2}" stroke="${x.color}" stroke-width="${x.width}"${x.dash ? ` stroke-dasharray="${x.dash}"` : ''}/>`;
      case 'path': return `<path d="${x.d}" fill="none" stroke="${x.color}" stroke-width="${x.width}"${x.dash ? ` stroke-dasharray="${x.dash}"` : ''}/>`;
      case 'circle': return `<circle cx="${x.x}" cy="${x.y}" r="${x.r}" fill="${x.fill}" stroke="${x.stroke}" stroke-width="1.5"/>`;
      case 'rect': return `<rect x="${x.x}" y="${x.y}" width="${x.w}" height="${x.h}" fill="${x.fill}" stroke="${x.stroke}" stroke-width="1.5"/>`;
      case 'text': return `<text x="${x.x}" y="${x.y}" font-size="${x.size}" fill="${x.color}" text-anchor="${x.anchor}"${x.bold ? ' font-weight="700"' : ''} font-family="Helvetica, Arial, sans-serif">${esc(x.text)}</text>`;
    }
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
}
