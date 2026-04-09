import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Activity, Clock, Search, Calendar as CalendarIcon,
  Zap, User, Star, X, ChevronRight, Filter
} from 'lucide-react';
import { supabase } from '../../supabase';

interface CheckInRecord {
  id: string;
  user_id: string;
  session_date: string;
  session_time: string;
  created_at: string;
  rating?: number;
  notes?: string;
  source?: string;
  users: {
    full_name: string;
    email: string;
    city: string | null;
    streak_count?: number;
    profile_image?: string;
  };
}

export const CheckInsManager = () => {
  const [logs, setLogs]         = useState<CheckInRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter]   = useState('');
  const [viewingUser, setViewingUser] = useState<CheckInRecord | null>(null);

  useEffect(() => { fetchCheckIns(); }, []);

  const fetchCheckIns = async () => {
    try {
      setLoading(true);
      // Pull from both calendar_sessions and workout_logs
      const [sessionRes, logRes] = await Promise.all([
        supabase
          .from('calendar_sessions')
          .select('*, users:profiles!calendar_sessions_user_id_fkey(full_name, email, city, streak_count, profile_image)')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('workout_logs')
          .select('*, users:profiles!workout_logs_user_id_fkey(full_name, email, city, streak_count, profile_image)')
          .order('logged_at', { ascending: false })
          .limit(200),
      ]);
      const sessions = (sessionRes.data || []).map((r: any) => ({ ...r, source: r.source_type || 'session' }));
      const wLogs    = (logRes.data || []).map((r: any) => ({
        ...r,
        session_date: r.logged_at?.split('T')[0],
        session_time: new Date(r.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        created_at:   r.logged_at,
        source: r.source || 'workout_log'
      }));
      setLogs([...sessions, ...wLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error('Error fetching check-ins:', err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueYears = useMemo(() => {
    const years = new Set(logs.map(l => new Date(l.created_at).getFullYear().toString()));
    return Array.from(years).sort().reverse();
  }, [logs]);

  // Group by user + date to count workouts per user per day
  const userStats = useMemo(() => {
    const map: Record<string, { count: number; lastSeen: string; name: string; email: string }> = {};
    logs.forEach(l => {
      const uid = l.user_id;
      if (!map[uid]) map[uid] = { count: 0, lastSeen: l.created_at, name: l.users?.full_name || '—', email: l.users?.email || '' };
      map[uid].count++;
    });
    return map;
  }, [logs]);

  const filteredLogs = useMemo(() => logs.filter(log => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      log.users?.full_name?.toLowerCase().includes(q) ||
      log.users?.email?.toLowerCase().includes(q);
    const dt = new Date(log.created_at);
    const matchMonth = !monthFilter || String(dt.getMonth() + 1).padStart(2, '0') === monthFilter;
    const matchYear  = !yearFilter  || String(dt.getFullYear()) === yearFilter;
    return matchSearch && matchMonth && matchYear;
  }), [logs, search, monthFilter, yearFilter]);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">
            Check-In <span className="text-brand-teal">Activity</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">
            {filteredLogs.length} sessions · {Object.keys(userStats).length} unique users
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search athletes..."
              className="pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs outline-none focus:border-brand-teal w-44"
            />
          </div>
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-teal">
            <option value="">All Months</option>
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) =>
              <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
            )}
          </select>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-teal">
            <option value="">All Years</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {(search || monthFilter || yearFilter) && (
            <button onClick={() => { setSearch(''); setMonthFilter(''); setYearFilter(''); }}
              className="p-2 text-white/30 hover:text-white transition-all"><X size={14} /></button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: filteredLogs.length, color: 'text-brand-teal' },
          { label: 'Active Users', value: Object.keys(userStats).length, color: 'text-brand-coral' },
          { label: 'Today', value: filteredLogs.filter(l => l.session_date === new Date().toISOString().split('T')[0]).length, color: 'text-amber-400' },
          { label: 'With Rating', value: filteredLogs.filter(l => l.rating && l.rating > 0).length, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] uppercase tracking-widest text-white/30 font-black mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Log Table */}
      <div className="bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Athlete</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Source</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Rating</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40">Location</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Time</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-white/40 uppercase tracking-widest font-black text-xs">Loading...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-white/40 uppercase tracking-widest font-black text-xs">No sessions match filters</td></tr>
              ) : filteredLogs.map(log => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-black uppercase tracking-tight text-sm">{log.users?.full_name || 'Ghost Athlete'}</p>
                    <p className="text-[10px] text-white/30 font-mono">{log.users?.email}</p>
                    {(log.users as any)?.streak_count > 0 && (
                      <span className="text-[9px] text-amber-400 font-black flex items-center gap-1 mt-0.5">
                        🔥 {(log.users as any).streak_count}d streak
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      log.source === 'my_program' ? 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal' :
                      log.source === 'check_in'  ? 'bg-brand-coral/10 border-brand-coral/20 text-brand-coral' :
                      'bg-white/5 border-white/10 text-white/40'
                    }`}>
                      <Zap size={9} /> {log.source || 'session'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {log.rating ? (
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={11} className={n <= log.rating! ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                        ))}
                      </div>
                    ) : <span className="text-white/20 text-xs">—</span>}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-[10px] text-white/50">{log.users?.city || '—'}</p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="text-xs font-black text-white/70">{log.session_date}</p>
                    <p className="text-[10px] text-white/30 font-mono">{log.session_time || new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => setViewingUser(log)}
                      className="p-1.5 bg-white/5 hover:bg-brand-teal/20 rounded-lg text-white/30 hover:text-brand-teal transition-all">
                      <User size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Popup */}
      {viewingUser && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setViewingUser(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tighter text-brand-teal">Activity Detail</h3>
              <button onClick={() => setViewingUser(null)} className="p-2 text-white/30 hover:text-white"><X size={18} /></button>
            </div>
            <div>
              <p className="text-2xl font-black uppercase">{viewingUser.users?.full_name || '—'}</p>
              <p className="text-white/40 text-sm font-mono">{viewingUser.users?.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Sessions', value: userStats[viewingUser.user_id]?.count || 1 },
                { label: 'Streak', value: `${(viewingUser.users as any)?.streak_count || 0} days` },
                { label: 'Last Session', value: viewingUser.session_date || '—' },
                { label: 'Rating', value: viewingUser.rating ? `${viewingUser.rating}/5 ⭐` : 'Not rated' },
                { label: 'Source', value: viewingUser.source || 'session' },
                { label: 'City', value: viewingUser.users?.city || '—' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-black">{item.label}</p>
                  <p className="text-sm font-black mt-1 capitalize">{String(item.value)}</p>
                </div>
              ))}
            </div>
            {viewingUser.notes && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-black mb-1">Notes</p>
                <p className="text-sm text-white/60">{viewingUser.notes}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
