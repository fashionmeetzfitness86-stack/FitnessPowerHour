import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujfpepmszqrptmcauqaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZnBlcG1zenFycHRtY2F1cWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQxOTksImV4cCI6MjA4ODcyMDE5OX0.PCjM3YMwFF7ez_RsGMzfPEpm0nUqwqtwltMG1ER6HX4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Detect session tokens from URL (required for email confirmation flow)
    detectSessionInUrl: true,
    // Implicit flow: tokens arrive in the URL hash — works across all browsers
    // and mobile in-app WebViews unlike PKCE which requires same-browser session.
    flowType: 'implicit',
    // Persist session in localStorage so users stay logged in
    persistSession: true,
    // Auto-refresh tokens before they expire
    autoRefreshToken: true
  }
});
