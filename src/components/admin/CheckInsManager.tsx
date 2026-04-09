import React, { useState, useEffect } from 'react';
import { Activity, Clock, Search, Calendar as CalendarIcon, Zap } from 'lucide-react';
import { supabase } from '../../supabase';

interface CheckInRecord {
  id: string;
  user_id: string;
  session_date: string;
  session_time: string;
  created_at: string;
  users: {
    full_name: string;
    email: string;
    city: string | null;
  };
}

export const CheckInsManager = () => {
  const [logs, setLogs] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCheckIns();
  }, []);

  const fetchCheckIns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendar_sessions')
        .select('*, users:profiles!calendar_sessions_user_id_fkey(full_name, email, city)')
        .eq('source_type', 'check_in')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      if (data) setLogs(data);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.users?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    log.users?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 fade-in h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Check-In <span className="text-brand-teal">Log</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">Audit daily athlete workout check-ins</p>
        </div>
        
        <div className="relative w-full md:w-64">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
           <input 
             type="text"
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Search athletes..." 
             className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs focus:border-brand-teal transition-all outline-none font-mono"
           />
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden flex-grow flex flex-col">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                 <thead>
                     <tr className="bg-white/5 border-b border-white/10">
                         <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Athlete</th>
                         <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Action</th>
                         <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Location</th>
                         <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Timestamp</th>
                     </tr>
                 </thead>
                 <tbody>
                     {loading ? (
                         <tr><td colSpan={4} className="py-12 text-center text-white/40 uppercase tracking-widest font-black text-xs">Loading logs...</td></tr>
                     ) : filteredLogs.length === 0 ? (
                         <tr><td colSpan={4} className="py-12 text-center text-white/40 uppercase tracking-widest font-black text-xs">No recent check-ins.</td></tr>
                     ) : filteredLogs.map(log => (
                         <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                             <td className="py-4 px-6">
                                 <p className="font-black uppercase tracking-tight">{log.users?.full_name || 'Ghost Athlete'}</p>
                                 <p className="text-[10px] text-white/40 font-mono mt-1">{log.users?.email}</p>
                             </td>
                             <td className="py-4 px-6">
                                 <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                    <Zap size={10} /> Daily Protocol Logged
                                 </span>
                             </td>
                             <td className="py-4 px-6">
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{log.users?.city || 'Unknown'}</p>
                             </td>
                             <td className="py-4 px-6 text-right">
                                 <div className="flex flex-col items-end gap-1">
                                    <span className="flex items-center gap-1.5 text-xs font-black tracking-tight text-white/80">
                                        <CalendarIcon size={12} className="text-brand-teal" /> {log.session_date}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
                                        <Clock size={10} /> {log.session_time || new Date(log.created_at).toLocaleTimeString()}
                                    </span>
                                 </div>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
      </div>
    </div>
  );
};
