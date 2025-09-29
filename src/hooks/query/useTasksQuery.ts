import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { loadTasks } from '@/services/tasks';
import { qk } from '@/hooks/queryKeys';
import { PagedTasks, TaskQuery } from '@/services/types';

export function useTasksQuery(params?: TaskQuery, enabled = true) {
  return useQuery<PagedTasks>({
    queryKey: qk.tasks(params),
    queryFn: () => loadTasks(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}