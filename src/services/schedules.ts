import {
  PagedSchedules,
  ScheduleQuery,
  AddScheduleInput,
  UpdateScheduleInput,
  DeleteScheduleInput,
} from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { mockBackend } from './mockBackend';

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
export async function loadSchedules(params?: ScheduleQuery): Promise<PagedSchedules> {
  return mockBackend.getSchedules(params);
}

export async function createSchedule(input: AddScheduleInput): Promise<Schedule> {
  return mockBackend.addSchedule(input);
}

export async function deleteAllSchedules(): Promise<void> {
  await mockBackend.deleteAllSchedules();
}

export async function deleteSchedule(input: DeleteScheduleInput): Promise<void> {
  await mockBackend.deleteSchedule(input);
}

export async function updateSchedule(input: UpdateScheduleInput): Promise<Schedule> {
  return mockBackend.updateSchedule(input);
}