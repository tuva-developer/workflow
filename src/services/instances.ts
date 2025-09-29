import { requestWithRefresh } from '@/api/client';
import { PagedInstances, InstanceQuery, DeleteInstanceInput, InvokeItemInput, DebugInvokeInput } from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { getRuntimeConfig } from '@/utils/defines';
import { delay, paginate } from '@/utils/mock';
import { mockInstances } from '@/mockData';

export function normalizePaged(data: unknown): PagedInstances {
  const obj = asObject(data) ?? {};

  const instancesArr = asArray(obj['instances']);
  const itemsArr = asArray(obj['items']);
  const items = (instancesArr ?? itemsArr ?? []) as Instance[];

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

export async function loadInstances(params?: InstanceQuery): Promise<PagedInstances> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? mockInstances.length;
    return paginate<Instance>({ items: mockInstances, page, limit });
  }
  const res = await requestWithRefresh<unknown>({
    method: 'GET',
    url: '/api/v2/workflow/instances',
    params: { ...(params || {}) },
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizePaged(res.data);
}

export async function loadInstance(instanceId: string): Promise<Instance> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    const found = mockInstances.find(i => i._id === instanceId) || mockInstances[0];
    if (!found) throw new Error('Instance not found');
    return found;
  }
  const res = await requestWithRefresh<Instance>({
    method: 'GET',
    url: `/api/v2/workflow/instances/${encodeURIComponent(instanceId)}`,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function deleteInstance(input: DeleteInstanceInput): Promise<void> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(100);
    return;
  }
  await requestWithRefresh<void>({
    method: 'DELETE',
    url: `/api/v2/workflow/instances/${encodeURIComponent(input.instanceId)}`,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function invokeItem(input: InvokeItemInput): Promise<Instance> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const base = mockInstances.find(i => i._id === input.instanceId) || mockInstances[0];
    return { ...(base as Instance), updated_at: new Date().toISOString() };
  }
  const res = await requestWithRefresh<Instance>({
    method: 'POST',
    url: `/api/v2/workflow/instances/${encodeURIComponent(input.instanceId)}/await`,
    data: input.items,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function debugInvoke(input: DebugInvokeInput): Promise<Instance> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const base = mockInstances.find(i => i._id === input.instanceId) || mockInstances[0];
    return { ...(base as Instance), updated_at: new Date().toISOString() };
  }
  const res = await requestWithRefresh<Instance>({
    method: 'POST',
    url: `/api/v2/workflow/instances/${encodeURIComponent(input.instanceId)}/debug`,
    data: input.items,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}