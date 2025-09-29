import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { loadSchedules } from '@/services/schedules';
import { qk } from '@/hooks/queryKeys';
import { PagedSchedules, ScheduleQuery } from '@/services/types';

export function useSchedulesQuery(params?: ScheduleQuery, enabled = true) {
  return useQuery<PagedSchedules>({
    queryKey: qk.schedules(params),
    queryFn: () => loadSchedules(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}