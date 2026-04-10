const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://ujfpepmszqrptmcauqaa.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZnBlcG1zenFycHRtY2F1cWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQxOTksImV4cCI6MjA4ODcyMDE5OX0.PCjM3YMwFF7ez_RsGMzfPEpm0nUqwqtwltMG1ER6HX4'); 

async function test() {
  const { data, error } = await supabase.from('videos').insert({
    title: 'New Video', visibility_status: 'draft', level: 'Beginner',
    video_url: '', thumbnail_url: ''
  });
  console.log('Error:', error);
  console.log('Data:', data);
}

test();
