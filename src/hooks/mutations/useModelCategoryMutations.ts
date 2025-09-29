import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addModelCategory,
  updateModelCategory,
  deleteModelCategory,
} from '@/services/modelCategories';
import {
  AddModelCategoryInput,
  UpdateModelCategoryInput,
  DeleteModelCategoryInput,
} from '@/services/types';
import { qk } from '@/hooks/queryKeys';

type AnyList =
  | ModelCategory[]
  | { items: ModelCategory[];[k: string]: unknown }
  | undefined;

const cid = (c?: unknown): string | undefined => {
  if (typeof c !== 'object' || c === null) return undefined;
  const obj = c as Record<string, unknown>;
  const candidate = obj.id ?? obj._id ?? obj.modelCategoryId;
  if (typeof candidate === 'string' || typeof candidate === 'number') {
    return String(candidate);
  }
  return undefined;
};

function mapList(
  list: AnyList,
  mapFn: (c: ModelCategory) => ModelCategory
): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.map(mapFn);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.map(mapFn) };
  }

  return list;
}

function filterList(
  list: AnyList,
  pred: (c: ModelCategory) => boolean
): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.filter(pred);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.filter(pred) };
  }

  return list;
}

export function useAddModelCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['addModelCategory'],
    mutationFn: (input: AddModelCategoryInput) => addModelCategory(input),
    meta: {
      successMessage: 'Model category has been created successfully',
      errorMessage: 'Failed to create model category',
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: qk.modelCategoriesRoot, exact: false }),
  });
}

export function useDeleteModelCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['deleteModelCategory'],
    mutationFn: (input: DeleteModelCategoryInput) => deleteModelCategory(input),
    meta: {
      successMessage: 'Model category has been deleted successfully',
      errorMessage: 'Failed to delete model category',
    },
    onMutate: async ({ modelCategoryId }) => {
      await qc.cancelQueries({ queryKey: qk.modelCategoriesRoot, exact: false });

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.modelCategoriesRoot,
        exact: false,
      });

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(key, filterList(data, (c) => cid(c) !== modelCategoryId));
      }

      return { listsSnapshot, modelCategoryId } as const;
    },
    onError: (_e, _vars, ctx) => {
      ctx?.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: (_data, _err, { modelCategoryId }) => {
      qc.invalidateQueries({ queryKey: qk.modelCategoriesRoot, exact: false });
      qc.removeQueries({ queryKey: qk.modelCategory(modelCategoryId), exact: true });
    },
  });
}

export function useUpdateModelCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['updateModelCategory'],
    mutationFn: (input: UpdateModelCategoryInput) => updateModelCategory(input),
    meta: {
      successMessage: 'Model category has been updated successfully',
      errorMessage: 'Failed to update model category',
    },
    onMutate: async (input) => {
      const { modelCategoryId, name, description } = input;

      await Promise.all([
        qc.cancelQueries({ queryKey: qk.modelCategoriesRoot, exact: false }),
        qc.cancelQueries({ queryKey: qk.modelCategory(modelCategoryId), exact: true }),
      ]);

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.modelCategoriesRoot,
        exact: false,
      });
      const detailSnapshot = qc.getQueryData<ModelCategory>(
        qk.modelCategory(modelCategoryId)
      );

      const apply = (c: ModelCategory): ModelCategory =>
        cid(c) === modelCategoryId
          ? {
            ...c,
            ...(name !== undefined ? { name } : {}),
            ...(description !== undefined ? { description } : {}),
          }
          : c;

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(key, mapList(data, apply));
      }
      if (detailSnapshot) {
        qc.setQueryData<ModelCategory>(qk.modelCategory(modelCategoryId), apply(detailSnapshot));
      }

      return { listsSnapshot, detailSnapshot, modelCategoryId } as const;
    },
    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      ctx.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx.detailSnapshot) {
        qc.setQueryData(qk.modelCategory(ctx.modelCategoryId), ctx.detailSnapshot);
      }
    },
    onSettled: (_data, _err, { modelCategoryId }) => {
      qc.invalidateQueries({ queryKey: qk.modelCategoriesRoot, exact: false });
      qc.invalidateQueries({ queryKey: qk.modelCategory(modelCategoryId), exact: true });
    },
  });
}