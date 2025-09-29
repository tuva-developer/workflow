import { requestWithRefresh } from '@/api/client';
import { PagedForms, AddFormInput, UpdateFormInput, DeleteFormInput, FormQuery } from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { getRuntimeConfig } from '@/utils/defines';
import { delay, paginate } from '@/utils/mock';
import { mockForms } from '@/mockData';

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
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? mockForms.length;
    return paginate<FormConfig>({ items: mockForms, page, limit });
  }
  const res = await requestWithRefresh<unknown>({
    method: 'GET',
    url: '/api/v2/workflow/forms',
    params: { ...(params || {}) },
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizePagedForms(res.data);
}

export async function loadFormByName(formName: string): Promise<FormConfig> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(150);
    const found = mockForms.find(f => f.name === formName || f._id === formName);
    if (!found) throw new Error('Form not found');
    return found;
  }
  const res = await requestWithRefresh<FormConfig>({
    method: 'GET',
    url: `/api/v2/workflow/form/byname/${encodeURIComponent(formName)}`,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function createForm(input: AddFormInput): Promise<CreateFormResponse> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    return { id: input.name };
  }
  const res = await requestWithRefresh<CreateFormResponse>({
    method: 'POST',
    url: `/api/v2/workflow/form?name=${encodeURIComponent(input.name)}`,
    data: input.formSchema,
    headers: { 'Content-Type': 'application/json' },    
  });
  return res.data;
}

export async function updateForm(input: UpdateFormInput): Promise<FormConfig> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(200);
    const base = (typeof input.formSchema === 'object' && input.formSchema !== null)
      ? (input.formSchema as Record<string, unknown>)
      : {};
    const cfg = 'config' in base ? String((base as Record<string, unknown>)['config']) : JSON.stringify(base);
    const name = 'name' in base ? String((base as Record<string, unknown>)['name']) : input.id;
    const description = 'description' in base ? String((base as Record<string, unknown>)['description']) : '';
    return { _id: input.id, name, description, config: cfg } as FormConfig;
  }
  const res = await requestWithRefresh<FormConfig>({
    method: 'PATCH',
    url: `/api/v2/workflow/form/${encodeURIComponent(input.id)}`,
    data: input.formSchema,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function deleteForm(input: DeleteFormInput): Promise<void> {
  const { MOCK_MODE } = getRuntimeConfig();
  if (MOCK_MODE) {
    await delay(100);
    return;
  }
  await requestWithRefresh<void>({
    method: 'DELETE',
    url: `/api/v2/workflow/form/${encodeURIComponent(input.formName || input.formId || "")}`,
    headers: { 'Content-Type': 'application/json' },
  });
}