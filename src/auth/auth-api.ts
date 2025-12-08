import { tokenStorage } from '@/auth/token-storage';
import { mockAuth } from '@/services/mockBackend';

export type LoginInput = { username: string; password: string };
export type LoginResponse = { access_token?: string; refresh_token?: string };
export type RefreshResponse = { access_token?: string; refresh_token?: string };

export async function login(input: LoginInput): Promise<LoginResponse> {
  const data = await mockAuth.login(input);
  if (data?.access_token) tokenStorage.setAccess(data.access_token);
  if (data?.refresh_token) tokenStorage.setRefresh(data.refresh_token);
  return data;
}

export async function refresh(): Promise<string | null> {
  try {
    const newAccess = await mockAuth.refresh();
    if (newAccess) tokenStorage.setAccess(newAccess);
    return newAccess ?? null;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

export async function logout() {
  tokenStorage.clear();
}

export async function getCurrentUser(): Promise<{ success: boolean; data?: User }> {
  try {
    const user = await mockAuth.currentUser();
    return { success: true, data: user };
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
  try {
    const res = await mockAuth.validateToken();
    return { success: true, data: res };
  } catch {
    return { success: false };
  }
}