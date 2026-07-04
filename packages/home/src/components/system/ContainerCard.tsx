import { Button, Dialog, Icon, IconButton, Menu, Portal } from '@chakra-ui/react';
import { useState, type JSX } from 'react';
import { LuEllipsisVertical } from 'react-icons/lu';
import { UNRAID_DASHBOARD_URL } from '@/constants/unraidLinks';
import type { AdminContainerSummary } from '@/types/admin';
import { attentionLabel, attentionSeverity } from './containerInsights';
import { formatImageVersion } from './dockerImage';
import { StatCard } from './StatCard';
import './ContainerCard.css';

type ContainerCardProps = {
  container: AdminContainerSummary;
  adminActionsEnabled: boolean;
  busyKey: string | null;
  onRefreshDigests: () => void;
  onUpdate: (container: AdminContainerSummary) => void;
};

function selfUpdateWarning(name: string): string | null {
  if (name === 'web_app') {
    return 'This restarts the NasMono dashboard. The page may reload and be unavailable for ~30 seconds.';
  }
  return null;
}

export function ContainerCard({
  container,
  adminActionsEnabled,
  busyKey,
  onRefreshDigests,
  onUpdate,
}: ContainerCardProps): JSX.Element {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const severity = attentionSeverity(container.attention);
  const isBusy = busyKey === `update-${container.id}`;
  const selfWarning = selfUpdateWarning(container.name);

  return (
    <>
      <StatCard
        title={container.name}
        value={attentionLabel(container.attention)}
        detail={
          <>
            <span className="container-card-status">{container.status}</span>
            <span className="container-card-image" title={container.image}>
              {container.image}
            </span>
            {container.updateAvailable ? (
              <span className="container-card-update-badge">Update available</span>
            ) : null}
          </>
        }
        severity={severity}
        className="container-card"
        footer={
          <div className="container-card-footer">
            <span className="container-card-tag" title={container.image}>
              {formatImageVersion(container.image)}
            </span>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton
                  aria-label={`Actions for ${container.name}`}
                  size="xs"
                  variant="ghost"
                  className="container-card-menu"
                  disabled={!adminActionsEnabled && false}
                >
                  <Icon as={LuEllipsisVertical} boxSize={4} />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content className="container-card-menu-content">
                    <Menu.Item
                      value="update"
                      disabled={!adminActionsEnabled}
                      onClick={() => setConfirmOpen(true)}
                    >
                      Update image…
                    </Menu.Item>
                    <Menu.Item
                      value="check"
                      disabled={!adminActionsEnabled}
                      onClick={() => onRefreshDigests()}
                    >
                      Check for updates
                    </Menu.Item>
                    <Menu.Item value="unraid" asChild>
                      <a href={UNRAID_DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
                        Open in Unraid
                      </a>
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </div>
        }
      />

      <Dialog.Root open={confirmOpen} onOpenChange={(e) => setConfirmOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content className="container-update-dialog">
              <Dialog.Header>
                <Dialog.Title>Update {container.name}?</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <p>
                  Pull the latest image and recreate <strong>{container.name}</strong>?
                </p>
                <p className="container-update-dialog-image">{container.image}</p>
                {selfWarning ? (
                  <p className="container-update-dialog-warning">{selfWarning}</p>
                ) : null}
              </Dialog.Body>
              <Dialog.Footer className="container-update-dialog-footer">
                <Dialog.ActionTrigger asChild>
                  <Button size="sm" variant="outline">
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  size="sm"
                  colorPalette="teal"
                  loading={isBusy}
                  onClick={() => {
                    setConfirmOpen(false);
                    onUpdate(container);
                  }}
                >
                  Update
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
