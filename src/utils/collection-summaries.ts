import { UNCATEGORIZED_ID, UNCATEGORIZED_LABEL } from "@/constants/collections";
import type { Category, Save } from "@/lib/database.types";
import { MAX_COVER_IMAGES } from "@/utils/collection-summaries.constants";

export type CollectionSummary = {
  id: string;
  name: string;
  count: number;
  /** Newest-first thumbnails for the cover collage, capped at four. */
  coverUrls: string[];
};

/**
 * One summary per category, plus an Uncategorized entry when any save lacks a category.
 * Assumes `saves` is already newest-first, which is how `useSaves` returns them.
 */
export function summarizeCollections(
  categories: Category[],
  saves: Save[],
): CollectionSummary[] {
  const byId = new Map<string, CollectionSummary>();
  for (const category of categories) {
    byId.set(category.id, {
      id: category.id,
      name: category.name,
      count: 0,
      coverUrls: [],
    });
  }
  const uncategorized: CollectionSummary = {
    id: UNCATEGORIZED_ID,
    name: UNCATEGORIZED_LABEL,
    count: 0,
    coverUrls: [],
  };

  for (const save of saves) {
    const summary = save.category_id
      ? byId.get(save.category_id)
      : uncategorized;
    if (!summary) continue;
    summary.count += 1;
    if (save.thumbnail_url && summary.coverUrls.length < MAX_COVER_IMAGES) {
      summary.coverUrls.push(save.thumbnail_url);
    }
  }

  const summaries = Array.from(byId.values());
  return uncategorized.count > 0 ? [...summaries, uncategorized] : summaries;
}
