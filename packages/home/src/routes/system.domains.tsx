import { DomainsPage } from '@/components/system/DomainsPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/system/domains')({
  component: DomainsPage,
});
