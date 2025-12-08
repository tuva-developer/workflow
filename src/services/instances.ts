import { requestWithRefresh } from '@/api/client';
import {
    InstanceQuery,
    PagedInstances,
} from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';

export function normalizePagedInstances(data: unknown): PagedInstances {
  const obj = asObject(data) ?? {};

  const instancesArr = asArray(obj['instances']);
  const itemsArr = asArray(obj['items']);
  const items = (instancesArr ?? itemsArr ?? []) as Instance[];

  const len = items.length;

  return {
    items,
    total: asNumber(obj['total'], 0),
    page: asNumber(obj['page'], 1),
    limit: asNumber(obj['limit'], len),
    totalPages: asNumber(obj['totalPages'], 1),
    hasNext: asBoolean(obj['hasNext'], false),
    hasPrev: asBoolean(obj['hasPrev'], false),
  };
}

export async function loadInstances(params?: InstanceQuery): Promise<PagedInstances> {
    const { modelId, ...rest } = params || {};

    const url = modelId
        ? `/api/v2/workflow/instance/model/${encodeURIComponent(modelId)}`
        : '/api/v2/workflow/instances';

    const res = await requestWithRefresh<unknown>({
        method: 'GET',
        url: url,
        params: { ...(rest || {}) },
        headers: { 'Content-Type': 'application/json' },
    });
    return normalizePagedInstances(res.data);
}

export async function loadInstanceData(id: string): Promise<Instance> {
    const res = await requestWithRefresh<Instance>({
        method: 'GET',
        url: `/api/v2/workflow/instance/${encodeURIComponent(id)}`,
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
}

export async function loadInstanceDataPublic(instanceId: string): Promise<Instance> {
    const res = await requestWithRefresh<Instance>({
        method: 'GET',
        url: `/api/v2/workflow/public/instance/${encodeURIComponent(instanceId)}`,
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
}

export async function deleteInstance(instanceId: string): Promise<void> {
    await requestWithRefresh<void>({
        method: 'DELETE',
        url: `/api/v2/workflow/instance/${encodeURIComponent(instanceId)}`,
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function invokeItem(instanceId: string, items: unknown): Promise<unknown> {
    const res = await requestWithRefresh<unknown>({
        method: 'POST',
        url: `/api/v2/workflow/instance/${encodeURIComponent(instanceId)}/invoke/await`,
        data: items,
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
    });

    return res.data;
}