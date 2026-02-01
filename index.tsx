import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from './bootstrap';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';

// Inicializar e limpar dados corrompidos ANTES de renderizar
initializeApp();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);