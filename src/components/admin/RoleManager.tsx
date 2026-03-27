import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, ShieldAlert, ShieldCheck, User, 
  Search, Filter, ChevronRight, Lock, 
  Unlock, MoreVertical, AlertTriangle, Key
} from 'lucide-react';

interface RoleManagerProps {
  users: any[];
  onUpdateRole: (userId: string, role: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  currentUser: any;
}

export const RoleManager = ({ users, onUpdateRole, showToast, currentUser }: RoleManagerProps) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const roles = [
    { id: 'super_admin', label: 'Super Admin', icon: ShieldAlert, color: 'brand-coral', desc: 'Full platform control & encryption access.' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'brand-teal', desc: 'Standard administrative operations.' },
    { id: 'athlete', label: 'Athlete', icon: Unlock, color: 'brand-teal', desc: 'Content creation & program management.' },
    { id: 'user', label: 'User', icon: User, color: 'white', desc: 'Standard member access.' }
  ];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                          u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 fade-in">
      {/* 1. ROLES DEFINITION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map(r => (
          <div key={r.id} className="card-gradient p-8 border border-white/5 space-y-4 hover:border-brand-teal/30 transition-all group">
            <div className={`p-3.5 rounded-2xl bg-${r.color}/10 w-fit text-${r.color} border border-${r.color}/20 group-hover:scale-110 transition-transform`}>
              <r.icon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">{r.label}</h3>
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold mt-1 leading-relaxed">{r.desc}</p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-tighter">{users.filter(u => u.role === r.id).length} Nodes</span>
              <Key size={14} className="text-white/10" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Search credentials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-brand-teal/50 transition-all text-xs uppercase tracking-widest font-black"
          />
        </div>
        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
          {['all', 'super_admin', 'admin', 'athlete', 'user'].map(f => (
            <button
               key={f}
               onClick={() => setRoleFilter(f)}
               className={`px-6 py-3 rounded-xl text-[9px] uppercase tracking-[0.2em] font-black transition-all ${
                 roleFilter === f ? 'bg-brand-teal text-black shadow-lg font-black' : 'text-white/40 hover:text-white'
               }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PERMISSIONS TABLE */}
      <div className="card-gradient border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] font-black text-white/20">Ident Name</th>
              <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] font-black text-white/20">Access Role</th>
              <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] font-black text-white/20">Clearance Status</th>
              <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] font-black text-white/20 text-right">Security Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black uppercase">
                      {u.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{u.full_name}</p>
                      <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <span className={`inline-block px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                     u.role === 'super_admin' ? 'bg-brand-coral/10 text-brand-coral' : 
                     u.role === 'admin' ? 'bg-brand-teal/10 text-brand-teal' : 
                     'bg-white/5 text-white/40'
                   }`}>
                     {u.role?.replace('_', ' ')}
                   </span>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'suspended' ? 'bg-brand-coral' : 'bg-emerald-500'} animate-pulse`} />
                     <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">{u.status || 'Verified'}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                  {u.id !== currentUser.id && (
                    <select
                      value={u.role}
                      onChange={(e) => onUpdateRole(u.id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[9px] uppercase tracking-widest font-black outline-none focus:border-brand-teal/50 hover:border-white/20 transition-all cursor-pointer shadow-lg hover:shadow-glow-teal-subtle"
                    >
                      <option value="user">USER</option>
                      <option value="athlete">ATHLETE</option>
                      <option value="admin">ADMIN</option>
                      <option value="super_admin">SUPER ADMIN</option>
                    </select>
                  )}
                  {u.id === currentUser.id && (
                    <span className="text-[8px] uppercase tracking-widest text-brand-teal font-black italic">Active Authority</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. SECURITY WARNING */}
      <div className="p-8 bg-brand-coral/5 border border-brand-coral/20 rounded-3xl flex items-center gap-6">
         <div className="p-4 bg-brand-coral/10 rounded-2xl text-brand-coral border border-brand-coral/20 border-glow-brand-coral-subtle rotate-12 group-hover:rotate-0 transition-transform duration-700">
           <ShieldAlert size={32} />
         </div>
         <div>
           <h4 className="text-lg font-black uppercase tracking-tighter text-brand-coral">Security Protocol Activation</h4>
           <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold max-w-2xl mt-1 leading-relaxed">
             Any escalation to <span className="text-brand-coral font-black italic italic-glow-brand-coral">Super Admin</span> level grants unconditional platform access. This action is logged in the immutable audit trail and requires immediate verification of candidate identity.
           </p>
         </div>
      </div>
    </div>
  );
};
