import { CloseButton, Drawer, Portal } from '@chakra-ui/react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useState, type JSX } from 'react';
import { LuLayoutGrid, LuMenu, LuServer } from 'react-icons/lu';
import { Icon } from '@chakra-ui/react';
import './NavDrawer.css';

const NAV_ITEMS = [
  { to: '/', label: 'Launch Pad', icon: LuLayoutGrid },
  { to: '/system', label: 'System', icon: LuServer },
] as const;

export function NavDrawer(): JSX.Element {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)} placement="start">
      <Drawer.Trigger asChild>
        <button className="nav-menu-trigger" type="button" aria-label="Open navigation menu">
          <Icon as={LuMenu} boxSize={5} />
        </button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content className="nav-drawer-content">
            <Drawer.Header className="nav-drawer-header">
              <Drawer.Title>Menu</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body className="nav-drawer-body">
              <nav aria-label="Main navigation">
                <ul className="nav-drawer-list">
                  {NAV_ITEMS.map(({ to, label, icon }) => {
                    const active = pathname === to || (to !== '/' && pathname.startsWith(to));
                    return (
                      <li key={to}>
                        <Link
                          to={to}
                          className={`nav-drawer-link${active ? ' nav-drawer-link--active' : ''}`}
                          onClick={() => setOpen(false)}
                        >
                          <Icon as={icon} boxSize={5} />
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
