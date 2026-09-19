import { useCallback, useEffect, useState } from "react";

import type { Save } from "@/lib/database.types";
import { useSupabaseClient } from "@/lib/supabase";

export function useSaves() {
  const supabase = useSupabaseClient();
  const [saves, setSaves] = useState<Save[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    console.log("Fetching saves from REFETCH");
    setIsLoading(true);
    const { data, error } = await supabase
      .from("saves")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load saves", error);
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
