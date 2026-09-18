import { useUser } from '@clerk/expo';
import { useEffect, useState } from 'react';

import { useSupabaseClient } from '@/lib/supabase';
import type { Profile } from '@/lib/database.types';

/**
 * Ensures a `profiles` row exists for the signed-in Clerk user (there's no
 * Supabase-side trigger to provision one under Third-Party Auth) and exposes
 * it, including `is_approved`, which gates entry to the app in the root layout.
 */
export function useProfile() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    async function ensureProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user!.id,
            email: user!.primaryEmailAddress?.emailAddress ?? null,
            display_name: user!.fullName ?? null,
            avatar_url: user!.imageUrl ?? null,
          },
          { onConflict: 'id', ignoreDuplicates: false },
        )
        .select()
        .single();

      if (cancelled) return;
      if (error) {
        console.error('Failed to load profile', error);
        setIsLoading(false);
        return;
      }

      setProfile(data);
      setIsLoading(false);
    }

    ensureProfile();

    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  return { profile, isLoading };
}
