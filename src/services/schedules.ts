import { requestWithRefresh } from '@/api/client';
import {
  PagedSchedules,
  ScheduleQuery,
  AddScheduleInput,
  UpdateScheduleInput,
  DeleteScheduleInput,
} from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { getRuntimeConfig } from '@/utils/defines';
import { delay, paginate } from '@/utils/mock';
import { mockSchedules } from '@/mockData';

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
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? mockSchedules.length;
    return paginate<Schedule>({ items: mockSchedules, page, limit });
  }
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
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    const params = omitUndefined({
      modelId: input.modelId,
      name: input.name,
      type: input.type,
      description: input.description,
      cron: input.cron,
      once: toBoolString(input.once),
      active: toBoolString(input.active),
    });
    return {
      _id: `mock-sch-${Date.now()}`,
      modelId: String(params.modelId ?? ''),
      name: String(params.name ?? ''),
      description: String(params.description ?? ''),
      creator: 'admin',
      cron: String(params.cron ?? ''),
      once: String(params.once) === 'true',
      active: String(params.active) === 'true',
      input: input.data ?? {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Schedule;
  }
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
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(100);
    return;
  }
  await requestWithRefresh<void>({
    method: 'DELETE',
    url: '/api/v2/workflow/schedules',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
}

export async function deleteSchedule(input: DeleteScheduleInput): Promise<void> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(100);
    return;
  }
  await requestWithRefresh<void>({
    method: 'DELETE',
    url: `/api/v2/workflow/schedules/${encodeURIComponent(input.scheduleId)}`,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
}

export async function updateSchedule(input: UpdateScheduleInput): Promise<Schedule> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    const params = omitUndefined({
      name: input.name,
      type: input.type,
      description: input.description,
      cron: input.cron,
      once: toBoolString(input.once),
      active: toBoolString(input.active),
    });
    return {
      _id: input.scheduleId,
      modelId: '',
      name: String(params.name ?? ''),
      description: String(params.description ?? ''),
      creator: 'admin',
      cron: String(params.cron ?? ''),
      once: String(params.once) === 'true',
      active: String(params.active) === 'true',
      input: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Schedule;
  }
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