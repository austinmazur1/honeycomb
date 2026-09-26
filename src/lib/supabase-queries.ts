import type { SupabaseClient } from "@supabase/supabase-js";

import type { Category, Database, Profile, Save } from "@/lib/database.types";
import { decodeHtmlEntities } from "@/utils/html";

type DB = SupabaseClient<Database>;

/** Minimal shape of Clerk's `user` needed to provision a `profiles` row. */
export interface ProfileSourceUser {
  id: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  fullName?: string | null;
  imageUrl?: string | null;
}

export async function ensureAndFetchProfile(
  supabase: DB,
  user: ProfileSourceUser,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        display_name: user.fullName ?? null,
        avatar_url: user.imageUrl ?? null,
      },
      { onConflict: "id", ignoreDuplicates: false },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deletes every row the user owns, children before the profile they reference.
 * RLS silently skips rows it won't let you delete, so the profile is checked
 * afterwards: once it's gone, the foreign keys guarantee saves and categories are too.
 * Safe to re-run if a previous attempt got partway.
 */
export async function deleteAccountData(supabase: DB, userId: string): Promise<void> {
  const saves = await supabase.from("saves").delete().eq("owner_user_id", userId);
  if (saves.error) throw saves.error;

  const categories = await supabase
    .from("categories")
    .delete()
    .eq("owner_user_id", userId);
  if (categories.error) throw categories.error;

  const profile = await supabase.from("profiles").delete().eq("id", userId);
  if (profile.error) throw profile.error;

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (data) {
    throw new Error("Profile row wasn't deleted — check the profiles DELETE policy");
  }
}

/** Older saves were stored with raw HTML entities ("&#x26a0") in their scraped text; clean them on read. */
function decodeSaveText(save: Save): Save {
  return {
    ...save,
    title: save.title && decodeHtmlEntities(save.title),
    description: save.description && decodeHtmlEntities(save.description),
    author_name: save.author_name && decodeHtmlEntities(save.author_name),
  };
}

export async function fetchSaves(supabase: DB): Promise<Save[]> {
  const { data, error } = await supabase
    .from("saves")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(decodeSaveText);
}

export async function fetchSave(supabase: DB, id: string): Promise<Save | null> {
  const { data, error } = await supabase
    .from("saves")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data ? decodeSaveText(data) : null;
}

export async function insertSave(
  supabase: DB,
  save: Database["public"]["Tables"]["saves"]["Insert"],
): Promise<Save> {
  const { data, error } = await supabase
    .from("saves")
    .insert(save)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSave(
  supabase: DB,
  id: string,
  patch: Database["public"]["Tables"]["saves"]["Update"],
): Promise<Save> {
  const { data, error } = await supabase
    .from("saves")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSave(supabase: DB, id: string): Promise<void> {
  const { error } = await supabase.from("saves").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchCategories(supabase: DB): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function insertCategory(
  supabase: DB,
  ownerUserId: string,
  name: string,
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({ owner_user_id: ownerUserId, name: name.trim() })
    .select()
    .single();

  if (error) throw error;
  return data;
}
