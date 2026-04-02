import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './supabase';

/**
 * Boot function – handles pre-render Supabase auth token exchange.
 *
 * When the user clicks a confirmation link, Supabase redirects to our site with
 * either a `?code=xxx` (PKCE) or hash tokens. Because we use a HashRouter (#/...),
 * the actual routing path lives after the # character.
 *
 * The strategy:
 *  1. If a `code` param is found in the top-level search params, redirect into the
 *     HashRouter's /auth/callback route so the React component can handle it properly.
 *  2. If tokens are in the hash BUT they're not a HashRouter path, convert them to
 *     the appropriate hash route.
 *  3. Otherwise, boot normally and let the React app handle routing.
 */
async function boot() {
  try {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const errorParam = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    // Check hash for legacy implicit flow tokens (access_token in hash fragment)
    const hashContent = window.location.hash;
    const hashParams = new URLSearchParams(hashContent.replace(/^#\/?/, ''));
    const accessToken = hashParams.get('access_token');

    if (code) {
      // PKCE flow: Supabase sent ?code=xxx
      // Redirect into HashRouter so AuthCallback component handles the exchange
      window.history.replaceState(null, '', `${url.pathname}#/auth/callback?code=${code}`);
    } else if (errorParam && !hashContent.startsWith('#/')) {
      // Auth error from Supabase (not already in hash router)
      const errQuery = `error=${encodeURIComponent(errorParam)}${errorDescription ? `&error_description=${encodeURIComponent(errorDescription)}` : ''}`;
      window.history.replaceState(null, '', `${url.pathname}#/auth/callback?${errQuery}`);
    } else if (accessToken && !hashContent.startsWith('#/')) {
      // Legacy implicit flow: tokens in hash but not in HashRouter format
      // Exchange session then redirect to login with confirmed flag
      const refreshToken = hashParams.get('refresh_token');
      if (refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (error) {
          console.error('Session error:', error);
          window.history.replaceState(null, '', `${url.pathname}#/membership?mode=login`);
        } else {
          await supabase.auth.signOut();
          window.history.replaceState(null, '', `${url.pathname}#/membership?confirmed=true`);
        }
      }
    }
    // If hash already starts with #/ it's a normal HashRouter path – leave it alone
  } catch (e) {
    console.error('Boot auth error:', e);
    window.history.replaceState(null, '', `${window.location.pathname}#/membership?mode=login`);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

boot();
