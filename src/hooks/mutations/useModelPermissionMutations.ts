import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateModelPermission } from '@/services/models';
import { qk } from '@/hooks/queryKeys';
import type { ModelPermission } from '@/services/types';

export function useUpdateModelPermission() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ['updateModelPermission'],
    mutationFn: (args: { id: string; data: ModelPermission }) =>
      updateModelPermission(args.id, args.data),
    meta: {
      successMessage: 'Update model permission success',
      errorMessage: 'Failed to update model permission',
    },
    onMutate: async ({ id, data }) => {
      const key = qk.modelPermission(id);
      await qc.cancelQueries({ queryKey: key, exact: true });
      const prev = qc.getQueryData<ModelPermission>(key);

      if (prev) {
        qc.setQueryData<ModelPermission>(key, {
          ...prev,
          edit: data.edit ?? prev.edit,
          execute: data.execute ?? prev.execute,
        });
      }

      return { key, prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.key) qc.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: qk.modelPermission(id), exact: true });
    },
  });
}