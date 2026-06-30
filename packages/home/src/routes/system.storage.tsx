import { StoragePage } from '@/components/system/StoragePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/system/storage')({
  component: StoragePage,
});
