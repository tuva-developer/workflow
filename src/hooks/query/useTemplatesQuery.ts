import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { loadTemplates } from '@/services/templates';
import { qk } from '@/hooks/queryKeys';
import { PagedTemplates, TemplateQuery } from '@/services/types';

export function useTemplatesQuery(params?: TemplateQuery, enabled = true) {
  return useQuery<PagedTemplates>({
    queryKey: qk.templates(params),
    queryFn: () => loadTemplates(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}