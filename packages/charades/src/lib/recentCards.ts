const RECENT_KEY = 'charades-recent-cards';
const MAX_RECENT = 200;

function hasSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

export function loadRecentCardIds(): string[] {
  if (!hasSessionStorage()) return [];
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export function rememberCardId(cardId: string): void {
  if (!hasSessionStorage()) return;
  const recent = loadRecentCardIds().filter((id) => id !== cardId);
  recent.unshift(cardId);
  sessionStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function preferUnseenCards<T extends { id: string }>(
  matches: T[],
  recentIds: readonly string[],
): T[] {
  if (matches.length <= 1 || recentIds.length === 0) return matches;
  const recent = new Set(recentIds);
  const unseen = matches.filter((card) => !recent.has(card.id));
  return unseen.length > 0 ? unseen : matches;
}
