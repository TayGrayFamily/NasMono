import { Button, Input } from '@chakra-ui/react';
import { type JSX } from 'react';
import { useDomainsConfig } from '@/hooks/useDomainsConfig';
import type { DomainRoute } from '@/types/domains';
import { DetailPageLayout } from './DetailPageLayout';
import './DomainsPage.css';
import './SystemPage.css';

function emptyRoute(): DomainRoute {
  return { hostname: '', port: 8080 };
}

export function DomainsPage(): JSX.Element {
  const { draft, setDraft, error, loading, saving, saveMessage, save } = useDomainsConfig();

  if (error && !draft) {
    return (
      <DetailPageLayout title="Domains">
        <p className="system-page-error">{error}</p>
      </DetailPageLayout>
    );
  }

  if (!draft || loading) {
    return (
      <DetailPageLayout title="Domains">
        <div className="system-page-loading">
          <div className="loading-spinner" />
        </div>
      </DetailPageLayout>
    );
  }

  const updateRoute = (index: number, patch: Partial<DomainRoute>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const routes = prev.routes.map((route, i) => (i === index ? { ...route, ...patch } : route));
      return { ...prev, routes };
    });
  };

  const removeRoute = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, routes: prev.routes.filter((_, i) => i !== index) };
    });
  };

  const addRoute = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, routes: [...prev.routes, emptyRoute()] };
    });
  };

  const handleSave = async () => {
    try {
      await save(draft);
    } catch {
      // error surfaced via hook state
    }
  };

  return (
    <DetailPageLayout title="Domains">
      <p className="domains-intro">
        Map friendly <code>*.tower</code> hostnames to host ports. The upstream LAN IP applies to
        every route; Caddy and Pi-hole DNS files are regenerated on save.
      </p>

      <section className="detail-section">
        <h2 className="detail-section-title">Upstream IP</h2>
        <label className="domains-field">
          <span className="domains-field-label">LAN address for all reverse proxies and DNS</span>
          <Input
            value={draft.upstreamHost}
            onChange={(e) => setDraft({ ...draft, upstreamHost: e.target.value })}
            placeholder="192.168.1.50"
            size="sm"
            fontFamily="mono"
          />
        </label>
      </section>

      <section className="detail-section">
        <div className="domains-section-header">
          <h2 className="detail-section-title">Routes</h2>
          <Button size="sm" variant="outline" onClick={addRoute}>
            Add route
          </Button>
        </div>

        <div className="domains-table-wrap">
          <table className="domains-table">
            <thead>
              <tr>
                <th>Hostname</th>
                <th>Port</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {draft.routes.map((route, index) => (
                <tr key={`${route.hostname}-${index}`}>
                  <td>
                    <Input
                      value={route.hostname}
                      onChange={(e) => updateRoute(index, { hostname: e.target.value })}
                      placeholder="home.tower"
                      size="sm"
                      fontFamily="mono"
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={route.port}
                      min={1}
                      max={65535}
                      onChange={(e) => updateRoute(index, { port: Number(e.target.value) || 0 })}
                      size="sm"
                      fontFamily="mono"
                      width="7rem"
                    />
                  </td>
                  <td className="domains-actions-cell">
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => removeRoute(index)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="domains-footer">
        <Button colorPalette="blue" onClick={() => void handleSave()} loading={saving}>
          Save
        </Button>
        {saveMessage ? <p className="domains-save-ok">{saveMessage}</p> : null}
        {error ? <p className="domains-save-error">{error}</p> : null}
      </div>
    </DetailPageLayout>
  );
}
