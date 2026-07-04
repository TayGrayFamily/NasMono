declare global {
  interface Window {
    __NASMONO_ENV__?: {
      VITE_GIPHY_API_KEY?: string;
    };
  }
}

/** Vite build-time value, with optional runtime override from `/env-config.js` (Docker). */
export function getViteEnv(name: 'VITE_GIPHY_API_KEY'): string | undefined {
  const runtime =
    typeof window !== 'undefined' ? window.__NASMONO_ENV__?.[name] : undefined;
  const baked = import.meta.env[name];
  return normalizeEnv(runtime) ?? normalizeEnv(baked);
}

function normalizeEnv(value: string | undefined): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
