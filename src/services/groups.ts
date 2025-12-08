import { AddGroupInput, DeleteGroupInput, GroupQuery, PagedGroups, UpdateGroupInput } from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { mockBackend } from './mockBackend';

export function normalizePaged(data: unknown): PagedGroups {
  const obj = asObject(data) ?? {};

  const groupsArr = asArray(obj['groups']);
  const itemsArr = asArray(obj['items']);
  const items = (groupsArr ?? itemsArr ?? []) as Group[];

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

export async function loadGroups(params?: GroupQuery): Promise<PagedGroups> {
  return mockBackend.getGroups(params);
}

export async function addGroup(input: AddGroupInput): Promise<Group> {
  return mockBackend.addGroup(input);
}

export async function updateGroup(input: UpdateGroupInput): Promise<Group> {
  return mockBackend.updateGroup(input);
}

export async function deleteGroup(input: DeleteGroupInput): Promise<void> {
  await mockBackend.deleteGroup(input);
}