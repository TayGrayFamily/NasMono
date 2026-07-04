import { unraidMutation } from './unraidGraphql.js';

export type UpdatedContainer = {
  id: string;
  names: string[];
  state: string;
  status: string;
};

type GqlUpdatedContainer = {
  id: string;
  names: string[];
  state: string;
  status: string;
};

function mapContainer(c: GqlUpdatedContainer): UpdatedContainer {
  return {
    id: c.id,
    names: c.names,
    state: c.state,
    status: c.status,
  };
}

const UPDATE_CONTAINER = `
mutation UpdateContainer($id: PrefixedID!) {
  docker {
    updateContainer(id: $id) {
      id
      names
      state
      status
    }
  }
}
`;

const UPDATE_CONTAINERS = `
mutation UpdateContainers($ids: [PrefixedID!]!) {
  docker {
    updateContainers(ids: $ids) {
      id
      names
      state
      status
    }
  }
}
`;

const UPDATE_ALL_CONTAINERS = `
mutation UpdateAllContainers {
  docker {
    updateAllContainers {
      id
      names
      state
      status
    }
  }
}
`;

const REFRESH_DOCKER_DIGESTS = `
mutation RefreshDockerDigests {
  refreshDockerDigests
}
`;

export async function refreshDockerDigests(): Promise<{ ok: boolean; warnings: string[] }> {
  const { data, warnings } = await unraidMutation<{ refreshDockerDigests: boolean }>(
    REFRESH_DOCKER_DIGESTS,
  );
  return { ok: data.refreshDockerDigests, warnings };
}

export async function updateContainer(id: string): Promise<{
  container: UpdatedContainer;
  warnings: string[];
}> {
  const { data, warnings } = await unraidMutation<{
    docker: { updateContainer: GqlUpdatedContainer };
  }>(UPDATE_CONTAINER, { id });
  return { container: mapContainer(data.docker.updateContainer), warnings };
}

export async function updateContainers(ids: string[]): Promise<{
  containers: UpdatedContainer[];
  warnings: string[];
}> {
  const { data, warnings } = await unraidMutation<{
    docker: { updateContainers: GqlUpdatedContainer[] };
  }>(UPDATE_CONTAINERS, { ids });
  return {
    containers: data.docker.updateContainers.map(mapContainer),
    warnings,
  };
}

export async function updateAllOutdatedContainers(): Promise<{
  containers: UpdatedContainer[];
  warnings: string[];
}> {
  const { data, warnings } = await unraidMutation<{
    docker: { updateAllContainers: GqlUpdatedContainer[] };
  }>(UPDATE_ALL_CONTAINERS);
  return {
    containers: data.docker.updateAllContainers.map(mapContainer),
    warnings,
  };
}
