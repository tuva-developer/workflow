import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    addModelType,
    updateModelType,
    deleteModelType,
} from '@/services/modelTypes';
import {
    AddModelTypeInput,
    UpdateModelTypeInput,
    DeleteModelTypeInput,
} from '@/services/types';
import { qk } from '@/hooks/queryKeys';

type AnyList =
  | ModelType[]
  | { items: ModelType[]; [k: string]: unknown }
  | undefined;

const mid = (m?: unknown): string | undefined => {
  if (typeof m !== 'object' || m === null) return undefined;
  const obj = m as Record<string, unknown>;
  const candidate = obj.id ?? obj._id ?? obj.modelTypeId;
  if (typeof candidate === 'string' || typeof candidate === 'number') {
    return String(candidate);
  }
  return undefined;
};

function mapList(list: AnyList, mapFn: (m: ModelType) => ModelType): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.map(mapFn);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.map(mapFn) };
  }

  return list;
}

function filterList(list: AnyList, pred: (m: ModelType) => boolean): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.filter(pred);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.filter(pred) };
  }

  return list;
}

export function useAddModelType() {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['addModelType'],
        mutationFn: (input: AddModelTypeInput) => addModelType(input),
        meta: {
            successMessage: 'Model type has been created successfully',
            errorMessage: 'Failed to create model type',
        },
        onSettled: () =>
            qc.invalidateQueries({ queryKey: qk.modelTypesRoot, exact: false }),
    });
}

export function useDeleteModelType() {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['deleteModelType'],
        mutationFn: (input: DeleteModelTypeInput) => deleteModelType(input),
        meta: {
            successMessage: 'Model type has been deleted successfully',
            errorMessage: 'Failed to delete model type',
        },
        onMutate: async ({ modelTypeId }) => {
            await qc.cancelQueries({ queryKey: qk.modelTypesRoot, exact: false });

            const listsSnapshot = qc.getQueriesData<AnyList>({
                queryKey: qk.modelTypesRoot,
                exact: false,
            });

            for (const [key, data] of listsSnapshot) {
                qc.setQueryData(key, filterList(data, (m) => mid(m) !== modelTypeId));
            }

            return { listsSnapshot, modelTypeId } as const;
        },
        onError: (_e, _vars, ctx) => {
            ctx?.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
        },
        onSettled: (_data, _err, { modelTypeId }) => {
            qc.invalidateQueries({ queryKey: qk.modelTypesRoot, exact: false });
            qc.removeQueries({ queryKey: qk.modelType(modelTypeId), exact: true });
        },
    });
}

export function useUpdateModelType() {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ['updateModelType'],
        mutationFn: (input: UpdateModelTypeInput) => updateModelType(input),
        meta: {
            successMessage: 'Model type has been updated successfully',
            errorMessage: 'Failed to update model type',
        },
        onMutate: async (input) => {
            const { modelTypeId, name, description } = input;
            await Promise.all([
                qc.cancelQueries({ queryKey: qk.modelTypesRoot, exact: false }),
                qc.cancelQueries({ queryKey: qk.modelType(modelTypeId), exact: true }),
            ]);

            const listsSnapshot = qc.getQueriesData<AnyList>({
                queryKey: qk.modelTypesRoot,
                exact: false,
            });
            const detailSnapshot = qc.getQueryData<ModelType>(qk.modelType(modelTypeId));

            const apply = (m: ModelType): ModelType =>
                mid(m) === modelTypeId
                    ? {
                        ...m,
                        ...(name !== undefined ? { name } : {}),
                        ...(description !== undefined ? { description } : {}),
                    }
                    : m;

            for (const [key, data] of listsSnapshot) {
                qc.setQueryData(key, mapList(data, apply));
            }
            if (detailSnapshot) {
                qc.setQueryData<ModelType>(qk.modelType(modelTypeId), apply(detailSnapshot));
            }

            return { listsSnapshot, detailSnapshot, modelTypeId } as const;
        },
        onError: (_e, _vars, ctx) => {
            if (!ctx) return;
            ctx.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
            if (ctx.detailSnapshot)
                qc.setQueryData(qk.modelType(ctx.modelTypeId), ctx.detailSnapshot);
        },
        onSettled: (_data, _err, { modelTypeId }) => {
            qc.invalidateQueries({ queryKey: qk.modelTypesRoot, exact: false });
            qc.invalidateQueries({ queryKey: qk.modelType(modelTypeId), exact: true });
        },
    });
}
