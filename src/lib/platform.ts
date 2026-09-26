import type { Platform } from '@/lib/database.types';

const PLATFORM_HOSTS: { platform: Platform; hosts: string[] }[] = [
  { platform: 'instagram', hosts: ['instagram.com'] },
  { platform: 'x', hosts: ['x.com', 'twitter.com'] },
  { platform: 'youtube', hosts: ['youtube.com', 'youtu.be'] },
  { platform: 'linkedin', hosts: ['linkedin.com'] },
];

export function inferPlatform(url: string): Platform {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const match = PLATFORM_HOSTS.find(({ hosts }) => hosts.some((host) => hostname === host));
    return match?.platform ?? 'other';
  } catch {
    return 'other';
  }
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  x: 'X',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  other: 'Other',
};

/**
 * Platforms whose link metadata "title" is really the post caption (long, emoji/hashtag-heavy).
 * For these we keep the caption as the description and leave the title for the user to write.
 */
export function hasCaptionInsteadOfTitle(platform: Platform): boolean {
  return platform === 'instagram' || platform === 'x' || platform === 'linkedin';
}
