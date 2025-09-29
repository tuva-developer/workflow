import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  deleteAllSchedules,
} from '@/services/schedules';
import {
  AddScheduleInput,
  UpdateScheduleInput,
  DeleteScheduleInput,
} from '@/services/types';
import { qk } from '@/hooks/queryKeys';

type AnyList =
  | Schedule[]
  | {
      items: Schedule[];
      [k: string]: unknown;
    }
  | undefined;

const sid = (s?: unknown): string | undefined => {
  if (typeof s !== 'object' || s === null) return undefined;
  const obj = s as Record<string, unknown>;
  const candidate = obj._id ?? obj.scheduleId;
  if (typeof candidate === 'string' || typeof candidate === 'number') return String(candidate);
  return undefined;
};

function mapList(list: AnyList, mapFn: (s: Schedule) => Schedule): AnyList {
  if (!list) return list;

  if (Array.isArray(list)) {
    return list.map(mapFn);
  }

  if ('items' in list && Array.isArray(list.items)) {
    return { ...list, items: list.items.map(mapFn) };
  }

  return list;
}

function filterList(list: AnyList, pred: (s: Schedule) => boolean): AnyList {
  if (!list) return list;
  if (Array.isArray(list)) return list.filter(pred);
  if (Array.isArray(list.items)) return { ...list, items: list.items.filter(pred) };
  return list;
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['createSchedule'],
    mutationFn: (input: AddScheduleInput) => createSchedule(input),
    meta: {
      successMessage: 'Schedule has been created successfully',
      errorMessage: 'Failed to create schedule',
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.schedulesRoot, exact: false });
    },
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['updateSchedule'],
    mutationFn: (input: UpdateScheduleInput) => updateSchedule(input),
    meta: {
      successMessage: 'Schedule has been updated successfully',
      errorMessage: 'Failed to update schedule',
    },
    onMutate: async (input) => {
      const { scheduleId } = input;
      await Promise.all([
        qc.cancelQueries({ queryKey: qk.schedulesRoot, exact: false }),
        qc.cancelQueries({ queryKey: qk.schedule(scheduleId), exact: true }),
      ]);

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.schedulesRoot,
        exact: false,
      });
      const detailSnapshot = qc.getQueryData<Schedule>(qk.schedule(scheduleId));

      const apply = (s: Schedule): Schedule => {
        if (sid(s) !== scheduleId) return s;
        return { ...s, ...input };
      };

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(key, mapList(data, apply));
      }
      if (detailSnapshot) {
        qc.setQueryData<Schedule>(qk.schedule(scheduleId), apply(detailSnapshot));
      }

      return { listsSnapshot, detailSnapshot, scheduleId };
    },
    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      ctx.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx.detailSnapshot) qc.setQueryData(qk.schedule(ctx.scheduleId), ctx.detailSnapshot);
    },
    onSettled: (_data, _err, { scheduleId }) => {
      qc.invalidateQueries({ queryKey: qk.schedulesRoot, exact: false });
      qc.invalidateQueries({ queryKey: qk.schedule(scheduleId), exact: true });
    },
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['deleteSchedule'],
    mutationFn: (input: DeleteScheduleInput) => deleteSchedule(input),
    meta: {
      successMessage: 'Schedule has been deleted successfully',
      errorMessage: 'Failed to delete schedule',
    },
    onMutate: async ({ scheduleId }) => {
      await qc.cancelQueries({ queryKey: qk.schedulesRoot, exact: false });

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.schedulesRoot,
        exact: false,
      });

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(key, filterList(data, (s) => sid(s) !== scheduleId));
      }

      return { listsSnapshot, scheduleId };
    },
    onError: (_e, _vars, ctx) => {
      ctx?.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: (_data, _err, { scheduleId }) => {
      qc.invalidateQueries({ queryKey: qk.schedulesRoot, exact: false });
      qc.removeQueries({ queryKey: qk.schedule(scheduleId), exact: true });
    },
  });
}

export function useDeleteAllSchedules() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['deleteAllSchedules'],
    mutationFn: () => deleteAllSchedules(),
    meta: {
      successMessage: 'All schedules have been deleted successfully',
      errorMessage: 'Failed to delete all schedules',
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.schedulesRoot, exact: false });
    },
  });
}