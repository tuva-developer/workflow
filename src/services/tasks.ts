import { requestWithRefresh } from '@/api/client';
import {
  PagedTasks,
  TaskQuery,
} from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { getRuntimeConfig } from '@/utils/defines';
import { delay, paginate } from '@/utils/mock';
import { mockTasks } from '@/mockData';

export function normalizePaged(data: unknown): PagedTasks {
  const obj = asObject(data) ?? {};

  const tasksArr = asArray(obj['tasks']);
  const itemsArr = asArray(obj['items']);
  const items = (tasksArr ?? itemsArr ?? []) as Task[];

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

export async function loadTasks(params?: TaskQuery): Promise<PagedTasks> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? mockTasks.length;
    return paginate<Task>({ items: mockTasks, page, limit });
  }
  const res = await requestWithRefresh<unknown>({
    method: 'GET',
    url: '/api/v2/workflow/tasks/me',
    params: { ...(params || {}) },
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizePaged(res.data);
}

export async function loadTask(taskId: string): Promise<Task> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    const found = mockTasks.find(t => t.taskId === taskId) || mockTasks[0];
    if (!found) throw new Error('Task not found');
    return found;
  }
  const res = await requestWithRefresh<Task>({
    method: 'GET',
    url: `/api/v2/workflow/tasks/${encodeURIComponent(taskId)}`,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function executeTask(taskId: string, data: object): Promise<Task> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const base = mockTasks.find(t => t.taskId === taskId) || mockTasks[0];
    return { ...(base as Task), status: 'completed', updated_at: new Date().toISOString() };
  }
  const res = await requestWithRefresh<Task>({
    method: 'POST',
    url: `/api/v2/workflow/tasks/${encodeURIComponent(taskId)}/await`,
    data,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function executeTaskWithFile(taskId: string, file: File): Promise<Task> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const base = mockTasks.find(t => t.taskId === taskId) || mockTasks[0];
    return { ...(base as Task), status: 'completed', updated_at: new Date().toISOString() };
  }
  const res = await requestWithRefresh<Task>({
    method: 'POST',
    url: `/api/v2/workflow/tasks/${encodeURIComponent(taskId)}/await`,
    data: file,
    headers: { 'Content-Type': 'application/octet-stream' },
    transformRequest: [(d) => d],
  });
  return res.data;
}

export async function executeTaskWithMultipart(taskId: string, formData: FormData): Promise<Task> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const base = mockTasks.find(t => t.taskId === taskId) || mockTasks[0];
    return { ...(base as Task), status: 'completed', updated_at: new Date().toISOString() };
  }
  const res = await requestWithRefresh<Task>({
    method: 'POST',
    url: `/api/v2/workflow/tasks/${encodeURIComponent(taskId)}/await`,
    data: formData,
  });
  return res.data;
}

export async function debugTask(taskId: string, data: object): Promise<Task> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    const base = mockTasks.find(t => t.taskId === taskId) || mockTasks[0];
    return { ...(base as Task), status: 'completed', updated_at: new Date().toISOString() };
  }
  const res = await requestWithRefresh<Task>({
    method: 'POST',
    url: `/api/v2/workflow/tasks/${encodeURIComponent(taskId)}/debug`,
    data,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function debugTaskWithFile(taskId: string, file: File): Promise<Task> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    const base = mockTasks.find(t => t.taskId === taskId) || mockTasks[0];
    return { ...(base as Task), status: 'completed', updated_at: new Date().toISOString() };
  }
  const res = await requestWithRefresh<Task>({
    method: 'POST',
    url: `/api/v2/workflow/tasks/${encodeURIComponent(taskId)}/debug`,
    data: file,
    headers: { 'Content-Type': 'application/octet-stream' },
    transformRequest: [(d) => d],
  });
  return res.data;
}

export async function debugTaskWithMultipart(taskId: string, formData: FormData): Promise<Task> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    const base = mockTasks.find(t => t.taskId === taskId) || mockTasks[0];
    return { ...(base as Task), status: 'completed', updated_at: new Date().toISOString() };
  }
  const res = await requestWithRefresh<Task>({
    method: 'POST',
    url: `/api/v2/workflow/tasks/${encodeURIComponent(taskId)}/debug`,
    data: formData,
  });
  return res.data;
}