export async function testJellyfinApi(): Promise<boolean> {
  return fetch('http://tower:9002/System/info/public')
    .then((response) => {
      return response.ok;
    })
    .catch((_) => {
      return false;
    });
}
