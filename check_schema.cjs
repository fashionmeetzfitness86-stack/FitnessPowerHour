const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ujfpepmszqrptmcauqaa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZnBlcG1zenFycHRtY2F1cWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQxOTksImV4cCI6MjA4ODcyMDE5OX0.PCjM3YMwFF7ez_RsGMzfPEpm0nUqwqtwltMG1ER6HX4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'videos' });
  if (error) {
    console.log('RPC Failed. Trying an insert without mostly anything to see which NOT NULL fails.');
    const res = await supabase.from('videos').insert({ title: 'T', video_url: 'http', thumbnail_url: 'http', visibility_status: 'draft', level: 'Beginner' });
    console.log('Insert Error:', res.error);
  } else {
    console.log(data);
  }
}

checkSchema();
