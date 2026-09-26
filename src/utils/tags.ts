/** "bjj, technique,, BJJ " -> ["bjj", "technique"] */
export function parseTags(text: string): string[] {
  const tags = text
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return mergeTags([], tags);
}

/** Appends `added` to `existing`, skipping case-insensitive duplicates. */
export function mergeTags(existing: string[], added: string[]): string[] {
  const seen = new Set(existing.map((tag) => tag.toLowerCase()));
  const merged = [...existing];
  for (const tag of added) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(tag);
  }
  return merged;
}
