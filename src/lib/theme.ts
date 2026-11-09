// Fargepalett og mål. Alvorlighetsgrad er det eneste sterke fargeelementet i appen.
export const colors = {
  ink: '#16202A',
  muted: '#5B6670',
  line: '#D5DBE0',
  surface: '#F2F4F6',
  card: '#FFFFFF',
  accent: '#1D5C8C',
  accentPressed: '#164A71',
  danger: '#B3261E',
  closed: '#2E7D32',
};

export type Severity = 'stor' | 'middels' | 'liten' | 'merknad';

export const severities: { key: Severity; label: string; color: string; text: string }[] = [
  { key: 'stor', label: 'Stor', color: '#C62828', text: '#FFFFFF' },
  { key: 'middels', label: 'Middels', color: '#E07B00', text: '#FFFFFF' },
  { key: 'liten', label: 'Liten', color: '#D4A900', text: '#16202A' },
  { key: 'merknad', label: 'Merknad', color: '#6B7B8C', text: '#FFFFFF' },
];

export const severityOf = (key: string) => severities.find((s) => s.key === key) ?? severities[3];

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24 };
export const touch = 48;
