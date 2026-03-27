import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App.tsx';
import './index.css';

// Ensure Buffer is available globally for Solana libraries
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Exnus Hub: Root element not found');
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
