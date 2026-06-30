import { ResourcesPage } from '@/components/system/ResourcesPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/system/resources')({
  component: ResourcesPage,
});
