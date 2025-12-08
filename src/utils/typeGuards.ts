export const asObject = (v: unknown): Record<string, unknown> | null =>
  typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : null;

export const asArray = (v: unknown): unknown[] | null =>
  Array.isArray(v) ? v : null;

export const asNumber = (v: unknown, fallback: number): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

export const asBoolean = (v: unknown, fallback: boolean): boolean =>
  typeof v === 'boolean' ? v : fallback;

export function asString(value: unknown, fallback: string = ''): string {
  return typeof value === 'string' ? value : fallback;
}