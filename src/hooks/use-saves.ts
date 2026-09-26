import { useUser } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Database, Save } from "@/lib/database.types";
import { queryKeys } from "@/lib/query-keys";
import { useSupabaseClient } from "@/lib/supabase";
import {
  deleteSave,
  fetchSaves,
  insertSave,
  updateSave,
} from "@/lib/supabase-queries";

export function useSaves() {
  const supabase = useSupabaseClient();
  const { user } = useUser();

  // `supabase` is a stable module-level singleton, not a cache-differentiating value.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const query = useQuery({
    queryKey: queryKeys.saves(user?.id),
    queryFn: () => fetchSaves(supabase),
    enabled: !!user?.id,
  });

  return {
    saves: query.data ?? [],
    isLoading: query.isPending,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

export function useCreateSave() {
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (save: Database["public"]["Tables"]["saves"]["Insert"]) =>
      insertSave(supabase, save),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saves(user?.id) });
    },
  });
}

type SavePatch = Database["public"]["Tables"]["saves"]["Update"];

/**
 * Patches one save, applying the change to the cached detail immediately so edits feel instant.
 * Updates to the same save run one at a time so a slow request can't land after a newer one.
 */
export function useUpdateSave(id: string | undefined) {
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const mutationKey = ["updateSave", id];

  return useMutation({
    mutationKey,
    scope: { id: `save-${id}` },
    mutationFn: (patch: SavePatch) => updateSave(supabase, id!, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.save(id) });
      const previous = queryClient.getQueryData<Save | null>(queryKeys.save(id));
      queryClient.setQueryData<Save | null>(queryKeys.save(id), (save) =>
        save ? { ...save, ...patch } : save,
      );
      return { previous };
    },
    onError: (_error, patch, context) => {
      const previous = context?.previous;
      if (!previous) return;
      // Only revert the fields this patch touched, so other in-flight edits survive.
      const reverted = Object.fromEntries(
        Object.keys(patch).map((field) => [field, previous[field as keyof Save]]),
      );
      queryClient.setQueryData<Save | null>(queryKeys.save(id), (save) =>
        save ? { ...save, ...reverted } : save,
      );
    },
    onSettled: () => {
      // This mutation still counts as pending here; refetching while a newer edit is
      // queued would briefly show the pre-edit value.
      if (queryClient.isMutating({ mutationKey }) > 1) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.save(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.saves(user?.id) });
    },
  });
}

export function useDeleteSave() {
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSave(supabase, id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saves(user?.id) });
      queryClient.removeQueries({ queryKey: queryKeys.save(id) });
    },
  });
}
