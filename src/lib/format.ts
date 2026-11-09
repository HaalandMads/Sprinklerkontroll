export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function todayIso(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** ÅÅÅÅ-MM-DD -> DD.MM.ÅÅÅÅ */
export function fmtDate(iso?: string | null): string {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

/** Godtar DD.MM.ÅÅÅÅ eller ÅÅÅÅ-MM-DD og returnerer ÅÅÅÅ-MM-DD, eller null hvis ugyldig. */
export function parseDate(input: string): string | null {
  const t = input.trim();
  let y: number, m: number, d: number;
  let r = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(t);
  if (r) {
    d = +r[1]; m = +r[2]; y = +r[3];
  } else {
    r = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
    if (!r) return null;
    y = +r[1]; m = +r[2]; d = +r[3];
  }
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${y}-${p(m)}-${p(d)}`;
}

export function fmtSize(bytes?: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function safeFileName(name: string): string {
  return name.replace(/[^\p{L}\p{N}._-]+/gu, '_').replace(/_+/g, '_').slice(0, 80) || 'fil';
}
