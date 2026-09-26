import { useUser } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { useSupabaseClient } from "@/lib/supabase";
import { deleteAccountData, ensureAndFetchProfile } from "@/lib/supabase-queries";

/**
 * Ensures a `profiles` row exists for the signed-in Clerk user (there's no
 * Supabase-side trigger to provision one under Third-Party Auth) and exposes
 * it, including `is_approved`, which gates entry to the app in the root layout.
 */
export function useProfile() {
  const { user } = useUser();
  const supabase = useSupabaseClient();

  // `supabase` is a stable module-level singleton and `user` is deliberately
  // not keyed on directly (its reference isn't stable across renders) — the
  // key is `user?.id` instead, so neither belongs in the queryKey.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const query = useQuery({
    queryKey: queryKeys.profile(user?.id),
    queryFn: () => ensureAndFetchProfile(supabase, user!),
    enabled: !!user?.id,
  });

  return { profile: query.data ?? null, isLoading: query.isPending };
}

/**
 * Permanently deletes the user's data and then their Clerk account. Data goes
 * first because the Clerk session is what authorizes the Supabase deletes;
 * deleting the Clerk user ends that session, which sends the app to sign-in.
 */
export function useDeleteAccount() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      await deleteAccountData(supabase, user.id);
      await user.delete();
    },
    onSuccess: () => queryClient.clear(),
  });
}
