import { inferPlatform } from '@/lib/platform';
import { matchMetaContent, matchTitleTag, stripHtml } from '@/utils/html';
import { truncate } from '@/utils/string';

export type LinkMetadata = {
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  authorName: string | null;
  raw: Record<string, unknown> | null;
};

const EMPTY_METADATA: LinkMetadata = {
  title: null,
  description: null,
  thumbnailUrl: null,
  authorName: null,
  raw: null,
};

/**
 * Best-effort metadata lookup so the save form can pre-fill title/thumbnail.
 * Always resolves (never throws) — a failed fetch just means an empty form,
 * which the user can fill in manually.
 */
export async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
  const platform = inferPlatform(url);

  try {
    if (platform === 'youtube') return await fetchOEmbed(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (platform === 'x') return await fetchTwitterOEmbed(url);
    return await fetchOpenGraph(url);
  } catch (error) {
    console.warn('Link metadata fetch failed', error);
    return EMPTY_METADATA;
  }
}

async function fetchOEmbed(oEmbedUrl: string): Promise<LinkMetadata> {
  const response = await fetch(oEmbedUrl);
  if (!response.ok) return EMPTY_METADATA;
  const data = await response.json();
  return {
    title: data.title ?? null,
    description: null,
    thumbnailUrl: data.thumbnail_url ?? null,
    authorName: data.author_name ?? null,
    raw: data,
  };
}

async function fetchTwitterOEmbed(url: string): Promise<LinkMetadata> {
  const response = await fetch(
    `https://publish.x.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`,
  );
  if (!response.ok) return EMPTY_METADATA;
  const data = await response.json();
  const text = typeof data.html === 'string' ? stripHtml(data.html) : null;
  return {
    title: text ? truncate(text, 120) : (data.author_name ?? null),
    description: text,
    thumbnailUrl: null,
    authorName: data.author_name ?? null,
    raw: data,
  };
}

async function fetchOpenGraph(url: string): Promise<LinkMetadata> {
  const response = await fetch(url, { headers: { 'User-Agent': 'facebookexternalhit/1.1' } });
  if (!response.ok) return EMPTY_METADATA;
  const html = await response.text();
  const ogImage = matchMetaContent(html, 'og:image');
  return {
    title: matchMetaContent(html, 'og:title') ?? matchTitleTag(html),
    description: matchMetaContent(html, 'og:description'),
    thumbnailUrl: resolveUrl(ogImage, url),
    authorName: matchMetaContent(html, 'og:site_name'),
    raw: null,
  };
}

function resolveUrl(maybeUrl: string | null, baseUrl: string): string | null {
  if (!maybeUrl) return null;
  try {
    return new URL(maybeUrl, baseUrl).toString();
  } catch {
    return null;
  }
}
