import { ControlPanel } from '@/components/system/ControlPanel';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/system/')({
  component: ControlPanel,
});
