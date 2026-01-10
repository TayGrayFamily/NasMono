import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import ReactDOM from 'react-dom/client';
import { system } from './components/shell/Theme';

import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

// 1. Create the router instance
const router = createRouter({ routeTree });

// 2. Register the router instance for project-wide type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChakraProvider value={system}>
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <RouterProvider router={router} />
    </ThemeProvider>
  </ChakraProvider>,
);
