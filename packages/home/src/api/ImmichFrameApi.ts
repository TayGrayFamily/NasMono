import { getLaunchHost } from '../constants/ServerConst';

export async function testImmichFrameApi(): Promise<boolean> {
  const host = getLaunchHost();
  return fetch(`http://${host}:9003/health`)
    .then((response) => response.ok)
    .catch(() => false);
}
