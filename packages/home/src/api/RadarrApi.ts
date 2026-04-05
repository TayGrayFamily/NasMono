import { getLaunchHost } from '../constants/ServerConst';

export async function testRadarrApi(): Promise<boolean> {
  const host = getLaunchHost();
  return fetch(`http://${host}:9004/api/`, {
    headers: {
      'X-Api-Key': import.meta.env.VITE_RADARR_API_KEY || '',
    },
  })
    .then((response) => response.ok)
    .catch(() => false);
}
