/** "https://www.nytimes.com/2026/..." -> "nytimes.com". Falls back to the raw input if it isn't a URL. */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
