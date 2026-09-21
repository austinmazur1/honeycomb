const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

function decodeHtmlEntities(value: string): string {
  return value.replace(/&amp;|&quot;|&#39;|&apos;|&lt;|&gt;/g, (entity) => HTML_ENTITIES[entity]);
}

export function matchMetaContent(html: string, property: string): string | null {
  const pattern = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`,
    'i',
  );
  const altPattern = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`,
    'i',
  );
  const match = html.match(pattern)?.[1] ?? html.match(altPattern)?.[1] ?? null;
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
