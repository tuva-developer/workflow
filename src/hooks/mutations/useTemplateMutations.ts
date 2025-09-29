import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTemplate, deleteTemplate } from '@/services/templates';
import { qk } from '@/hooks/queryKeys';
import { AddTemplateInput, DeleteTemplateInput } from '@/services/types';

type AnyList =
    | Template[]
    | { items: Template[];[k: string]: unknown }
    | undefined;

const tid = (t?: unknown): string | undefined => {
    if (typeof t !== 'object' || t === null) return undefined;
    const obj = t as Record<string, unknown>;

    const candidate =
        obj.templateId ??
        obj.id;

    if (typeof candidate === 'string' || typeof candidate === 'number') {
        return String(candidate);
    }
    return undefined;
};

function filterList(list: AnyList, pred: (t: Template) => boolean): AnyList {
    if (!list) return list;

    if (Array.isArray(list)) {
        return list.filter(pred);
    }

    if ('items' in list && Array.isArray(list.items)) {
        return { ...list, items: list.items.filter(pred) };
    }

    return list;
}


export function useCreateTemplate() {
    const qc = useQueryClient();

    return useMutation({
        mutationKey: ['createTemplate'],
        mutationFn: (input: AddTemplateInput) =>
            createTemplate(input),
        meta: {
            successMessage: 'Template has been created successfully',
            errorMessage: 'Failed to create template',
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: qk.templatesRoot, exact: false });
        },
    });
}

export function useDeleteTemplate() {
    const qc = useQueryClient();

    return useMutation({
        mutationKey: ['deleteTemplate'],
        mutationFn: (input: DeleteTemplateInput) => deleteTemplate(input),
        meta: {
            successMessage: 'Template has been deleted successfully',
            errorMessage: 'Failed to delete template',
        },
        onMutate: async ({ templateId }) => {
            await qc.cancelQueries({ queryKey: qk.templatesRoot, exact: false });

            const listsSnapshot = qc.getQueriesData<AnyList>({
                queryKey: qk.templatesRoot,
                exact: false,
            });

            for (const [key, data] of listsSnapshot) {
                qc.setQueryData(
                    key,
                    filterList(data, (t) => tid(t) !== templateId)
                );
            }

            return { listsSnapshot, templateId };
        },
        onError: (_e, _vars, ctx) => {
            ctx?.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
        },
        onSettled: (_data, _err, { templateId }) => {
            qc.invalidateQueries({ queryKey: qk.templatesRoot, exact: false });
            if (templateId) {
                qc.removeQueries({ queryKey: qk.template(templateId), exact: true });
            }
        },
    });
}