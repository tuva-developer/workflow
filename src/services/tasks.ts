import {
  PagedTasks,
  TaskQuery,
} from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { mockBackend } from './mockBackend';

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
  return mockBackend.getTasks(params);
}

export async function loadTask(taskId: string): Promise<Task> {
  return mockBackend.getTask(taskId);
}

export async function executeTask(taskId: string, data: unknown): Promise<Task> {
  return mockBackend.executeTask(taskId, data);
}

export async function executeTaskWithFile(taskId: string, file: File): Promise<Task> {
  return mockBackend.executeTask(taskId, file);
}

export async function executeTaskWithMultipart(taskId: string, formData: FormData): Promise<Task> {
  return mockBackend.executeTask(taskId, formData);
}

export async function debugTask(taskId: string, data: object): Promise<Task> {
  return mockBackend.executeTask(taskId, data);
}

export async function debugTaskWithFile(taskId: string, file: File): Promise<Task> {
  return mockBackend.executeTask(taskId, file);
}

export async function debugTaskWithMultipart(taskId: string, formData: FormData): Promise<Task> {
  return mockBackend.executeTask(taskId, formData);
}