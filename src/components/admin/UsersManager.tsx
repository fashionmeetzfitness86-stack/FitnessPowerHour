import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Download, Edit2, 
  Eye, Ban, UserPlus, Filter 
} from 'lucide-react';
import { UserProfile, Package } from '../../types';

interface UsersManagerProps {
  users: UserProfile[];
  packages: Package[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  roleFilter: string;
  setRoleFilter: (r: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onEdit: (user: UserProfile) => void;
}

export const UsersManager = ({ 
  users, packages, searchQuery, setSearchQuery, 
  roleFilter, setRoleFilter, statusFilter, setStatusFilter, onEdit 
}: UsersManagerProps) => {
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">User <span className="text-brand-teal">Management</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Manage roles, permissions, and account status.</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-brand-teal transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 lg:flex-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none focus:border-brand-teal transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="user">User</option>
              <option value="athlete">Athlete</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 lg:flex-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] uppercase tracking-widest font-bold outline-none focus:border-brand-teal transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="card-gradient rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Member Information</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Role & Access</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Tier Plan</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Status</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal font-bold shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                        {u.profile_image ? (
                          <img src={u.profile_image} alt={u.full_name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          (u.full_name || 'U')[0]
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight uppercase group-hover:text-brand-teal transition-colors">{u.full_name}</p>
                        <p className="text-[10px] text-white/40 font-mono mt-1 lowercase">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-lg font-bold border ${
                      u.role === 'super_admin' ? 'bg-brand-coral/10 text-brand-coral border-brand-coral/20' :
                      u.role === 'admin' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' :
                      u.role === 'athlete' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      'bg-white/5 text-white/40 border-white/10'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-tight text-white/80">
                        {u.tier || 'Basic'} Tier
                      </p>
                      <p className="text-[8px] text-white/20 uppercase tracking-widest">Auto-Renewing</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        u.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                        u.status === 'suspended' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                        'bg-brand-coral shadow-[0_0_8px_rgba(251,113,133,0.5)]'
                      }`} />
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${
                        u.status === 'active' ? 'text-emerald-500' :
                        u.status === 'suspended' ? 'text-amber-500' :
                        'text-brand-coral'
                      }`}>
                        {u.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(u)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-brand-teal hover:text-black transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/20 transition-all">
                        <Eye size={14} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-white/5 hover:bg-brand-coral hover:text-black transition-all">
                        <Ban size={14} />
                      </button>
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
