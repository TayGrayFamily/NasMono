export type GqlError = { message: string; path?: (string | number)[] };

type GqlBody<T> = {
  data?: T;
  errors?: GqlError[];
};

export type UnraidConfig = {
  graphqlUrl: string;
  apiKey: string;
};

export function getUnraidConfig(): UnraidConfig | null {
  const graphqlUrl = process.env.UNRAID_GRAPHQL_URL?.trim();
  const apiKey = process.env.UNRAID_API_KEY?.trim();
  if (!graphqlUrl || !apiKey) return null;
  return { graphqlUrl, apiKey };
}

export async function unraidQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data: T; warnings: string[] }> {
  const config = getUnraidConfig();
  if (!config) {
    throw new Error('Unraid GraphQL not configured (UNRAID_GRAPHQL_URL / UNRAID_API_KEY)');
  }

  const res = await fetch(config.graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Unraid GraphQL HTTP ${res.status}: ${await res.text()}`);
  }

  const body = (await res.json()) as GqlBody<T>;
  const warnings = (body.errors ?? []).map((e) => e.message);

  if (!body.data) {
    throw new Error(warnings.join('; ') || 'Unraid GraphQL returned no data');
  }

  return { data: body.data, warnings };
}

export async function unraidMutation<T>(
  mutation: string,
  variables?: Record<string, unknown>,
): Promise<{ data: T; warnings: string[] }> {
  return unraidQuery<T>(mutation, variables);
}
