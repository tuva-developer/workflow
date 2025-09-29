import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addGroup,
  updateGroup,
  deleteGroup,
} from '@/services/groups';
import { AddGroupInput, DeleteGroupInput, UpdateGroupInput } from '@/services/types';
import { qk } from '@/hooks/queryKeys';

type AnyList =
  | Group[]
  | { items: Group[]; [k: string]: unknown }
  | undefined;

const gid = (g?: unknown): string | undefined => {
  if (typeof g !== 'object' || g === null) return undefined;
  const obj = g as Record<string, unknown>;
  const candidate = obj.id ?? obj._id ?? obj.groupId;
  if (typeof candidate === 'string' || typeof candidate === 'number') {
    return String(candidate);
  }
  return undefined;
};

function mapList(list: AnyList, mapFn: (g: Group) => Group): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.map(mapFn);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.map(mapFn) };
  }

  return list;
}

function filterList(list: AnyList, pred: (g: Group) => boolean): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.filter(pred);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.filter(pred) };
  }

  return list;
}

export function useAddGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['addGroup'],
    mutationFn: (input: AddGroupInput) => addGroup(input),
    meta: {
      successMessage: 'Group has been created successfully',
      errorMessage: 'Failed to create group',
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.groupsRoot, exact: false }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['deleteGroup'],
    mutationFn: (input: DeleteGroupInput) => deleteGroup(input),
    meta: {
      successMessage: 'Group has been deleted successfully',
      errorMessage: 'Failed to delete group',
    },
    onMutate: async ({ groupId }) => {
      await qc.cancelQueries({ queryKey: qk.groupsRoot, exact: false });

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.groupsRoot,
        exact: false,
      });

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(key, filterList(data, (g) => gid(g) !== groupId));
      }

      return { listsSnapshot, groupId } as const;
    },
    onError: (_e, _vars, ctx) => {
      ctx?.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: (_data, _err, { groupId }) => {
      qc.invalidateQueries({ queryKey: qk.groupsRoot, exact: false });
      qc.removeQueries({ queryKey: qk.group(groupId), exact: true });
    },
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['updateGroup'],
    mutationFn: (input: UpdateGroupInput) => updateGroup(input),
    meta: {
      successMessage: 'Group has been updated successfully',
      errorMessage: 'Failed to update group',
    },
    onMutate: async ({ id, name, description, members }) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: qk.groupsRoot, exact: false }),
        qc.cancelQueries({ queryKey: qk.group(id), exact: true }),
      ]);

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.groupsRoot,
        exact: false,
      });
      const detailSnapshot = qc.getQueryData<Group>(qk.group(id));

      const apply = (g: Group): Group =>
        gid(g) === id
          ? {
            ...g,
            name,
            description,
            ...(Array.isArray(members) ? { members: [...members] } : {}),
          }
          : g;

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(key, mapList(data, apply));
      }
      if (detailSnapshot) {
        qc.setQueryData<Group>(qk.group(id), apply(detailSnapshot));
      }

      return { listsSnapshot, detailSnapshot, id } as const;
    },
    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      ctx.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx.detailSnapshot) qc.setQueryData(qk.group(ctx.id), ctx.detailSnapshot);
    },
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: qk.groupsRoot, exact: false });
      qc.invalidateQueries({ queryKey: qk.group(id), exact: true });
    },
  });
}