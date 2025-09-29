import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { showError, showSuccess } from '@/utils/toastConfig';
import i18n from '@/i18n';
import { asObject } from '@/utils/typeGuards';

type MutationMetaMessages = {
  successMessage?: string;
  errorMessage?: string;
};

const pickStatus = (err: unknown): number | undefined => {
  const o = asObject(err);
  if (!o) return undefined;

  const resp = asObject(o.response);
  const statusResp = typeof resp?.status === 'number' ? resp.status : undefined;

  const statusTop = typeof o.status === 'number' ? o.status : undefined;

  return statusResp ?? statusTop;
};

const pickMessage = (err: unknown): string | undefined => {
  const o = asObject(err);
  if (!o) return undefined;

  const resp = asObject(o.response);
  const data = asObject(resp?.data) ?? asObject(o.data);
  const msgFromData =
    (typeof data?.message === 'string' && data.message) ||
    (typeof o.message === 'string' && o.message) ||
    undefined;

  return msgFromData;
};

function getErrorMessage(err: unknown): string {
  const status = pickStatus(err);
  const detail = pickMessage(err) ?? 'An unexpected error occurred';
  const text = i18n.t(detail);
  return typeof status === 'number' ? `[${status}] ${text}` : text;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      showError(`${i18n.t('Failed to load data')}: ${query.queryKey.join(' • ')}`);
      console.error('Query error:', query.queryKey, error);
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (_data, _vars, _ctx, mutation) => {
      const meta = mutation.options?.meta as MutationMetaMessages | undefined;
      const msg = meta?.successMessage;
      if (msg) showSuccess(i18n.t(msg));
    },
    onError: (error, _vars, _ctx, mutation) => {
      const meta = mutation.options?.meta as MutationMetaMessages | undefined;
      const msg = meta?.errorMessage ?? getErrorMessage(error);
      showError(i18n.t(msg));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        const status = pickStatus(error);
        return typeof status === 'number'
          ? !(status >= 400 && status < 500) && failureCount < 1
          : failureCount < 1;
      },
      throwOnError: (error) => {
        const status = pickStatus(error);
        return typeof status === 'number' ? status >= 500 : false;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});