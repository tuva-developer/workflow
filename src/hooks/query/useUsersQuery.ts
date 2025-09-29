import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { loadUsers } from '@/services/users';
import { qk } from '@/hooks/queryKeys';
import { PagedUsers, UserQuery } from '@/services/types';

export function useUsersQuery(params?: UserQuery, enabled = true) {
  return useQuery<PagedUsers>({
    queryKey: qk.users(params),
    queryFn: () => loadUsers(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}