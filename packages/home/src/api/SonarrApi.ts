export async function testSonarrApi(): Promise<boolean> {
  return fetch('http://tower:9005/api/', {
    headers: {
      'X-Api-Key': '7b18992949254a0a9a064e813004dcbe',
    },
  })
    .then((response) => {
      return response.ok;
    })
    .catch((_) => {
      return false;
    });
}
