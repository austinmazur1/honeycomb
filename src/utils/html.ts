const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;|&quot;|&apos;|&lt;|&gt;/g, (entity) => HTML_ENTITIES[entity]);
}

export function matchMetaContent(html: string, property: string): string | null {
  // Match the closing quote to the opening one, so an apostrophe inside content="…" doesn't cut it short.
  const content = `content=(?:"([^"]*)"|'([^']*)')`;
  const pattern = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+${content}`, 'i');
  const altPattern = new RegExp(`<meta[^>]+${content}[^>]+property=["']${property}["']`, 'i');
  const found = html.match(pattern) ?? html.match(altPattern);
  const match = found ? (found[1] ?? found[2]) : null;
  return match ? decodeHtmlEntities(match) : null;
}

export function matchTitleTag(html: string): string | null {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Instagram's og:title looks like `Display Name on Instagram: "caption…"`.
 * Best-effort split into author + caption; either can come back null if the format changes.
 */
export function parseInstagramOgTitle(ogTitle: string): { author: string | null; caption: string | null } {
  const match = ogTitle.match(/^(.+?) on Instagram(?::\s*"([\s\S]*)"\s*)?$/);
  if (!match) return { author: null, caption: null };
  return { author: match[1].trim() || null, caption: match[2]?.trim() || null };
}
