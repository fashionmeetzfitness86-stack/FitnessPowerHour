import React from 'react';
import { History, User, Activity, Clock, ShieldCheck, Database, Filter } from 'lucide-react';
import { ActivityLog } from '../../types';

interface LogManagerProps {
  logs: ActivityLog[];
}

export const LogManager = ({ logs }: LogManagerProps) => {
  return (
    <div className="space-y-12 fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Quantum <span className="text-brand-coral">Logs</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Audit trail of all administrative and system actions.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase tracking-widest font-black text-white/40">
            <Filter size={14} /> Protocol Filter
          </div>
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-[10px] uppercase tracking-widest font-black text-white/60 flex items-center gap-3">
             Refresh Stream
          </button>
        </div>
      </div>

      <div className="card-gradient rounded-[3rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Event Time</th>
                <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Origin Actor</th>
                <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Action Vector</th>
                <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Entity Class</th>
                <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4 text-white/60 group-hover:text-white transition-colors">
                      <Clock size={14} className="text-brand-coral/50" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold tracking-tight">{new Date(log.created_at).toLocaleTimeString()}</p>
                        <p className="text-[9px] uppercase tracking-widest text-white/20">{new Date(log.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:border-brand-teal/30 transition-all">
                        <User size={18} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold tracking-tight uppercase text-white/80 line-clamp-1 max-w-[150px]">{log.actor_id}</p>
                        <p className="text-[9px] uppercase tracking-widest text-white/20">Authorized ID</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-brand-black/40 border border-white/5 rounded-lg text-[9px] uppercase tracking-widest font-black text-white/80 group-hover:border-brand-coral/30 group-hover:text-brand-coral transition-colors">
                        {log.action.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40">{log.entity_type}</span>
                       <span className="text-[8px] font-mono text-white/10">[{log.entity_id?.slice(0, 8)}]</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[9px] uppercase tracking-widest font-bold">
                       <ShieldCheck size={12} /> SECURE
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <History size={40} className="mx-auto text-white/5 mb-6" />
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white/10">No quantum logs detected in the stream.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
