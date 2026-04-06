import Docker from 'dockerode';
import type { ContainerRow, DockerSource, PublicPortMapping } from './types.js';
import { mapDockerodeState } from './mapDockerState.js';
import { pickPrimaryPortWithDefaults, primaryIsLoopbackOnly } from './pickPrimaryPort.js';

function stripLeadingSlash(name: string): string {
  return name.startsWith('/') ? name.slice(1) : name;
}

export class DockerodeSource implements DockerSource {
  private readonly docker: Docker | null = null;

  constructor() {
    const socketPath = process.env.DOCKER_SOCKET_PATH;
    if (socketPath && socketPath !== 'null') {
      this.docker = new Docker({ socketPath });
    } else {
      console.warn('Docker socket path not configured. Docker integration disabled.');
    }
  }

  async listContainers(): Promise<ContainerRow[]> {
    if (!this.docker) return [];

    const list = await this.docker.listContainers({ all: true });
    return list.map((c) => {
      const publicPorts: PublicPortMapping[] = (c.Ports ?? [])
        .filter((p) => p.PublicPort != null && p.PublicPort > 0)
        .map((p) => ({
          hostPort: p.PublicPort!,
          containerPort: p.PrivatePort,
          protocol: p.Type,
          hostIp: p.IP && p.IP.length > 0 ? p.IP : null,
        }));

      const nameRaw = c.Names?.[0] ?? c.Id.slice(0, 12);
      const name = stripLeadingSlash(nameRaw);
      const primary = pickPrimaryPortWithDefaults(publicPorts, name, c.Image);

      return {
        id: c.Id,
        name,
        state: mapDockerodeState(c.State),
        statusText: c.Status ?? c.State,
        image: c.Image,
        publicPorts,
        primaryPort: primary,
        primaryPortLoopbackOnly: primaryIsLoopbackOnly(primary),
      };
    });
  }
}
