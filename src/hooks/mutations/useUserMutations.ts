import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createUser,
  deleteUser,
  updateUser,
  updateUserRole,
} from '@/services/users';
import {
  UpdateUserInput,
  type CreateUserInput,
  type DeleteUserInput,
  type UpdateUserRoleInput,
} from '@/services/types';
import { qk } from '@/hooks/queryKeys';

type AnyList =
  | User[]
  | { items: User[];[k: string]: unknown }
  | undefined;

const uid = (u?: User | null): string | undefined => u?.userId;

function mapList(list: AnyList, mapFn: (u: User) => User): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.map(mapFn);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.map(mapFn) };
  }

  return list;
}

function filterList(list: AnyList, pred: (u: User) => boolean): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.filter(pred);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.filter(pred) };
  }

  return list;
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['createUser'],
    mutationFn: (input: CreateUserInput) => createUser(input),
    meta: {
      successMessage: 'User has been created successfully',
      errorMessage: 'Failed to create user',
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.usersRoot, exact: false }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['deleteUser'],
    mutationFn: (input: DeleteUserInput) => deleteUser(input),
    meta: {
      successMessage: 'User has been deleted successfully',
      errorMessage: 'Failed to delete user',
    },
    onMutate: async ({ userId }) => {
      await qc.cancelQueries({ queryKey: qk.usersRoot, exact: false });

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.usersRoot,
        exact: false,
      });

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(key, filterList(data, (u) => uid(u) !== userId));
      }

      return { listsSnapshot, userId };
    },
    onError: (_e, _vars, ctx) => {
      ctx?.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: (_data, _err, { userId }) => {
      qc.invalidateQueries({ queryKey: qk.usersRoot, exact: false });
      qc.removeQueries({ queryKey: qk.user(userId), exact: true });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ['updateUser'],
    mutationFn: (input: UpdateUserInput) => updateUser(input),
    meta: {
      successMessage: 'User has been updated successfully',
      errorMessage: 'Failed to update user',
    },
    onMutate: async (input) => {
      const { userId } = input;
      await Promise.all([
        qc.cancelQueries({ queryKey: qk.usersRoot, exact: false }),
        qc.cancelQueries({ queryKey: qk.user(userId), exact: true }),
      ]);

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.usersRoot,
        exact: false,
      });
      const detailSnapshot = qc.getQueryData<User>(qk.user(userId));

      const apply = (u: User): User => {
        if (uid(u) !== userId) return u;
        const { ...rest } = input;
        return { ...u, ...rest };
      };

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(key, mapList(data, apply));
      }
      if (detailSnapshot) {
        qc.setQueryData<User>(qk.user(userId), apply(detailSnapshot));
      }

      return { listsSnapshot, detailSnapshot, userId };
    },
    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      ctx.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx.detailSnapshot) qc.setQueryData(qk.user(ctx.userId), ctx.detailSnapshot);
    },
    onSettled: (_data, _err, { userId }) => {
      qc.invalidateQueries({ queryKey: qk.usersRoot, exact: false });
      qc.invalidateQueries({ queryKey: qk.user(userId), exact: true });
    },
  });
}


export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['updateUserRole'],
    mutationFn: (input: UpdateUserRoleInput) => updateUserRole(input),
    meta: {
      successMessage: 'User roles have been updated successfully',
      errorMessage: 'Failed to update user roles',
    },
    onMutate: async ({ userId, roles }) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: qk.usersRoot, exact: false }),
        qc.cancelQueries({ queryKey: qk.user(userId), exact: true }),
      ]);

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.usersRoot,
        exact: false,
      });
      const detailSnapshot = qc.getQueryData<User>(qk.user(userId));

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(
          key,
          mapList(data, (u) => (uid(u) === userId ? { ...u, roles: [...roles] } : u))
        );
      }
      if (detailSnapshot) {
        qc.setQueryData<User>(qk.user(userId), { ...detailSnapshot, roles: [...roles] });
      }

      return { listsSnapshot, detailSnapshot, userId };
    },
    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      ctx.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx.detailSnapshot) qc.setQueryData(qk.user(ctx.userId), ctx.detailSnapshot);
    },
    onSettled: (_data, _err, { userId }) => {
      qc.invalidateQueries({ queryKey: qk.usersRoot, exact: false });
      qc.invalidateQueries({ queryKey: qk.user(userId), exact: true });
    },
  });
}