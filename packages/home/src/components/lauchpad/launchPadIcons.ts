const RULES: { pattern: RegExp; iconUrl: string }[] = [
  { pattern: /immich/i, iconUrl: '/static/immich_logo.svg' },
  { pattern: /jellyfin/i, iconUrl: '/static/jellyfin_logo.svg' },
  { pattern: /radarr/i, iconUrl: '/static/radarr_logo.svg' },
  { pattern: /sonarr/i, iconUrl: '/static/sonarr_logo.svg' },
  { pattern: /qbittorrent|qbit/i, iconUrl: '/static/qbittorrent_logo.svg' },
  { pattern: /frame|kiosk/i, iconUrl: '/static/immich_kiosk_logo.svg' },
];

const FALLBACK = '/static/logo.svg';

export function iconUrlForImage(image: string): string {
  for (const { pattern, iconUrl } of RULES) {
    if (pattern.test(image)) return iconUrl;
  }
  return FALLBACK;
}
