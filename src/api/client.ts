import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { tokenStorage } from '@/auth/token-storage';
import { refresh as bearerRefresh } from '@/auth/auth-api';
import { getRuntimeConfig } from '@/utils/defines';

const { API_BASE_URL, SECURE_FLAG } = getRuntimeConfig();

export class APIError<T = unknown> extends Error {
  status?: number;
  data?: T;
  constructor(message: string, opts?: { status?: number; data?: T }) {
    super(message);
    this.name = 'APIError';
    this.status = opts?.status;
    this.data = opts?.data;
  }
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: SECURE_FLAG,
  headers: { 'Content-Type': 'application/json' },
});

function withAuthHeader(config: AxiosRequestConfig): AxiosRequestConfig {
  if (!SECURE_FLAG) {
    const token = tokenStorage.getAccess();
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function cookieRefresh(): Promise<void> {
  try {
    await http.post('/oauth/refresh', null);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new APIError(err.message ?? 'Cookie refresh failed', {
        status: err.response?.status,
        data: err.response?.data,
      });
    }
    throw new APIError('Cookie refresh failed', {});
  }
}
async function bearerModeRefresh(): Promise<void> {
  const newAccess = await bearerRefresh();
  if (!newAccess) {
    throw new APIError('Refresh failed: no access token', { status: 401 });
  }
}

async function doRefreshOnce(): Promise<void> {
  if (SECURE_FLAG) {
    await cookieRefresh();
  } else {
    await bearerModeRefresh();
  }
}

export async function requestWithRefresh<T = unknown>(
  config: AxiosRequestConfig & { _retry?: boolean }
): Promise<AxiosResponse<T>> {
  try {
    return await http.request<T>(withAuthHeader(config));
  } catch (err) {
    const error = err as AxiosError<unknown>;
    const status = error.response?.status;

    if (status !== 401) {
      throw new APIError(error.message, { status, data: error.response?.data });
    }
    if (config._retry) {
      throw new APIError('Unauthorized after refresh', {
        status,
        data: error.response?.data,
      });
    }

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          await doRefreshOnce();
        } finally {
          isRefreshing = false;
        }
      })();
    }

    try {
      await refreshPromise;
    } finally {
      refreshPromise = null;
    }

    const retried: AxiosRequestConfig & { _retry?: boolean } = {
      ...config,
      _retry: true,
    };

    try {
      return await http.request<T>(withAuthHeader(retried));
    } catch (e) {
      const rerr = e as AxiosError<unknown>;
      throw new APIError(rerr?.message ?? 'Request failed after refresh', {
        status: rerr?.response?.status,
        data: rerr?.response?.data,
      });
    }
  }
}