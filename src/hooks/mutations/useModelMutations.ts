import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createModel,
  updateModel,
  deleteModel,
  setReadOnlyModel,
} from '@/services/models';
import type {
  CreateModelInput,
  UpdateModelInput,
  DeleteModelInput,
  SetReadOnlyInput,
} from '@/services/types';
import { qk } from '@/hooks/queryKeys';

type AnyList =
  | Model[]
  | { items: Model[]; [k: string]: unknown }
  | undefined;

const getId = (m?: Model | null): string | undefined => m?._id;

function mapList(list: AnyList, mapFn: (m: Model) => Model): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.map(mapFn);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.map(mapFn) };
  }

  return list;
}

function filterList(list: AnyList, pred: (m: Model) => boolean): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.filter(pred);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.filter(pred) };
  }

  return list;
}

function patchAllModelLists(
  qc: ReturnType<typeof useQueryClient>,
  updater: (list: AnyList) => AnyList
) {
  const entries = qc.getQueriesData<AnyList>({ queryKey: qk.modelsRoot, exact: false });
  for (const [key, data] of entries) {
    qc.setQueryData(key, updater(data));
  }
}

function patchModelDetail(
  qc: ReturnType<typeof useQueryClient>,
  id: string,
  patch: Partial<Model>
) {
  const key = qk.model(id);
  const prev = qc.getQueryData<Model>(key);
  if (prev) qc.setQueryData<Model>(key, { ...prev, ...patch });
}

export function useCreateModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['createModel'],
    mutationFn: (input: CreateModelInput) => createModel(input),
    meta: {
      successMessage: 'Model has been created successfully',
      errorMessage: 'Failed to create model',
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.modelsRoot, exact: false });
    },
  });
}

export function useDeleteModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['deleteModel'],
    mutationFn: (input: DeleteModelInput) => deleteModel(input),
    meta: {
      successMessage: 'Model has been deleted successfully',
      errorMessage: 'Failed to delete model',
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: qk.modelsRoot, exact: false });

      const listsSnapshot = qc.getQueriesData<AnyList>({ queryKey: qk.modelsRoot, exact: false });
      patchAllModelLists(qc, (list) => filterList(list, (m) => getId(m) !== id));

      return { listsSnapshot, id };
    },
    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      for (const [key, data] of ctx.listsSnapshot ?? []) {
        qc.setQueryData(key, data);
      }
    },
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: qk.modelsRoot, exact: false });
      qc.removeQueries({ queryKey: qk.model(id), exact: true });
    },
  });
}

export function useUpdateModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['updateModel'],
    mutationFn: (input: UpdateModelInput) => updateModel(input),
    meta: {
      successMessage: 'Model has been updated successfully',
      errorMessage: 'Failed to update model',
    },
    onMutate: async ({ id, params }) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: qk.modelsRoot, exact: false }),
        qc.cancelQueries({ queryKey: qk.model(id), exact: true }),
      ]);

      const listsSnapshot = qc.getQueriesData<AnyList>({ queryKey: qk.modelsRoot, exact: false });
      const detailSnapshot = qc.getQueryData<Model>(qk.model(id));

      const patch: Partial<Model> = {
        ...(params?.rename ? { name: params.rename } : {}),
        ...(params?.typeId ? { typeId: params.typeId } : {}),
        ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
      };

      patchAllModelLists(qc, (list) =>
        mapList(list, (m) => (getId(m) === id ? { ...m, ...patch } : m))
      );
      if (Object.keys(patch).length) patchModelDetail(qc, id, patch);

      return { listsSnapshot, detailSnapshot, id };
    },
    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      for (const [key, data] of ctx.listsSnapshot ?? []) {
        qc.setQueryData(key, data);
      }
      if (ctx.detailSnapshot) qc.setQueryData(qk.model(ctx.id), ctx.detailSnapshot);
    },
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: qk.modelsRoot, exact: false });
      qc.invalidateQueries({ queryKey: qk.model(id), exact: true });
    },
  });
}

export function useSetReadOnlyModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['setReadOnlyModel'],
    mutationFn: (input: SetReadOnlyInput) => setReadOnlyModel(input),
    meta: {
      successMessage: 'Model permission updated',
      errorMessage: 'Failed to update model permission',
    },
    onMutate: async ({ id, readOnly }) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: qk.modelsRoot, exact: false }),
        qc.cancelQueries({ queryKey: qk.model(id), exact: true }),
      ]);

      const listsSnapshot = qc.getQueriesData<AnyList>({ queryKey: qk.modelsRoot, exact: false });
      const detailSnapshot = qc.getQueryData<Model>(qk.model(id));

      patchAllModelLists(qc, (list) =>
        mapList(list, (m) => (getId(m) === id ? { ...m, read_only: readOnly } : m))
      );
      patchModelDetail(qc, id, { read_only: readOnly });

      return { listsSnapshot, detailSnapshot, id };
    },
    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      for (const [key, data] of ctx.listsSnapshot ?? []) {
        qc.setQueryData(key, data);
      }
      if (ctx.detailSnapshot) qc.setQueryData(qk.model(ctx.id), ctx.detailSnapshot);
    },
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: qk.modelsRoot, exact: false });
      qc.invalidateQueries({ queryKey: qk.model(id), exact: true });
    },
  });
}