import { requestWithRefresh } from '@/api/client';
import { AddGroupInput, DeleteGroupInput, GroupQuery, PagedGroups, UpdateGroupInput } from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { getRuntimeConfig } from '@/utils/defines';
import { delay, paginate } from '@/utils/mock';
import { mockGroups } from '@/mockData';

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
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? mockGroups.length;
    return paginate<Group>({ items: mockGroups, page, limit });
  }
  const res = await requestWithRefresh<unknown>({
    method: 'GET',
    url: '/api/v2/workflow/groups',
    params: { ...(params || {}) },
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizePaged(res.data);
}

export async function addGroup(input: AddGroupInput): Promise<Group> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    return {
      _id: `mock-grp-${Date.now()}`,
      name: input.name,
      description: input.description,
      members: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Group;
  }
  const res = await requestWithRefresh<Group>({
    method: 'POST',
    url:
      `/api/v2/workflow/groups` +
      `?name=${encodeURIComponent(input.name)}` +
      `&description=${encodeURIComponent(input.description)}`,
    data: null,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function updateGroup(input: UpdateGroupInput): Promise<Group> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    return {
      _id: input.id,
      name: input.name,
      description: input.description,
      members: input.members || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Group;
  }
  const res = await requestWithRefresh<Group>({
    method: 'PATCH',
    url:
      `/api/v2/workflow/groups/${encodeURIComponent(input.id)}` +
      `?name=${encodeURIComponent(input.name)}` +
      `&description=${encodeURIComponent(input.description)}`,
    data: input.members || [],
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function deleteGroup(input: DeleteGroupInput): Promise<void> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(100);
    return;
  }
  await requestWithRefresh<void>({
    method: 'DELETE',
    url: `/api/v2/workflow/groups/${encodeURIComponent(input.groupId)}`,
    headers: { 'Content-Type': 'application/json' },
  });
}