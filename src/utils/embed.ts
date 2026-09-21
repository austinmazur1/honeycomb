export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;
    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.split("/")[2];
    } else {
      videoId = parsed.searchParams.get("v");
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export function getTweetEmbedHtml(
  rawMetadata: Record<string, unknown> | null,
): string | null {
  const html =
    rawMetadata && typeof rawMetadata.html === "string"
      ? rawMetadata.html
      : null;
  if (!html) return null;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:8px;">${html}<script async src="https://platform.twitter.com/widgets.js"></script></body></html>`;
}
