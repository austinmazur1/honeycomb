import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { Platform } from '@/lib/database.types';

/** Display order for platform lists, e.g. the home filter. */
export const PLATFORMS: Platform[] = ['instagram', 'x', 'youtube', 'linkedin', 'other'];

export const PLATFORM_HOSTS: { platform: Platform; hosts: string[] }[] = [
  { platform: 'instagram', hosts: ['instagram.com'] },
  { platform: 'x', hosts: ['x.com', 'twitter.com'] },
  { platform: 'youtube', hosts: ['youtube.com', 'youtu.be'] },
  { platform: 'linkedin', hosts: ['linkedin.com'] },
];

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  x: 'X',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  other: 'Other',
};

export const PLATFORM_ICONS: Record<Platform, ComponentProps<typeof Ionicons>['name']> = {
  instagram: 'logo-instagram',
  x: 'logo-x',
  youtube: 'logo-youtube',
  linkedin: 'logo-linkedin',
  other: 'link',
};

/**
 * Platforms whose link metadata "title" is really the post caption (long, emoji/hashtag-heavy).
 * For these we keep the caption as the description and leave the title for the user to write.
 */
export const CAPTION_AS_TITLE_PLATFORMS: ReadonlySet<Platform> = new Set(['instagram', 'x', 'linkedin']);
