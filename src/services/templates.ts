import { requestWithRefresh } from "@/api/client";
import {
    TemplateQuery,
    PagedTemplates,
    AddTemplateInput,
    DeleteTemplateInput,
} from "@/services/types";
import { asObject, asArray, asNumber, asBoolean } from '@/utils/typeGuards';

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
    const res = await requestWithRefresh<unknown>({
        method: "GET",
        url: "/api/v2/workflow/templates",
        params: { ...(params || {}) },
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    });
    return normalizePaged(res.data);
}

export async function createTemplate(input: AddTemplateInput): Promise<Template> {
    const res = await requestWithRefresh<Template>({
        method: "POST",
        url: `/api/v2/workflow/template?name=${encodeURIComponent(input.name)}&description=${encodeURIComponent(input.description || '')}`,
        data: input.config,
        withCredentials: true,
        headers: { "Content-Type": "application/xml" },
    });
    return res.data;
}

export async function deleteTemplate(input: DeleteTemplateInput): Promise<void> {
    await requestWithRefresh<void>({
        method: "DELETE",
        url: `/api/v2/workflow/template/${encodeURIComponent(input.templateId)}`,
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    });
}
