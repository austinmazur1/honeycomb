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

/** Platforms with a confirmed working, no-auth inline embed path. Everything else deep-links out. */
export function isEmbeddable(platform: Platform): boolean {
  return platform === 'youtube' || platform === 'x';
}
