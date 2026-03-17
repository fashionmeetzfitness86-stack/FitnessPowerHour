import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujfpepmszqrptmcauqaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZnBlcG1zenFycHRtY2F1cWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQxOTksImV4cCI6MjA4ODcyMDE5OX0.PCjM3YMwFF7ez_RsGMzfPEpm0nUqwqtwltMG1ER6HX4';

// Intercept Supabase auth redirect before HashRouter loads
const hash = window.location.hash;

// Case 1: Successful confirmation — tokens in hash
let pendingTokens: { access_token: string; refresh_token: string } | null = null;
if (hash && hash.includes('access_token=') && hash.includes('refresh_token=')) {
  const params = new URLSearchParams(hash.substring(1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    pendingTokens = { access_token, refresh_token };
    window.location.hash = '';
  }
}

// Case 2: Failed confirmation — error in hash (expired link, etc.)
let pendingError: string | null = null;
if (hash && hash.includes('error=') && hash.includes('error_description=')) {
  const params = new URLSearchParams(hash.substring(1));
  pendingError = decodeURIComponent(params.get('error_description') || 'Confirmation failed');
  window.location.hash = '#/membership?mode=login';
}

// Export the error so the app can show it
export const authRedirectError = pendingError;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false,
  }
});

// Set session from intercepted tokens
if (pendingTokens) {
  supabase.auth.setSession(pendingTokens).then(({ error }) => {
    if (error) {
      console.error('Failed to set session:', error);
      window.location.hash = '#/membership?mode=login';
    } else {
      window.location.hash = '#/profile';
    }
  });
}
