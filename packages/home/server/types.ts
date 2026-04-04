export type ContainerDaemonState =
  | 'running'
  | 'paused'
  | 'exited'
  | 'created'
  | 'restarting'
  | 'removing'
  | 'dead'
  | 'unknown';

export type PublicPortMapping = {
  hostPort: number;
  containerPort: number;
  protocol: string;
  /** Docker binding IP; empty means all interfaces */
  hostIp: string | null;
};

/** Normalized row for the LaunchPad UI */
export type ContainerRow = {
  id: string;
  name: string;
  state: ContainerDaemonState;
  statusText: string;
  image: string;
  publicPorts: PublicPortMapping[];
  /** Preferred port for “open in browser” (same rule as pickPrimaryPort) */
  primaryPort: PublicPortMapping | null;
  /** True when the chosen primary port is only bound to loopback */
  primaryPortLoopbackOnly: boolean;
};

export type DockerSource = {
  listContainers(): Promise<ContainerRow[]>;
};
