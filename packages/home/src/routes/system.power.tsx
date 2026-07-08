import { PowerPage } from '@/components/system/PowerPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/system/power')({
  component: PowerPage,
});
