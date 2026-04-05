import { getLaunchHost } from '../constants/ServerConst';

export async function testQbittorrentApi(): Promise<boolean> {
  return login().then((ok) => !!ok);
}

export async function login(): Promise<boolean | null> {
  const host = getLaunchHost();
  const body = new URLSearchParams({
    username: import.meta.env.VITE_QBIT_USERNAME || 'admin',
    password: import.meta.env.VITE_QBIT_PASSWORD || 'adminadmin',
  });

  return fetch(`http://${host}:9006/api/v2/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: `http://${host}:9006`,
    },
    body,
  })
    .then((response) => response.ok)
    .catch((error) => {
      console.error('qBittorrent login failed:', error);
      return null;
    });
}
