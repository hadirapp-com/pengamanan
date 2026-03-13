import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register Service Worker for PWA (not on localhost)
if ('serviceWorker' in navigator) {
  // Check if running on localhost
  const isLocalhost = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '';

  if (!isLocalhost) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('Service Worker registration failed: ', registrationError);
        });
    });
  } else {
    console.log('Service Worker registration skipped on localhost');
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
