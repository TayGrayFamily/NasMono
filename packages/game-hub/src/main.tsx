import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
// Removed SocketProvider import from here as App.tsx will now provide it.

const queryClient = new QueryClient();
// const backendUrl = 'http://localhost:3001'; // Keep this defined for App.tsx

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* SocketProvider is removed from here */}
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
