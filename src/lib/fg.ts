import { FG_POINTS, FG_POSITIONS, FgCategory, FgPoint } from '../data/fg920';
import type { InspectionType, SystemChoice } from './db';
import type { Severity } from './theme';

export const systemLabel: Record<SystemChoice, string> = {
  '12845': 'NS-EN 12845',
  '16925': 'NS-EN 16925 (bolig)',
  begge: 'NS-EN 12845 og NS-EN 16925',
};
export const typeLabel: Record<InspectionType, string> = {
  forste: 'Uavhengig 1. gangskontroll',
  rutine: 'Rutinekontroll',
};
export const categoryLabel: Record<FgCategory, string> = {
  stor: 'Stor', middels: 'Middels', liten: 'Liten', merknad: 'Merknad', iv: 'Ingen anleggsvurdering',
};

export const pointByCode = (code?: string | null): FgPoint | undefined => FG_POINTS.find((p) => p.code === code);
export const positionTitle = (pos: string) => FG_POSITIONS[pos] ?? '';

/** Gjelder punktet for valgt anleggssystem? Alle punkter har referanse til NS-EN 12845. */
export function appliesTo(p: FgPoint, system: SystemChoice): boolean {
  return system === '16925' ? p.applies16925 : true;
}

/** Kontrollpunktene som skal med: alle ved 1. gangskontroll, bare de merket for rutinekontroll ellers (FG-920 A-1). */
export function pointsFor(system: SystemChoice, type: InspectionType): FgPoint[] {
  return FG_POINTS.filter((p) => appliesTo(p, system) && (type === 'forste' ? p.first : p.routine));
}

export function groupByPosition(points: FgPoint[]): { pos: string; title: string; points: FgPoint[] }[] {
  const out: { pos: string; title: string; points: FgPoint[] }[] = [];
  for (const p of points) {
    let g = out.find((x) => x.pos === p.pos);
    if (!g) {
      g = { pos: p.pos, title: positionTitle(p.pos), points: [] };
      out.push(g);
    }
    g.points.push(p);
  }
  return out;
}

/** Foreslått alvorlighetsgrad fra FGs anbefaling (den mest alvorlige når flere er mulige). */
export function suggestedSeverity(cats: FgCategory[]): Severity {
  for (const c of ['stor', 'middels', 'liten', 'merknad'] as const) if (cats.includes(c)) return c;
  return cats.includes('iv') ? 'stor' : 'merknad';
}

export function refsFor(p: FgPoint, system: SystemChoice): string {
  const a = `NS-EN 12845: ${p.ref12845 || '–'}`;
  const b = `NS-EN 16925: ${p.ref16925 || '–'}`;
  return system === '12845' ? a : system === '16925' ? b : `${a}\n${b}`;
}
