import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { qk } from '@/hooks/queryKeys';
import { ModelCategoryQuery, PagedModelCategories } from '@/services/types';
import { loadModelCategories } from '@/services/modelCategories';

export function useModelCategoriesQuery(params?: ModelCategoryQuery, enabled = true) {
  return useQuery<PagedModelCategories>({
    queryKey: qk.modelCategories(params),
    queryFn: () => loadModelCategories(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
