/** "https://www.nytimes.com/2026/..." -> "nytimes.com". Falls back to the raw input if it isn't a URL. */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** pluralize(1, "save") -> "1 save"; pluralize(3, "save") -> "3 saves". */
export function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}
