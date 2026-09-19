import { useUser } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Database } from "@/lib/database.types";
import { queryKeys } from "@/lib/query-keys";
import { useSupabaseClient } from "@/lib/supabase";
import { deleteSave, fetchSaves, insertSave } from "@/lib/supabase-queries";

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
