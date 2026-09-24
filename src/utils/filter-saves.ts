import type { Platform, Save } from "@/lib/database.types";

export function filterSaves(
  saves: Save[],
  query: string,
  platformFilter: Platform | null,
  categoryNameById: Map<string, string>,
): Save[] {
  const q = query.trim().toLowerCase();
  return saves.filter((save) => {
    if (platformFilter && save.platform !== platformFilter) return false;
    if (!q) return true;
    const categoryName = save.category_id
      ? (categoryNameById.get(save.category_id) ?? "")
      : "";
    const haystack = [
      save.title,
      save.description,
      save.author_name,
      categoryName,
      ...save.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
