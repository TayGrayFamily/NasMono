import { LaunchPad } from '@/components/lauchpad/LaunchPad';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LaunchPadComponent,
});

function LaunchPadComponent() {
  return <LaunchPad />;
}
