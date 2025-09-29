import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/hooks/queryKeys';
import {
  deleteInstance,
} from '@/services/instances';
import { DeleteInstanceInput } from '@/services/types';

type AnyList =
  | Instance[]
  | {
      items: Instance[];
      [k: string]: unknown;
    }
  | undefined;

const getId = (i?: Instance | null): string | undefined => i?._id;

function filterList(list: AnyList, pred: (i: Instance) => boolean): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.filter(pred);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.filter(pred) };
  }

  return list;
}

export function useDeleteInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['deleteInstance'],
    mutationFn: ({ instanceId }: DeleteInstanceInput) => deleteInstance({ instanceId }),
    meta: {
      successMessage: 'Instance has been deleted successfully',
      errorMessage: 'Failed to delete instance',
    },
    onMutate: async ({ instanceId }) => {
      await qc.cancelQueries({ queryKey: qk.instancesRoot, exact: false });

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.instancesRoot,
        exact: false,
      });

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(key, filterList(data, (i) => getId(i) !== instanceId));
      }

      return { listsSnapshot, instanceId };
    },
    onError: (_e, _vars, ctx) => {
      ctx?.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: (_data, _err, { instanceId }) => {
      qc.invalidateQueries({ queryKey: qk.instancesRoot, exact: false });
      qc.removeQueries({ queryKey: qk.instance(instanceId), exact: true });
    },
  });
}