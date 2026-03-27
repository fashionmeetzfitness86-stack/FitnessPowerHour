import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, Clock, User, CheckCircle, XCircle, 
  ExternalLink, Filter, Search, MoreHorizontal,
  Mail, Phone, MapPin, Activity
} from 'lucide-react';
import { supabase } from '../../supabase';

interface ServiceManagerProps {
  bookings: any[];
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ServiceManager = ({ bookings, onUpdateStatus, showToast }: ServiceManagerProps) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const services = [
    { id: 'pt', name: 'Personal Training', icon: User, color: 'brand-teal' },
    { id: 'flex', name: 'Flex Mob 3 Miami', icon: Activity, color: 'brand-coral' }
  ];

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.user_name?.toLowerCase().includes(search.toLowerCase()) || 
                          b.service_type?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || b.service_type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 fade-in">
      {/* 1. HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-brand-teal/50 transition-all text-sm w-64 uppercase tracking-widest font-black"
            />
          </div>
          <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
            {['all', 'pt', 'flex'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-[9px] uppercase tracking-[0.2em] font-black transition-all ${
                  filter === f ? 'bg-brand-teal text-black shadow-lg' : 'text-white/40 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-3 px-8 py-3 bg-brand-teal text-black rounded-2xl text-[10px] uppercase tracking-[0.3em] font-black shadow-glow-teal hover:scale-105 transition-all">
          <Calendar size={16} /> Manage Calendar
        </button>
      </div>

      {/* 2. SERVICES OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(s => (
          <div key={s.id} className="card-gradient p-8 border border-white/5 flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl bg-${s.color}/10 flex items-center justify-center text-${s.color} border border-${s.color}/20 group-hover:scale-110 transition-transform`}>
                <s.icon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">{s.name}</h3>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold mt-1">Status: Operational</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black tracking-tighter">{bookings.filter(b => b.service_type === s.id).length}</p>
              <p className="text-[8px] uppercase tracking-widest text-white/40 font-black">Active Requests</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BOOKING TABLE */}
      <div className="card-gradient border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] font-black text-white/20">Candidate</th>
              <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] font-black text-white/20">Service Stream</th>
              <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] font-black text-white/20">Temporal Node</th>
              <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] font-black text-white/20 text-right">Operational Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredBookings.length > 0 ? filteredBookings.map((b) => (
              <tr key={b.id} className="hover:bg-brand-teal/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black uppercase">
                      {b.user_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{b.user_name}</p>
                      <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">{b.user_email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-block px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                    b.service_type === 'pt' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-coral/10 text-brand-coral'
                  }`}>
                    {b.service_type === 'pt' ? 'Personal Training' : 'Flex Mob Miami'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{b.date}</span>
                    <span className="text-[8px] font-bold text-white/20 uppercase mt-1 tracking-widest">{b.time_slot}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    <button 
                      onClick={() => onUpdateStatus(b.id, 'rejected')}
                      className="p-2.5 rounded-xl bg-brand-coral/10 text-brand-coral border border-brand-coral/20 hover:bg-brand-coral hover:text-black transition-all"
                    >
                      <XCircle size={16} />
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(b.id, 'approved')}
                      className="p-2.5 rounded-xl bg-brand-teal/10 text-brand-teal border border-brand-teal/20 hover:bg-brand-teal hover:text-black transition-all shadow-glow-teal"
                    >
                      <CheckCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">Waiting for signal transmissions...</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
