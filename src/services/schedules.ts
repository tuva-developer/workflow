import { requestWithRefresh } from '@/api/client';
import {
  PagedSchedules,
  ScheduleQuery,
  AddScheduleInput,
  UpdateScheduleInput,
  DeleteScheduleInput,
} from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';

export function normalizePaged(data: unknown): PagedSchedules {
  const obj = asObject(data) ?? {};

  const schedulesArr = asArray(obj['schedules']);
  const itemsArr = asArray(obj['items']);
  const items = (schedulesArr ?? itemsArr ?? []) as Schedule[];

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
const toBoolString = (v: boolean | undefined) =>
  typeof v === 'boolean' ? String(v) : undefined;

const omitUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const out: Record<string, unknown> = {};
  for (const k in obj) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out as Partial<T>;
};

export async function loadSchedules(params?: ScheduleQuery): Promise<PagedSchedules> {
  const res = await requestWithRefresh<unknown>({
    method: 'GET',
    url: '/api/v2/workflow/schedules',
    params: { ...(params || {}) },
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
  return normalizePaged(res.data);
}

export async function createSchedule(input: AddScheduleInput): Promise<Schedule> {
  const params = omitUndefined({
    modelId: input.modelId,
    name: input.name,
    type: input.type,
    description: input.description,
    cron: input.cron,
    once: toBoolString(input.once),
    active: toBoolString(input.active),
  });

  const body = input.data ? { data: input.data } : {};

  const res = await requestWithRefresh<Schedule>({
    method: 'POST',
    url: '/api/v2/workflow/schedules',
    params,
    data: body,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
  return res.data;
}

export async function deleteAllSchedules(): Promise<void> {
  await requestWithRefresh<void>({
    method: 'DELETE',
    url: '/api/v2/workflow/schedules',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
}

export async function deleteSchedule(input: DeleteScheduleInput): Promise<void> {
  await requestWithRefresh<void>({
    method: 'DELETE',
    url: `/api/v2/workflow/schedules/${encodeURIComponent(input.scheduleId)}`,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
}

export async function updateSchedule(input: UpdateScheduleInput): Promise<Schedule> {
  const params = omitUndefined({
    name: input.name,
    type: input.type,
    description: input.description,
    cron: input.cron,
    once: toBoolString(input.once),
    active: toBoolString(input.active),
  });

  const res = await requestWithRefresh<Schedule>({
    method: 'PATCH',
    url: `/api/v2/workflow/schedules/${encodeURIComponent(input.scheduleId)}`,
    params,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
  return res.data;
}