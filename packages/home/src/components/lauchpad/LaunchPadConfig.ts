export type LaunchPadItemConfig = {
  displayName: string;
  iconUrl: string;
  port: number;
  params?: string;
};

export const launchPadConfig: LaunchPadItemConfig[] = [
  {
    displayName: 'Jellyfin',
    // Use the logo from public/static — Vite serves files in `public` at the project root
    iconUrl: '/static/jellyfin_logo.svg',
    port: 8096,
  },
  {
    displayName: 'Immich',
    iconUrl: '/static/immich_logo.svg',
    port: 2283,
  },
  {
    displayName: 'G&T Frame',
    iconUrl: '/static/immich_kiosk_logo.svg',
    port: 3000,
    params:
      '?duration=5&person=ad0b8aab-d39c-4acd-8e72-20abb697bda7&person=ba441761-42fa-41eb-af8e-128defd9614a&require_all_people=true&transition=fade&show_person_name=true&show_image_location=true&show_progress_bar=true',
  },
];
