import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://ujfpepmszqrptmcauqaa.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZnBlcG1zenFycHRtY2F1cWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQxOTksImV4cCI6MjA4ODcyMDE5OX0.PCjM3YMwFF7ez_RsGMzfPEpm0nUqwqtwltMG1ER6HX4'); 
const test = async () => { 
  try { 
    const a = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('membership_status', 'active'); 
    if (a.error) console.log('ERROR:', a.error); 
  } catch (err) { 
    console.log('THROWN:', err); 
  } 
}; test();
