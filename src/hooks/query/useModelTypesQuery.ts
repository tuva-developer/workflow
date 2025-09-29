import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { qk } from '@/hooks/queryKeys';
import { ModelTypeQuery, PagedModelTypes } from '@/services/types';
import { loadModelTypes } from '@/services/modelTypes';

export function useModelTypesQuery(params?: ModelTypeQuery, enabled = true) {
  return useQuery<PagedModelTypes>({
    queryKey: qk.modelTypes(params),
    queryFn: () => loadModelTypes(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}