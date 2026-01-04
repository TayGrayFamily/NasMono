export async function testRadarrApi(): Promise<boolean> {
  return fetch('http://tower:9004/api/', {
    headers: {
      'X-Api-Key': import.meta.env.VITE_RADARR_API_KEY || '',
    },
  })
    .then((response) => {
      return response.ok;
    })
    .catch((_) => {
      return false;
    });
}
