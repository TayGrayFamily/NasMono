import { getLaunchHost } from '../constants/ServerConst';

export async function testSonarrApi(): Promise<boolean> {
  const host = getLaunchHost();
  return fetch(`http://${host}:9005/api/`, {
    headers: {
      'X-Api-Key': import.meta.env.VITE_SONARR_API_KEY || '',
    },
  })
    .then((response) => response.ok)
    .catch(() => false);
}
