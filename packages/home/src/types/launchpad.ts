import type { ContainerRow } from './dockerContainer';

export type LaunchPadApp = {
  id: string;
  displayName: string;
  url: string;
  iconUrl: string;
  state: ContainerRow['state'] | 'unknown';
  statusText?: string;
  containerName?: string;
  hostPort?: number;
};

export type LaunchPadResponse = {
  apps: LaunchPadApp[];
  otherServices: ContainerRow[];
};
