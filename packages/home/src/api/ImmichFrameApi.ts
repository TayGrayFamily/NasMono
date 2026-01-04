export async function testImmichFrameApi(): Promise<boolean> {
  return fetch('http://tower:9003/health')
    .then((response) => {
      return response.ok;
    })
    .catch((_) => {
      return false;
    });
}
