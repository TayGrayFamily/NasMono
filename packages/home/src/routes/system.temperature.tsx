import { TemperaturePage } from '@/components/system/TemperaturePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/system/temperature')({
  component: TemperaturePage,
});
