import { AddModelTypeInput, DeleteModelTypeInput, ModelTypeQuery, PagedModelTypes, UpdateModelTypeInput } from '@/services/types';
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { mockBackend } from './mockBackend';

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
    return mockBackend.getModelTypes(params);
}

export async function addModelType(input: AddModelTypeInput): Promise<ModelType> {
    return mockBackend.addModelType(input);
}

export async function updateModelType(input: UpdateModelTypeInput): Promise<ModelType> {
    return mockBackend.updateModelType(input);
}

export async function deleteModelType(input: DeleteModelTypeInput): Promise<void> {
    await mockBackend.deleteModelType(input);
}