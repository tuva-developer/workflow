import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { loadForms } from '@/services/forms';
import { PagedForms, FormQuery } from '@/services/types';
import { qk } from '@/hooks/queryKeys';

export function useFormsQuery(params?: FormQuery, enabled = true) {
  return useQuery<PagedForms>({
    queryKey: qk.forms(params),
    queryFn: () => loadForms(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}