import type { Platform } from '@/lib/database.types';
import {
  EMPTY_METADATA,
  OPEN_GRAPH_USER_AGENT,
  X_OEMBED_ENDPOINT,
  YOUTUBE_OEMBED_ENDPOINT,
} from '@/lib/link-metadata.constants';
import { hasCaptionInsteadOfTitle, inferPlatform } from '@/lib/platform';
import { matchMetaContent, matchTitleTag, parseInstagramOgTitle, stripHtml } from '@/utils/html';

export type LinkMetadata = {
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  authorName: string | null;
  raw: Record<string, unknown> | null;
};

/**
 * Best-effort metadata lookup so the save form can pre-fill title/thumbnail.
 * Always resolves (never throws) — a failed fetch just means an empty form,
 * which the user can fill in manually.
 */
export async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
  const platform = inferPlatform(url);

  try {
    const metadata = await fetchForPlatform(url, platform);
    // Social posts don't have titles, just captions. Keep the caption as the description
    // and leave the title empty so a quick save doesn't end up titled with a wall of hashtags.
    if (hasCaptionInsteadOfTitle(platform)) {
      return { ...metadata, title: null, description: metadata.description ?? metadata.title };
    }
    return metadata;
  } catch (error) {
    console.warn('Link metadata fetch failed', error);
    return EMPTY_METADATA;
  }
}

async function fetchForPlatform(url: string, platform: Platform): Promise<LinkMetadata> {
  if (platform === 'youtube') return fetchOEmbed(`${YOUTUBE_OEMBED_ENDPOINT}?url=${encodeURIComponent(url)}&format=json`);
  if (platform === 'x') return fetchTwitterOEmbed(url);
  if (platform === 'instagram') return fetchInstagram(url);
  // LinkedIn's og:site_name is just "LinkedIn", which isn't an author.
  if (platform === 'linkedin') return { ...(await fetchOpenGraph(url)), authorName: null };
  return fetchOpenGraph(url);
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
    `${X_OEMBED_ENDPOINT}?url=${encodeURIComponent(url)}&omit_script=true`,
  );
  if (!response.ok) return EMPTY_METADATA;
  const data = await response.json();
  const text = typeof data.html === 'string' ? stripHtml(data.html) : null;
  return {
    title: text,
    description: text,
    thumbnailUrl: null,
    authorName: data.author_name ?? null,
    raw: data,
  };
}

async function fetchOpenGraph(url: string): Promise<LinkMetadata> {
  const response = await fetch(url, { headers: { 'User-Agent': OPEN_GRAPH_USER_AGENT } });
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

async function fetchInstagram(url: string): Promise<LinkMetadata> {
  const metadata = await fetchOpenGraph(url);
  // og:site_name is just "Instagram"; the poster's name and the caption live in og:title.
  const { author, caption } = metadata.title ? parseInstagramOgTitle(metadata.title) : { author: null, caption: null };
  return {
    ...metadata,
    description: caption ?? metadata.description,
    authorName: author,
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
