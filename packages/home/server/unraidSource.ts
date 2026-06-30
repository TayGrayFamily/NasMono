import type { ContainerRow, DockerSource, PublicPortMapping } from './types.js';
import { mapUnraidState } from './mapDockerState.js';
import { pickPrimaryPortWithDefaults, primaryIsLoopbackOnly } from './pickPrimaryPort.js';
import { unraidQuery } from './unraidGraphql.js';

const CONTAINER_QUERY = `
query NasMonoContainers {
  docker {
    containers {
      id
      names
      image
      state
      status
      ports {
        ip
        privatePort
        publicPort
        type
      }
    }
  }
}
`;

type GqlPort = {
  ip: string | null;
  privatePort: number | null;
  publicPort: number | null;
  type: string;
};

type GqlContainer = {
  id: string;
  names: string[];
  image: string;
  state: string;
  status: string;
  ports: GqlPort[];
};

type GqlResponse = {
  docker: {
    containers: GqlContainer[];
  };
};

function stripLeadingSlash(name: string): string {
  return name.startsWith('/') ? name.slice(1) : name;
}

export class UnraidDockerSource implements DockerSource {
  async listContainers(): Promise<ContainerRow[]> {
    const { data } = await unraidQuery<GqlResponse>(CONTAINER_QUERY);
    const containers = data.docker?.containers ?? [];

    return containers.map((c) => {
      const publicPorts: PublicPortMapping[] = (c.ports ?? [])
        .filter((p) => p.publicPort != null && p.publicPort > 0)
        .map((p) => ({
          hostPort: p.publicPort!,
          containerPort: p.privatePort ?? 0,
          protocol: p.type === 'UDP' ? 'udp' : 'tcp',
          hostIp: p.ip && p.ip.length > 0 ? p.ip : null,
        }));

      const nameRaw = c.names?.[0] ?? c.id;
      const name = stripLeadingSlash(nameRaw);
      const primary = pickPrimaryPortWithDefaults(publicPorts, name, c.image);

      return {
        id: c.id,
        name,
        state: mapUnraidState(c.state),
        statusText: c.status,
        image: c.image,
        publicPorts,
        primaryPort: primary,
        primaryPortLoopbackOnly: primaryIsLoopbackOnly(primary),
      };
    });
  }
}
