import { getLaunchHost } from '../constants/ServerConst';

export async function testJellyfinApi(): Promise<boolean> {
  const host = getLaunchHost();
  return fetch(`http://${host}:9002/System/info/public`)
    .then((response) => response.ok)
    .catch(() => false);
}
