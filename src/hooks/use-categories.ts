import { useCallback, useEffect, useState } from 'react';

import { useSupabaseClient } from '@/lib/supabase';
import type { Category } from '@/lib/database.types';
import { useUser } from '@clerk/expo';

export function useCategories() {
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('name');

    if (error) {
      console.error('Failed to load categories', error);
    } else {
      setCategories(data ?? []);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createCategory = useCallback(
    async (name: string) => {
      if (!user) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('categories')
        .insert({ owner_user_id: user.id, name: name.trim() })
        .select()
        .single();

      if (error) throw error;
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    },
    [supabase, user],
  );

  return { categories, isLoading, refetch, createCategory };
}
