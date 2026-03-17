import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujfpepmszqrptmcauqaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZnBlcG1zenFycHRtY2F1cWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQxOTksImV4cCI6MjA4ODcyMDE5OX0.PCjM3YMwFF7ez_RsGMzfPEpm0nUqwqtwltMG1ER6HX4';

// Intercept Supabase auth tokens from email confirmation redirect
// Supabase appends #access_token=...&refresh_token=... which conflicts with HashRouter
let pendingTokens: { access_token: string; refresh_token: string } | null = null;
const hash = window.location.hash;
if (hash && hash.includes('access_token=') && hash.includes('refresh_token=')) {
  const params = new URLSearchParams(hash.substring(1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    pendingTokens = { access_token, refresh_token };
    // Clear the hash so HashRouter doesn't try to route to "access_token=..."
    window.location.hash = '';
  }
}

// Create client with detectSessionInUrl disabled (we handle it manually above)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false,
  }
});

// Set the session from the intercepted tokens, then redirect to profile
if (pendingTokens) {
  supabase.auth.setSession(pendingTokens).then(({ error }) => {
    if (error) {
      console.error('Failed to set session from confirmation:', error);
      window.location.hash = '#/membership?mode=login';
    } else {
      window.location.hash = '#/profile';
    }
  });
}
