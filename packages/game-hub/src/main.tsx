import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Assuming App.tsx will be created next
import './index.css'; // Assuming a basic CSS file will be created

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
