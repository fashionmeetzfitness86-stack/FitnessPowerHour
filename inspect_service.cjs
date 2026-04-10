const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ujfpepmszqrptmcauqaa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZnBlcG1zenFycHRtY2F1cWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQxOTksImV4cCI6MjA4ODcyMDE5OX0.PCjM3YMwFF7ez_RsGMzfPEpm0nUqwqtwltMG1ER6HX4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'service_requests' });
  if (error) {
     console.log('RPC missing. Inserting test record to trigger constraint directly...');
     const res = await supabase.from('service_requests').insert({
         user_id: 'bad7bc1c-c46b-4426-b80b-961aae971e21', 
         service_type: 'Stretching', 
         service_subtype: 'FlexMob305',
         requested_date: '2026-04-10',
         requested_time: '09:00:00',
         status: 'pending'
     });
     console.log(res);
  } else {
     console.log(data);
  }
}

inspectSchema();
