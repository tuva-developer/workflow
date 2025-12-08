import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { qk } from '@/hooks/queryKeys';
import { loadInstanceData, loadInstanceDataPublic, loadInstances } from '@/services/instances';
import type { InstanceQuery, PagedInstances } from '@/services/types';

export function useInstancesQuery(params?: InstanceQuery, enabled = true) {
    return useQuery<PagedInstances>({
        queryKey: qk.instances(params),
        queryFn: () => loadInstances(params),
        enabled,
        placeholderData: keepPreviousData,
    });
}

export function useInstanceQuery(id: string | undefined, enabled = true) {
  return useQuery<Instance>({
    queryKey: id ? qk.instance(id) : ['instance', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Instance id is required');
      return loadInstanceData(id);
    },
    enabled: !!id && enabled,
  });
}

export function useInstanceQueryPublic(id: string | undefined, enabled = true) {
  return useQuery<Instance>({
    queryKey: id ? qk.instance(id) : ['instance', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Instance id is required');
      return loadInstanceDataPublic(id);
    },
    enabled: !!id && enabled,
  });
}
