export type ArrayDiskLike = {
  name: string;
  device: string | null;
  type: string;
  temp: number | null;
};

/** Human label for an Unraid array slot (parity, disk1, cache, flash, …). */
export function formatArraySlotLabel(slotName: string, slotType: string): string {
  const lower = slotName.toLowerCase();

  if (lower === 'parity') return 'Parity';
  if (lower === 'parity2') return 'Parity 2';

  const diskMatch = /^disk(\d+)$/i.exec(slotName);
  if (diskMatch) return `Disk ${diskMatch[1]}`;

  const cacheMatch = /^cache(\d+)$/i.exec(slotName);
  if (cacheMatch) return cacheMatch[1] === '1' ? 'Cache' : `Cache ${cacheMatch[1]}`;
  if (lower === 'cache') return 'Cache';

  if (lower === 'flash') return 'Boot (flash)';

  if (slotType === 'PARITY') return 'Parity';
  if (slotType === 'DATA' && diskMatch) return `Disk ${diskMatch[1]}`;

  return slotName.charAt(0).toUpperCase() + slotName.slice(1);
}

export function collectArraySlots(array: {
  parities: ArrayDiskLike[];
  disks: ArrayDiskLike[];
  caches: ArrayDiskLike[];
}): ArrayDiskLike[] {
  return [...array.parities, ...array.disks, ...array.caches];
}

export function arraySlotKind(slotName: string, slotType: string): 'parity' | 'data' | 'cache' {
  const lower = slotName.toLowerCase();
  if (lower.startsWith('parity') || slotType === 'PARITY') return 'parity';
  if (lower.startsWith('cache') || slotType === 'CACHE') return 'cache';
  return 'data';
}
