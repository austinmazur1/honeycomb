import type { Platform } from '@/lib/database.types';
import { CAPTION_AS_TITLE_PLATFORMS, PLATFORM_HOSTS } from '@/lib/platform.constants';

export function inferPlatform(url: string): Platform {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const match = PLATFORM_HOSTS.find(({ hosts }) => hosts.some((host) => hostname === host));
    return match?.platform ?? 'other';
  } catch {
    return 'other';
  }
}

/** See `CAPTION_AS_TITLE_PLATFORMS`. */
export function hasCaptionInsteadOfTitle(platform: Platform): boolean {
  return CAPTION_AS_TITLE_PLATFORMS.has(platform);
}
