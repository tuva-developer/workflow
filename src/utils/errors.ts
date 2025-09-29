import type { AxiosError } from 'axios';

type APIErrorShape = {
  name?: string;
  status?: number;
  data?: unknown;
  message?: string;
};

const pickMsgFromData = (data: unknown): string | undefined => {
  if (!data) return;

  if (typeof data === 'string') return data;

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;

    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.error === 'string') return obj.error;

    const errs = obj.errors;

    if (Array.isArray(errs) && errs.length) return String(errs[0]);

    if (errs && typeof errs === 'object') {
      const rec = errs as Record<string, unknown>;
      const k = Object.keys(rec)[0];
      const v = k ? rec[k] : undefined;

      if (Array.isArray(v) && v.length) return String(v[0]);
      if (v != null) return String(v);
    }
  }
};

const isAxiosErr = (e: unknown): e is AxiosError =>
  typeof e === 'object' &&
  e !== null &&
  'isAxiosError' in e &&
  Boolean((e as { isAxiosError?: boolean }).isAxiosError);

const isAPIErrShape = (e: unknown): e is APIErrorShape =>
  typeof e === 'object' &&
  e !== null &&
  (
    (e as { name?: string }).name === 'APIError' ||
    ('status' in e && 'data' in e)
  );

export function extractErrorMessage(err: unknown): { message: string; status?: number } {
  if (typeof err === 'string') return { message: err };

  if (isAPIErrShape(err)) {
    const msg = pickMsgFromData(err.data) ?? err.message;
    return {
      message: msg || `HTTP ${err.status ?? ''}`.trim(),
      status: err.status,
    };
  }

  if (isAxiosErr(err)) {
    const msg = pickMsgFromData(err.response?.data) ?? err.message;
    return {
      message: msg || `HTTP ${err.response?.status ?? ''}`.trim(),
      status: err.response?.status,
    };
  }

  if (err instanceof Error && err.message) {
    return { message: err.message };
  }

  return { message: 'Something went wrong' };
}