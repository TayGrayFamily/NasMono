import { getLaunchHost } from '../constants/ServerConst';
import { getServerVersion, init } from '@immich/sdk';

export async function testImmichApi(): Promise<boolean> {
  const host = getLaunchHost();
  const apiKey = import.meta.env.VITE_IMMICH_KEY;
  if (!apiKey) return false;

  init({ baseUrl: `http://${host}:9001/api`, apiKey });

  try {
    await getServerVersion({});
    return true;
  } catch (error) {
    console.error('Immich API check failed:', error);
    return false;
  }
}
