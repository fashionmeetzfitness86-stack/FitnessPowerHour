import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujfpepmszqrptmcauqaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZnBlcG1zenFycHRtY2F1cWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQxOTksImV4cCI6MjA4ODcyMDE5OX0.PCjM3YMwFF7ez_RsGMzfPEpm0nUqwqtwltMG1ER6HX4';

// Intercept Supabase auth redirect BEFORE React/HashRouter loads
// After email confirmation, Supabase redirects with #access_token=... or #error=...
let pendingError: string | null = null;

try {
  const rawHash = window.location.hash;

  if (rawHash && rawHash.includes('access_token=') && rawHash.includes('refresh_token=')) {
    // Successful confirmation — extract tokens and redirect immediately
    const params = new URLSearchParams(rawHash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken && refreshToken) {
      // Replace the hash with a loading route BEFORE React renders
      history.replaceState(null, '', window.location.pathname + '#/profile');
      // Store tokens for after client creation
      (window as any).__pendingAuthTokens = { access_token: accessToken, refresh_token: refreshToken };
    }
  } else if (rawHash && rawHash.includes('error=')) {
    // Failed confirmation — extract error and redirect to login
    const params = new URLSearchParams(rawHash.substring(1));
    pendingError = params.get('error_description')?.replace(/\+/g, ' ') || 'Email confirmation failed. Please try again.';
    history.replaceState(null, '', window.location.pathname + '#/membership?mode=login');
  }
} catch (e) {
  console.error('Auth redirect handling error:', e);
}

export const authRedirectError = pendingError;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false,
  }
});

// Set session from intercepted tokens (after client is created)
const pendingTokens = (window as any).__pendingAuthTokens;
if (pendingTokens) {
  delete (window as any).__pendingAuthTokens;
  supabase.auth.setSession(pendingTokens).then(({ error }) => {
    if (error) {
      console.error('Failed to set session:', error);
      window.location.hash = '#/membership?mode=login';
    }
    // If success, we're already on #/profile — onAuthStateChange will load user
  }).catch((err) => {
    console.error('Session error:', err);
    window.location.hash = '#/membership?mode=login';
  });
}
