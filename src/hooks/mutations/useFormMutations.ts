import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createForm, deleteForm, updateForm } from '@/services/forms';
import {
  type AddFormInput,
  type UpdateFormInput,
  type DeleteFormInput,
} from '@/services/types';
import { qk } from '@/hooks/queryKeys';

type AnyList =
  | FormConfig[]
  | { items: FormConfig[];[k: string]: unknown }
  | undefined;

const fid = (f?: FormConfig | null) => (f?._id ?? f?.name);

function mapList(list: AnyList, mapFn: (f: FormConfig) => FormConfig): AnyList {
  if (!list) return list;
  if (Array.isArray(list)) return list.map(mapFn);
  if (Array.isArray(list.items)) return { ...list, items: list.items.map(mapFn) };
  return list;
}

function filterList(list: AnyList, pred: (f: FormConfig) => boolean): AnyList {
  if (!list) return list;
  if (Array.isArray(list)) return list.filter(pred);
  if (Array.isArray(list.items)) return { ...list, items: list.items.filter(pred) };
  return list;
}

export function useCreateForm() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["createForm"],
    mutationFn: (input: AddFormInput) => createForm(input),
    meta: {
      successMessage: "Form has been created successfully",
      errorMessage: "Failed to create form",
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.formsRoot, exact: false });
    },
  });
}

export function useDeleteForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['deleteForm'],
    mutationFn: (input: DeleteFormInput) => deleteForm(input),
    meta: {
      successMessage: 'Form has been deleted successfully',
      errorMessage: 'Failed to delete form',
    },
    onMutate: async ({ formName }) => {
      await qc.cancelQueries({ queryKey: qk.formsRoot, exact: false });

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.formsRoot,
        exact: false,
      });

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(
          key,
          filterList(data, (f) => f.name !== formName)
        );
      }

      return { listsSnapshot, formName };
    },
    onError: (_e, _vars, ctx) => {
      ctx?.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: (_data, _err, { formName }) => {
      qc.invalidateQueries({ queryKey: qk.formsRoot, exact: false });
      if (formName) qc.removeQueries({ queryKey: qk.form(formName), exact: true });
    },
  });
}

export function useUpdateForm() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ['updateForm'],
    mutationFn: (input: UpdateFormInput) => updateForm(input),
    meta: {
      successMessage: 'Form has been updated successfully',
      errorMessage: 'Failed to update form',
    },
    onMutate: async (input) => {
      const { id } = input;

      await Promise.all([
        qc.cancelQueries({ queryKey: qk.formsRoot, exact: false }),
      ]);

      const listsSnapshot = qc.getQueriesData<AnyList>({
        queryKey: qk.formsRoot,
        exact: false,
      });

      let detailKeyToRestore: ReturnType<typeof qk.form> | null = null;
      let detailSnapshot: FormConfig | undefined;

      const apply = (f: FormConfig): FormConfig => {
        if (fid(f) !== id) return f;
        return { ...f, config: input.formSchema as string };
      };

      for (const [key, data] of listsSnapshot) {
        qc.setQueryData(key, mapList(data, apply));
      }

      const allQueryCache = qc.getQueryCache().findAll({
        predicate: (q) => {
          const k = q.queryKey;
          return Array.isArray(k) && k.length === 2 && k[0] === 'form';
        }
      });

      for (const q of allQueryCache) {
        const current = q.state.data as FormConfig | undefined;
        if (current && fid(current) === id) {
          detailKeyToRestore = q.queryKey as ReturnType<typeof qk.form>;
          detailSnapshot = current;
          qc.setQueryData<FormConfig>(q.queryKey, apply(current));
        }
      }

      return { listsSnapshot, detailSnapshot, detailKeyToRestore, id };
    },
    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      ctx.listsSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx.detailKeyToRestore && ctx.detailSnapshot) {
        qc.setQueryData(ctx.detailKeyToRestore, ctx.detailSnapshot);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.formsRoot, exact: false });
    },
  });
}