/** Compact display of a Docker image reference (tag or digest suffix). */
export function formatImageVersion(image: string): string {
  const at = image.indexOf('@');
  if (at > 0) {
    const base = image.slice(0, at);
    const colon = base.lastIndexOf(':');
    return colon > 0 ? base.slice(colon + 1) : base;
  }
  const colon = image.lastIndexOf(':');
  if (colon > 0 && colon < image.length - 1) {
    return image.slice(colon + 1);
  }
  return image;
}
