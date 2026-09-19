import "react-native-url-polyfill/auto";

import { useAuth } from "@clerk/expo";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect } from "react";

import type { Database } from "@/lib/database.types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.",
  );
}

// Clerk's `getToken` doesn't have a stable identity across renders, so it's
// tracked in a module-level slot rather than the client's `accessToken`
// closure — that keeps the client itself a singleton (its identity never
// changes), which matters because every data hook depends on it in effect
// arrays; a client that changed identity on every render would refetch forever.
let latestGetToken: (() => Promise<string | null>) | null = null;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => (latestGetToken ? await latestGetToken() : null),
});

/**
 * Bridges Clerk's session to Supabase via Supabase's Third-Party Auth support:
 * Clerk issues the JWT, Supabase verifies it directly (no shared secret, no
 * Supabase `auth.users` row). See Supabase Auth → Third-Party Auth → Clerk.
 */
export function useSupabaseClient(): SupabaseClient<Database> {
  const { getToken } = useAuth();

  useEffect(() => {
    latestGetToken = async () => (await getToken()) ?? null;
  }, [getToken]);

  return supabase;
}
