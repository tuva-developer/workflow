import { requestWithRefresh } from '@/api/client';
import { AddModelTypeInput, DeleteModelTypeInput, ModelTypeQuery, PagedModelTypes, UpdateModelTypeInput } from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';

export function normalizePaged(data: unknown): PagedModelTypes {
    const obj = asObject(data) ?? {};

    const typesArr = asArray(obj['types']);
    const itemsArr = asArray(obj['items']);
    const items = (typesArr ?? itemsArr ?? []) as ModelType[];

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


export async function loadModelTypes(params?: ModelTypeQuery): Promise<PagedModelTypes> {
    const res = await requestWithRefresh<unknown>({
        method: 'GET',
        url: '/api/v2/workflow/models/types',
        params: { ...(params || {}) },
        headers: { 'Content-Type': 'application/json' },
    });
    return normalizePaged(res.data);
}

export async function addModelType(input: AddModelTypeInput): Promise<ModelType> {
    const res = await requestWithRefresh<ModelType>({
        method: 'POST',
        url:
            `/api/v2/workflow/models/types` +
            `?name=${encodeURIComponent(input.name)}` +
            `&description=${encodeURIComponent(input.description)}`,
        data: null,
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
}

export async function updateModelType(input: UpdateModelTypeInput): Promise<ModelType> {
    const res = await requestWithRefresh<ModelType>({
        method: 'PATCH',
        url:
            `/api/v2/workflow/models/types/${encodeURIComponent(input.modelTypeId)}` +
            `?rename=${encodeURIComponent(input.name)}` +
            `&description=${encodeURIComponent(input.description)}`,
        data: null,
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
}

export async function deleteModelType(input: DeleteModelTypeInput): Promise<void> {
    await requestWithRefresh<void>({
        method: 'DELETE',
        url: `/api/v2/workflow/models/types/${encodeURIComponent(input.modelTypeId)}`,
        headers: { 'Content-Type': 'application/json' },
    });
}