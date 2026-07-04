import { Button, Dialog, Portal } from '@chakra-ui/react';
import { useState, type JSX, type ReactNode } from 'react';

type ConfirmDialogProps = {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  trigger: (open: () => void) => ReactNode;
};

export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  loading,
  onConfirm,
  trigger,
}: ConfirmDialogProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      {trigger(() => setOpen(true))}
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className="container-update-dialog">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>{children}</Dialog.Body>
            <Dialog.Footer className="container-update-dialog-footer">
              <Dialog.ActionTrigger asChild>
                <Button size="sm" variant="outline">
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button
                size="sm"
                colorPalette="teal"
                loading={loading}
                onClick={() => {
                  setOpen(false);
                  onConfirm();
                }}
              >
                {confirmLabel}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
