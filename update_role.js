import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujfpepmszqrptmcauqaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZnBlcG1zenFycHRtY2F1cWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQxOTksImV4cCI6MjA4ODcyMDE5OX0.PCjM3YMwFF7ez_RsGMzfPEpm0nUqwqtwltMG1ER6HX4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data: user, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'Fashionmeetzfitness86@gmail.com')
    .single();
    
  if (fetchError) {
    console.error('Fetch error:', fetchError);
  } else {
    console.log('User found:', user);
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('email', 'Fashionmeetzfitness86@gmail.com')
      .select();
      
    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('Updated user:', updated);
    }
  }
}

main();
