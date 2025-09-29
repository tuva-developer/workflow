import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { qk } from '@/hooks/queryKeys';
import {
    loadAllModels,
    loadEditableModels,
    loadExecuteModels,
} from '@/services/models';
import type {
    ModelQuery,
    ModelsVariant,
    PagedModels,
} from '@/services/types';

const fetcherByVariant: Record<ModelsVariant, (p?: ModelQuery) => Promise<PagedModels>> = {
    all: loadAllModels,
    editable: loadEditableModels,
    execute: loadExecuteModels,
};

export function useModelsQuery(variant: ModelsVariant, params?: ModelQuery, enabled = true) {
    return useQuery<PagedModels>({
        queryKey: qk.models(variant, params),
        queryFn: () => fetcherByVariant[variant](params),
        enabled,
        placeholderData: keepPreviousData,
    });
}

export const useAllModelsQuery = (params?: ModelQuery, enabled = true) =>
    useModelsQuery('all', params, enabled);

export const useEditableModelsQuery = (params?: ModelQuery, enabled = true) =>
    useModelsQuery('editable', params, enabled);

export const useExecuteModelsQuery = (params?: ModelQuery, enabled = true) =>
    useModelsQuery('execute', params, enabled);