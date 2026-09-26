export const NAMED_ENTITIES: Record<string, string> = {
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
export const ENTITY_PATTERN = /&#x([0-9a-f]+);?|&#(\d+);?|&([a-z]+);/gi;
export const MAX_CODE_POINT = 0x10ffff;
