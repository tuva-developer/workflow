import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { loadGroups } from '@/services/groups';
import { qk } from '@/hooks/queryKeys';
import { GroupQuery, PagedGroups } from '@/services/types';

export function useGroupsQuery(params?: GroupQuery, enabled = true) {
  return useQuery<PagedGroups>({
    queryKey: qk.groups(params),
    queryFn: () => loadGroups(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}