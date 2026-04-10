import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://ujfpepmszqrptmcauqaa.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZnBlcG1zenFycHRtY2F1cWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQxOTksImV4cCI6MjA4ODcyMDE5OX0.PCjM3YMwFF7ez_RsGMzfPEpm0nUqwqtwltMG1ER6HX4'); 
const test = async () => { 
  try { 
    const todayISO = new Date().toISOString();
    const [activeMembersRes, pendingOrdersRes, pendingRequestsRes, ordersRes, logsRes] = await Promise.all([ 
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('membership_status', 'active'), 
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'), 
      supabase.from('service_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'), 
      supabase.from('orders').select('total_amount').in('status', ['paid', 'completed']).gte('created_at', todayISO), 
      supabase.from('activity_logs').select('user_id').gte('created_at', todayISO) 
    ]); 
    const revenueToday = ordersRes.data?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0; 
    const activeUsersToday = new Set(logsRes.data?.map((l) => l.user_id)).size; 
    console.log({ revenueToday, activeUsersToday }); 
  } catch (err) { 
    console.log('THROWN:', err.stack); 
  } 
}; test();
