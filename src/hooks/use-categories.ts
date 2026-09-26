import { useUser } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Category } from "@/lib/database.types";
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
    onSuccess: (category) => {
      // Seed the cache so a screen that just selected the new category can show its name.
      queryClient.setQueryData<Category[]>(
        queryKeys.categories(user?.id),
        (categories) => (categories ? [...categories, category] : categories),
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(user?.id),
      });
    },
  });
}
