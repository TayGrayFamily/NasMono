/** When true, POST /api/admin/docker/* mutations are allowed (production Unraid). */
export function isAdminActionsEnabled(): boolean {
  const raw = process.env.ADMIN_ACTIONS_ENABLED?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

/** Optional regex for batch "Update NasMono stack" — container names only. */
export function getStackUpdateContainerMatch(): RegExp | null {
  const raw = process.env.STACK_UPDATE_CONTAINER_MATCH?.trim();
  if (!raw) return null;
  try {
    return new RegExp(raw, 'i');
  } catch {
    return null;
  }
}

export function getComposeManagerStackUrl(): string | null {
  const raw = process.env.COMPOSE_MANAGER_STACK_URL?.trim();
  return raw || null;
}
