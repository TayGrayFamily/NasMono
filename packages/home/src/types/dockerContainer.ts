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
  hostIp: string | null;
};

export type ContainerRow = {
  id: string;
  name: string;
  state: ContainerDaemonState;
  statusText: string;
  image: string;
  publicPorts: PublicPortMapping[];
  primaryPort: PublicPortMapping | null;
  primaryPortLoopbackOnly: boolean;
};
