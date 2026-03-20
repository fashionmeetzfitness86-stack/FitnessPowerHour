import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './supabase';

async function boot() {
  try {
    const rawHash = window.location.hash;

    // Case 1: Email confirmation success — Supabase redirected with tokens
    if (rawHash && rawHash.includes('access_token=') && rawHash.includes('refresh_token=')) {
      const params = new URLSearchParams(rawHash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('Session error:', error);
          window.history.replaceState(null, '', '/#/membership?mode=login');
        } else {
          // Session set — go to profile
          window.history.replaceState(null, '', '/#/profile');
        }
      }
    }

    // Case 2: Email confirmation failed — Supabase redirected with error
    if (rawHash && rawHash.includes('error=') && !rawHash.includes('access_token=')) {
      window.history.replaceState(null, '', '/#/membership?mode=login');
    }
  } catch (e) {
    console.error('Boot auth error:', e);
    window.history.replaceState(null, '', '/#/membership?mode=login');
  }

  // Now render the app
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

boot();
