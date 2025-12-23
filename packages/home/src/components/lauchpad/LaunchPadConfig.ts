export type LaunchPadItemConfig = {
  displayName: string;
  iconUrl: string;
  launchUrl: string;
};

export const launchPadConfig: LaunchPadItemConfig[] = [
  {
    displayName: 'My Launchpad',
    // Use the logo from public/static — Vite serves files in `public` at the project root
    iconUrl: '/static/logo.svg',
    launchUrl: '/path/to/launch',
  },
];
