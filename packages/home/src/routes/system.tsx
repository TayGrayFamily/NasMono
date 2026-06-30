import { SystemLayout } from '@/components/system/SystemLayout';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/system')({
  component: SystemLayout,
});
