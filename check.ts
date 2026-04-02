import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujfpepmszqrptmcauqaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZnBlcG1zenFycHRtY2F1cWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQxOTksImV4cCI6MjA4ODcyMDE5OX0.PCjM3YMwFF7ez_RsGMzfPEpm0nUqwqtwltMG1ER6HX4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const email = 'Fashionmeetzfitness86@gmail.com';
  console.log('Checking user:', email);
  let { data: users, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', email);
    
  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log('User not found. Need to create user via Auth signup logic or insert profile directly if possible.');
  } else {
    console.log('User found:', users[0]);
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .ilike('email', email)
      .select();
      
    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('Updated user:', updated);
    }
  }
}

main();
