import { serverIp } from '@/constants/ServerConst';

export async function testImmichFrameApi(): Promise<boolean> {
  return fetch(`http://${serverIp}:9003/health`)
    .then((response) => {
      return response.ok;
    })
    .catch((_) => {
      return false;
    });
}
