const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  bull: '•',
  middot: '·',
  copy: '©',
  reg: '®',
  trade: '™',
};

// Numeric entities may omit the trailing ";" (sites really do send "&#x26a0"); named ones must have it.
const ENTITY_PATTERN = /&#x([0-9a-f]+);?|&#(\d+);?|&([a-z]+);/gi;
const MAX_CODE_POINT = 0x10ffff;

function decodeOnce(value: string): string {
  return value.replace(ENTITY_PATTERN, (entity, hex?: string, decimal?: string, name?: string) => {
    if (name) return NAMED_ENTITIES[name.toLowerCase()] ?? entity;
    const codePoint = hex ? parseInt(hex, 16) : Number(decimal);
    return codePoint > 0 && codePoint <= MAX_CODE_POINT ? String.fromCodePoint(codePoint) : entity;
  });
}

/**
 * "Heads up &#x26a0 it&amp;#39;s here" -> "Heads up ⚠ it's here".
 * Runs a second pass because captions often arrive double-encoded ("&amp;#x1f525;").
 */
export function decodeHtmlEntities(value: string): string {
  const once = decodeOnce(value);
  return once === value ? once : decodeOnce(once);
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
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
  return title ? decodeHtmlEntities(title) : null;
}

export function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' '))
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
