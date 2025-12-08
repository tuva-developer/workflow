import { requestWithRefresh } from '@/api/client';
import { ChangePassWordInput, CreateUserInput, DeleteUserInput, PagedUsers, UpdateUserInput, UpdateUserRoleInput, UserQuery } from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';

export function normalizePaged(data: unknown): PagedUsers {
  const obj = asObject(data) ?? {};

  const usersArr = asArray(obj['users']);
  const itemsArr = asArray(obj['items']);
  const items = (usersArr ?? itemsArr ?? []) as User[];

  const len = items.length;

  return {
    items,
    total: asNumber(obj['total'], len),
    page: asNumber(obj['page'], 1),
    limit: asNumber(obj['limit'], len),
    totalPages: asNumber(obj['totalPages'], 1),
    hasNext: asBoolean(obj['hasNext'], false),
    hasPrev: asBoolean(obj['hasPrev'], false),
  };
}

export async function loadUsers(params?: UserQuery): Promise<PagedUsers> {
  const res = await requestWithRefresh<unknown>({
    method: 'GET',
    url: '/tenants/users',
    params: { ...(params || {}) },
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizePaged(res.data);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const params = new URLSearchParams();
  params.append('username', input.username);
  params.append('password', input.password);
  params.append('fullname', input.fullname);
  params.append('email', input.email);
  params.append('phone', input.phone);
  params.append('address', input.address);

  const res = await requestWithRefresh<User>({
    method: 'POST',
    url: '/users',
    data: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return res.data;
}

export async function deleteUser(input: DeleteUserInput): Promise<void> {
  await requestWithRefresh<void>({
    method: 'DELETE',
    url: `/users/${encodeURIComponent(input.userId)}?tenantId=${encodeURIComponent(input.tenantId)}`,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updateUser(input: UpdateUserInput): Promise<User> {
  const payload: {
    tenantId?: string;
    email: string;
    phone: string;
    address: string;
    fullname: string;
    new_password?: string;
  } = {
    tenantId: input.tenantId,
    email: input.email,
    phone: input.phone,
    address: input.address,
    fullname: input.fullname,
  };

  if (input.new_password && input.new_password.trim() !== "") {
    payload.new_password = input.new_password;
  }

  const res = await requestWithRefresh<User>({
    method: "PATCH",
    url: `/users/${encodeURIComponent(input.userId)}/info?tenantId=${encodeURIComponent(input.tenantId ?? "")}`,
    data: payload,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return res.data;
}

export async function updateUserRole(input: UpdateUserRoleInput): Promise<User> {
  const res = await requestWithRefresh<User>({
    method: 'PATCH',
    url: `/users/${encodeURIComponent(input.userId)}/set-roles?tenantId=${encodeURIComponent(input.tenantId)}`,
    data: input.roles,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function updateMyProfile(input: UpdateUserInput): Promise<User> {
  const payload: {
    email: string;
    phone: string;
    address: string;
    fullname: string;
  } = {
    email: input.email,
    phone: input.phone,
    address: input.address,
    fullname: input.fullname,
  };

  const res = await requestWithRefresh<User>({
    method: 'PATCH',
    url: `/me/info`,
    data: payload,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data;
}

export async function changePassword(input: ChangePassWordInput) {
  const data = new URLSearchParams();
  data.append('old_password', input.oldPassword);
  data.append('new_password', input.newPassword);

  await requestWithRefresh<void>({
    method: 'PATCH',
    url: `/me/update-password`,
    data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}