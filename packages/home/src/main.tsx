import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import ReactDOM from 'react-dom/client';
import { App } from './components/shell/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChakraProvider value={defaultSystem}>
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <App />
    </ThemeProvider>
  </ChakraProvider>,
);
