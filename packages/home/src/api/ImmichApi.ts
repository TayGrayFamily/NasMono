import { getServerVersion, init } from '@immich/sdk';

init({ baseUrl: 'http://tower:9001/api', apiKey: import.meta.env.VITE_IMMICH_KEY });

export async function testImmichApi(): Promise<boolean> {
  console.log('Testing Immich API...');
  // The correct stable endpoint for version info
  return getServerVersion({})
    .then((version) => {
      console.log('Server Version:', version);
      return true;
    })
    .catch((error) => {
      // If you still get a 404 here, your baseUrl is still not reaching the API
      console.error('Error fetching version:', error);
      return false;
    });
}
