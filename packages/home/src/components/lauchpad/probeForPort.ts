import { testImmichApi } from '@/api/ImmichApi';
import { testJellyfinApi } from '@/api/JellyfinApi';
import { testImmichFrameApi } from '@/api/ImmichFrameApi';
import { testRadarrApi } from '@/api/RadarrApi';
import { testSonarrApi } from '@/api/SonarrApi';
import { testQbittorrentApi } from '@/api/QbittorrentApi';

export function getProbeForHostPort(hostPort: number): (() => Promise<boolean>) | null {
  switch (hostPort) {
    case 9001:
      return testImmichApi;
    case 9002:
      return testJellyfinApi;
    case 9003:
      return testImmichFrameApi;
    case 9004:
      return testRadarrApi;
    case 9005:
      return testSonarrApi;
    case 9006:
      return testQbittorrentApi;
    default:
      return null;
  }
}
