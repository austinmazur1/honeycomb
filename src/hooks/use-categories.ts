import { useUser } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { useSupabaseClient } from "@/lib/supabase";
import { fetchCategories, insertCategory } from "@/lib/supabase-queries";

export function useCategories() {
  const supabase = useSupabaseClient();
  const { user } = useUser();

  // `supabase` is a stable module-level singleton, not a cache-differentiating value.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const query = useQuery({
    queryKey: queryKeys.categories(user?.id),
    queryFn: () => fetchCategories(supabase),
    enabled: !!user?.id,
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isPending,
    refetch: query.refetch,
  };
}

export function useCreateCategory() {
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => {
      if (!user) throw new Error("Not signed in");
      return insertCategory(supabase, user.id, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(user?.id),
      });
    },
  });
}
