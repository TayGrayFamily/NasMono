import { DockerPage } from '@/components/system/DockerPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/system/docker')({
  component: DockerPage,
});
