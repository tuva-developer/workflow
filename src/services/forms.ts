import { PagedForms, AddFormInput, UpdateFormInput, DeleteFormInput, FormQuery } from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { mockBackend } from './mockBackend';

export type CreateFormResponse = { id: string };

export function normalizePagedForms(data: unknown): PagedForms {
  const obj = asObject(data) ?? {};

  const formsArr = asArray(obj['forms']);
  const itemsArr = asArray(obj['items']);
  const items = (formsArr ?? itemsArr ?? []) as FormConfig[];

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

export async function loadForms(params?: FormQuery): Promise<PagedForms> {
    return mockBackend.getForms(params);
}

export async function loadFormByName(formName: string): Promise<FormConfig> {
    return mockBackend.getFormByName(formName);
}

export async function createForm(input: AddFormInput): Promise<CreateFormResponse> {
    return mockBackend.addForm(input);
}

export async function updateForm(input: UpdateFormInput): Promise<FormConfig> {
    return mockBackend.updateForm(input);
}

export async function deleteForm(input: DeleteFormInput): Promise<void> {
    await mockBackend.deleteForm(input.formName || input.formId || "");
}