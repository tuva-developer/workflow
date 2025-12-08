import {
    TemplateQuery,
    PagedTemplates,
    AddTemplateInput,
    DeleteTemplateInput,
} from "@/services/types";
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';
import { mockBackend } from "./mockBackend";

export function normalizePaged(data: unknown): PagedTemplates {
    const obj = asObject(data) ?? {};

    const templatesArr = asArray(obj['templates']);
    const itemsArr = asArray(obj['items']);
    const items = (templatesArr ?? itemsArr ?? []) as Template[];

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

export async function loadTemplates(params?: TemplateQuery): Promise<PagedTemplates> {
    return mockBackend.getTemplates(params);
}

export async function createTemplate(input: AddTemplateInput): Promise<Template> {
    return mockBackend.addTemplate(input);
}

export async function deleteTemplate(input: DeleteTemplateInput): Promise<void> {
    await mockBackend.deleteTemplate(input);
}
