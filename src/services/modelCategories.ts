import {
  AddModelCategoryInput,
  DeleteModelCategoryInput,
  ModelCategoryQuery,
  PagedModelCategories,
  UpdateModelCategoryInput,
} from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { mockBackend } from './mockBackend';

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
  return mockBackend.getModelCategories(params);
}

export async function addModelCategory(
  input: AddModelCategoryInput
): Promise<ModelCategory> {
  return mockBackend.addModelCategory(input);
}

export async function updateModelCategory(
  input: UpdateModelCategoryInput
): Promise<ModelCategory> {
  return mockBackend.updateModelCategory(input);
}

export async function deleteModelCategory(
  input: DeleteModelCategoryInput
): Promise<void> {
  await mockBackend.deleteModelCategory(input);
}