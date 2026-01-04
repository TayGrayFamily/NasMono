import { serverIp } from '../constants/ServerConst';

export async function testQbittorrentApi(): Promise<boolean> {
  return login().then((token) => !!token);
}

export async function login(): Promise<boolean | null> {
  const body = new URLSearchParams({
    username: import.meta.env.VITE_QBIT_USERNAME || 'admin',
    password: import.meta.env.VITE_QBIT_PASSWORD || 'adminadmin',
  });

  return fetch(`http://${serverIp}:9006/api/v2/auth/login`, {
    method: 'POST',
    headers: {
      // 2. Content-Type MUST be this for qBittorrent API
      'Content-Type': 'application/x-www-form-urlencoded',

      // 3. Referer MUST match the IP target exactly, not localhost
      Referer: `http://${serverIp}:9006`,
    },
    body: body,
  })
    .then((response) => {
      return response.ok;
    })
    .catch((error) => {
      console.error('Error logging in:', error);
      return null;
    });
}
