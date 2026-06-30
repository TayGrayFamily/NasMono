export function apiFetch(
  url: string,
  options: RequestInit = {},
  socketId?: string,
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (socketId) {
    headers.set('X-Socket-Id', socketId);
  }
  return fetch(url, { ...options, headers });
}
