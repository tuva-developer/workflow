import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { loadModelPermission } from '@/services/models';
import { qk } from '@/hooks/queryKeys';
import type { ModelPermission } from '@/services/types';

export function useModelPermissionQuery(id: string, enabled = true) {
  return useQuery<ModelPermission>({
    queryKey: id ? qk.modelPermission(id) : ['modelPermission', 'disabled'],
    queryFn: () => loadModelPermission(id),
    enabled,
    placeholderData: keepPreviousData,
  });
}