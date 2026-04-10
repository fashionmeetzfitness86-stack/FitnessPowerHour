const { createClient } = require('@supabase/supabase-js'); 
require('dotenv').config(); 
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); 
(async()=>{ 
  const {data, error} = await supabase.from('orders').select('*').limit(1); 
  console.log('Orders:', JSON.stringify({data, error}, null, 2)); 
})();
