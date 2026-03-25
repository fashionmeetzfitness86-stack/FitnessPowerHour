import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './supabase';

async function boot() {
  try {
    // Handle email confirmation redirect
    // With PKCE flow, Supabase redirects with ?code=xxx in the query string
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const errorParam = hashParams.get('error') || url.searchParams.get('error');

    if (code) {
      // PKCE flow: exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Code exchange error:', error);
        window.history.replaceState(null, '', '/#/membership?mode=login');
      } else {
        window.history.replaceState(null, '', '/#/profile');
      }
    } else if (accessToken) {
      // Legacy implicit flow: tokens in hash
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (error) {
          console.error('Session error:', error);
          window.history.replaceState(null, '', '/#/membership?mode=login');
        } else {
          window.history.replaceState(null, '', '/#/profile');
        }
      }
    } else if (errorParam) {
      // Auth error redirect
      console.error('Auth redirect error:', errorParam);
      window.history.replaceState(null, '', '/#/membership?mode=login');
    }
  } catch (e) {
    console.error('Boot auth error:', e);
    window.history.replaceState(null, '', '/#/membership?mode=login');
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

boot();
