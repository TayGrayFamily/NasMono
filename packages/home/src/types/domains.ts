export type DomainRoute = {
  hostname: string;
  port: number;
};

export type DomainsConfig = {
  upstreamHost: string;
  routes: DomainRoute[];
};

export type DomainsSaveResponse = {
  ok: true;
  caddyRestarted: boolean;
};
