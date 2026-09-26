import type { LinkMetadata } from '@/lib/link-metadata';

export const EMPTY_METADATA: LinkMetadata = {
  title: null,
  description: null,
  thumbnailUrl: null,
  authorName: null,
  raw: null,
};

export const YOUTUBE_OEMBED_ENDPOINT = 'https://www.youtube.com/oembed';
export const X_OEMBED_ENDPOINT = 'https://publish.x.com/oembed';

/** Sites serve full Open Graph tags to Facebook's crawler even when they'd gate a normal client. */
export const OPEN_GRAPH_USER_AGENT = 'facebookexternalhit/1.1';
