import {
    InstanceQuery,
    PagedInstances,
} from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { mockBackend } from './mockBackend';

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
    return mockBackend.getInstances(params);
}

export async function loadInstanceData(id: string): Promise<Instance> {
    return mockBackend.getInstance(id);
}

export async function loadInstanceDataPublic(instanceId: string): Promise<Instance> {
    return mockBackend.getInstance(instanceId);
}

export async function deleteInstance(instanceId: string): Promise<void> {
    await mockBackend.deleteInstance(instanceId);
}

export async function invokeItem(instanceId: string, items: unknown): Promise<unknown> {
    return mockBackend.invokeInstanceItem({ instanceId, items });
}