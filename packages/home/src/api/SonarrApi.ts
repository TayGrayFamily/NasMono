export async function testSonarrApi(): Promise<boolean> {
  return fetch('http://tower:9005/api/', {
    headers: {
      'X-Api-Key': import.meta.env.VITE_SONARR_API_KEY || '',
    },
  })
    .then((response) => {
      return response.ok;
    })
    .catch((_) => {
      return false;
    });
}
