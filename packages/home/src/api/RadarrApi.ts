export async function testRadarrApi(): Promise<boolean> {
  return fetch('http://tower:9004/api/', {
    headers: {
      'X-Api-Key': '0502ae2e63574f5ba94c286fa2e83744',
    },
  })
    .then((response) => {
      return response.ok;
    })
    .catch((_) => {
      return false;
    });
}
