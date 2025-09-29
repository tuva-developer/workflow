import axios from 'axios';
import { tokenStorage } from '@/auth/token-storage';
import { requestWithRefresh } from '@/api/client';
import { getRuntimeConfig } from '@/utils/defines';
import { delay } from '@/utils/mock';
import { mockUsers } from '@/mockData';

export type LoginInput = { username: string; password: string };
export type LoginResponse = { access_token?: string; refresh_token?: string };
export type RefreshResponse = { access_token?: string; refresh_token?: string };

export async function login(input: LoginInput): Promise<LoginResponse> {
  const { API_BASE_URL, SECURE_FLAG, MOCK_MODE } = getRuntimeConfig();

  if (MOCK_MODE) {
    await delay(300);
    const found = mockUsers.find(u => u.userId === input.username);
    if (!found) return {};
    tokenStorage.setAccess('mock_access');
    tokenStorage.setRefresh('mock_refresh');
    return { access_token: 'mock_access', refresh_token: 'mock_refresh' };
  }

  const form = new URLSearchParams();
  form.append('username', input.username);
  form.append('password', input.password);

  if (SECURE_FLAG) {
    await axios.post(`${API_BASE_URL}/oauth/login`, form, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return {};
  } else {
    const { data } = await axios.post<LoginResponse>(
      `${API_BASE_URL}/oauth/login`,
      form,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (data?.access_token) tokenStorage.setAccess(data.access_token);
    if (data?.refresh_token) tokenStorage.setRefresh(data.refresh_token);

    return data;
  }
}

export async function refresh(): Promise<string | null> {
  const { API_BASE_URL, SECURE_FLAG, MOCK_MODE } = getRuntimeConfig();

  if (MOCK_MODE) {
    await delay(200);
    tokenStorage.setAccess('mock_access');
    tokenStorage.setRefresh('mock_refresh');
    return 'mock_access';
  }

  if (SECURE_FLAG) {
    try {
      await axios.post(`${API_BASE_URL}/oauth/refresh`, null, {
        withCredentials: true,
      });
      return null;
    } catch {
      tokenStorage.clear();
      return null;
    }
  } else {
    try {
      const refreshToken = tokenStorage.getRefresh();
      if (!refreshToken) {
        tokenStorage.clear();
        return null;
      }

      const { data } = await axios.post<RefreshResponse>(
        `${API_BASE_URL}/oauth/refresh`,
        null,
        {
          headers: {
            'refresh_token': refreshToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (data?.access_token) tokenStorage.setAccess(data.access_token);
      if (data?.refresh_token) tokenStorage.setRefresh(data.refresh_token);

      return data?.access_token ?? null;
    } catch {
      tokenStorage.clear();
      return null;
    }
  }
}

export async function logout() {
  const { API_BASE_URL, SECURE_FLAG, MOCK_MODE } = getRuntimeConfig();

  if (MOCK_MODE) {
    await delay(100);
    tokenStorage.clear();
    return;
  }

  if (SECURE_FLAG) {
    try {
      await axios.post(`${API_BASE_URL}/oauth/logout`, null, {
        withCredentials: true,
      });
    } catch (err) {
      console.error('Error:', err);
    }
  }

  tokenStorage.clear();
}

export async function getCurrentUser(): Promise<{ success: boolean; data?: User }> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const hasToken = !!tokenStorage.getAccess();
    if (!hasToken) return { success: false };
    const first = mockUsers[0];
    return first ? { success: true, data: first } : { success: false };
  }

  try {
    const res = await requestWithRefresh<User>({
      method: 'GET',
      url: '/me/info',
    });
    return { success: true, data: res.data };
  } catch {
    return { success: false };
  }
}

export async function ensureAuthenticatedUser(): Promise<{
  authenticated: boolean;
  user?: User;
}> {
  const v = await validateToken();
  if (!v.success) return { authenticated: false };
  const me = await getCurrentUser();
  if (!me.success) return { authenticated: false };
  return { authenticated: true, user: me.data };
}

export async function validateToken(): Promise<{ success: boolean; data?: unknown }> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(100);
    return { success: true, data: { ok: true } };
  }

  try {
    const res = await requestWithRefresh<unknown>({
      method: 'POST',
      url: '/oauth/validate',
      data: null,
      headers: { 'Content-Type': 'application/json' },
    });
    return { success: true, data: res.data };
  } catch {
    return { success: false };
  }
}