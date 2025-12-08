import { ChangePassWordInput, CreateUserInput, DeleteUserInput, PagedUsers, UpdateUserInput, UpdateUserRoleInput, UserQuery } from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { mockBackend } from './mockBackend';

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
  return mockBackend.getUsers(params);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return mockBackend.createUser(input);
}

export async function deleteUser(input: DeleteUserInput): Promise<void> {
  await mockBackend.deleteUser(input);
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

  return mockBackend.updateUser(input);
}

export async function updateUserRole(input: UpdateUserRoleInput): Promise<User> {
  return mockBackend.updateUserRole(input);
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

  return mockBackend.updateMyProfile(input);
}

export async function changePassword(input: ChangePassWordInput) {
  await mockBackend.changePassword(input);
}