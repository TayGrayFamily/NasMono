export function isLoopbackHostIp(hostIp: string | null): boolean {
  if (hostIp === null || hostIp === '') return false;
  const ip = hostIp.trim();
  return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
}
