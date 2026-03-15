import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './supabase';

// Handle Supabase email confirmation redirect BEFORE React loads
// Supabase appends #access_token=...&refresh_token=... to the URL
// We need to catch this before HashRouter tries to interpret it
const rawHash = window.location.hash;
if (rawHash && rawHash.includes('access_token') && rawHash.includes('refresh_token')) {
  // Extract tokens from the hash
  const tokenString = rawHash.substring(1); // remove leading #
  const params = new URLSearchParams(tokenString);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (accessToken && refreshToken) {
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
      if (error) {
        console.error('Session error:', error);
        window.location.hash = '#/membership?mode=login';
      } else {
        // Successfully logged in — go to profile
        window.location.hash = '#/profile';
      }
      // Render app after session is set
      renderApp();
    });
  } else {
    renderApp();
  }
} else {
  renderApp();
}

function renderApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
