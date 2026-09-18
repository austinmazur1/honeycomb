import { useCallback, useEffect, useState } from 'react';

import { useSupabaseClient } from '@/lib/supabase';
import type { Save } from '@/lib/database.types';

export function useSaves() {
  const supabase = useSupabaseClient();
  const [saves, setSaves] = useState<Save[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('saves')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load saves', error);
    } else {
      setSaves(data ?? []);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { saves, isLoading, refetch };
}
