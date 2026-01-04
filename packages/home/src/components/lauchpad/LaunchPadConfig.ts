import { testJellyfinApi } from '../../api/JellyfinApi';
import { testImmichApi } from '../../api/ImmichApi';
import { testImmichFrameApi } from '../../api/ImmichFrameApi';
import { testRadarrApi } from '../../api/RadarrApi';
import { testSonarrApi } from '../../api/SonarrApi';
import { testQbittorrentApi } from '../../api/QbittorrentApi';

export type LaunchPadItemConfig = {
  displayName: string;
  iconUrl: string;
  port: number;
  path?: string;
  params?: string;
  testApi?: () => Promise<boolean>;
};

export const launchPadConfig: LaunchPadItemConfig[] = [
  {
    displayName: 'Immich',
    iconUrl: '/static/immich_logo.svg',
    port: 9001,
    path: '/',
    testApi: testImmichApi,
  },
  {
    displayName: 'Jellyfin',
    iconUrl: '/static/jellyfin_logo.svg',
    port: 9002,
    testApi: testJellyfinApi,
  },
  {
    displayName: 'G&T Frame',
    iconUrl: '/static/immich_kiosk_logo.svg',
    port: 9003,
    params:
      '?duration=5&person=ad0b8aab-d39c-4acd-8e72-20abb697bda7&person=ba441761-42fa-41eb-af8e-128defd9614a&require_all_people=true&transition=fade&show_person_name=true&show_image_location=true&show_progress_bar=true',
    testApi: testImmichFrameApi,
  },
  {
    displayName: 'Radarr',
    iconUrl: '/static/radarr_logo.svg',
    port: 9004,
    testApi: testRadarrApi,
  },
  {
    displayName: 'Sonarr',
    iconUrl: '/static/sonarr_logo.svg',
    port: 9005,
    testApi: testSonarrApi,
  },
  {
    displayName: 'qBittorrent',
    iconUrl: '/static/qbittorrent_logo.svg',
    port: 9006,
    testApi: testQbittorrentApi,
  },
];
