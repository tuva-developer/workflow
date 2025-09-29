import { requestWithRefresh } from '@/api/client';
import {
  AddModelCategoryInput,
  DeleteModelCategoryInput,
  ModelCategoryQuery,
  PagedModelCategories,
  UpdateModelCategoryInput,
} from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { getRuntimeConfig } from '@/utils/defines';
import { delay, paginate } from '@/utils/mock';
import { mockModelCategories } from '@/mockData';

export function normalizePaged(data: unknown): PagedModelCategories {
  const obj = asObject(data) ?? {};

  const categoriesArr = asArray(obj['categories']);
  const itemsArr = asArray(obj['items']);
  const items = (categoriesArr ?? itemsArr ?? []) as ModelCategory[];

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

export async function loadModelCategories(
  params?: ModelCategoryQuery
): Promise<PagedModelCategories> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? mockModelCategories.length;
    return paginate<ModelCategory>({ items: mockModelCategories, page, limit });
  }
  const res = await requestWithRefresh<unknown>({
    method: 'GET',
    url: '/api/v2/workflow/models/categories',
    params: { ...(params || {}) },
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizePaged(res.data);
}

export async function addModelCategory(
  input: AddModelCategoryInput
): Promise<ModelCategory> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    return {
      _id: `mock-cat-${Date.now()}`,
      name: input.name,
      description: input.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ModelCategory;
  }
  const res = await requestWithRefresh<ModelCategory>({
    method: 'POST',
    url:
      `/api/v2/workflow/models/categories` +
      `?name=${encodeURIComponent(input.name)}` +
      `&description=${encodeURIComponent(input.description)}`,
    data: null,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function updateModelCategory(
  input: UpdateModelCategoryInput
): Promise<ModelCategory> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    return {
      _id: input.modelCategoryId,
      name: input.name,
      description: input.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ModelCategory;
  }
  const res = await requestWithRefresh<ModelCategory>({
    method: 'PATCH',
    url:
      `/api/v2/workflow/models/categories/${encodeURIComponent(input.modelCategoryId)}` +
      `?rename=${encodeURIComponent(input.name)}` +
      `&description=${encodeURIComponent(input.description)}`,
    data: null,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function deleteModelCategory(
  input: DeleteModelCategoryInput
): Promise<void> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(100);
    return;
  }
  await requestWithRefresh<void>({
    method: 'DELETE',
    url: `/api/v2/workflow/models/categories/${encodeURIComponent(input.modelCategoryId)}`,
    headers: { 'Content-Type': 'application/json' },
  });
}