import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Search, Shield, ShieldCheck, ShieldAlert,
  CreditCard, Ban, Trash2, Edit2, X, Check,
  Mail, Phone, ChevronDown, Crown, UserCheck, AlertTriangle,
  ToggleLeft, ToggleRight, CheckCircle, XCircle, Zap, Clock, Flame
} from 'lucide-react';
import { UserProfile } from '../../types';
import { supabase } from '../../supabase';

interface UsersManagerProps {
  users: UserProfile[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onUpdateUser: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  packages?: any;
  roleFilter?: string;
  setRoleFilter?: any;
  statusFilter?: string;
  setStatusFilter?: any;
  onEdit?: any;
  currentUser?: any;
  showToast?: any;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  user:        { label: 'User',        color: 'text-white/60 bg-white/5 border-white/10',              icon: User },
  athlete:     { label: 'Athlete',     color: 'text-brand-teal bg-brand-teal/10 border-brand-teal/30', icon: UserCheck },
  admin:       { label: 'Admin',       color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',    icon: Shield },
  super_admin: { label: 'Super Admin', color: 'text-brand-coral bg-brand-coral/10 border-brand-coral/30', icon: ShieldCheck },
};

export const UsersManager = ({
  users,
  searchQuery,
  setSearchQuery,
  onUpdateUser,
  showToast
}: UsersManagerProps) => {
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && (!u.status || u.status === 'active')) ||
        (statusFilter === 'suspended' && u.status === 'suspended');
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleUpdate = async (userId: string, updates: Partial<UserProfile>) => {
    setSavingId(userId);
    try {
      await onUpdateUser(userId, updates);
    } finally {
      setSavingId(null);
    }
  };

  const handleSuspend = async (u: UserProfile) => {
    const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
    await handleUpdate(u.id, { status: nextStatus });
    if (showToast) showToast(`User ${nextStatus === 'suspended' ? 'suspended' : 'reactivated'}`, 'success');
  };

  const handleDelete = async (u: UserProfile) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(u.id).catch(() => ({ error: null })) as any;
      await supabase.from('profiles').delete().eq('id', u.id);
      setDeletingUser(null);
      if (showToast) showToast('User removed from platform', 'success');
      // Parent will re-fetch on next load; local removal via callback
      await onUpdateUser(u.id, { status: 'deleted' } as any);
    } catch (err) {
      if (showToast) showToast('Delete failed — remove from Supabase Auth manually', 'error');
    }
  };

  const roleLabels = ['all', 'user', 'athlete', 'admin', 'super_admin'];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">User <span className="text-brand-teal">Control</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">
            {filteredUsers.length} of {users.length} users
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search name or email..."
              className="w-full sm:w-56 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs focus:border-brand-teal outline-none"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Role filter */}
        <div className="flex bg-black/40 border border-white/10 p-1 rounded-xl gap-1">
          {roleLabels.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black rounded-lg transition-all ${roleFilter === r ? 'bg-brand-teal text-black' : 'text-white/40 hover:text-white'}`}
            >
              {r === 'all' ? 'All Roles' : ROLE_CONFIG[r]?.label || r}
            </button>
          ))}
        </div>
        {/* Status filter */}
        <div className="flex bg-black/40 border border-white/10 p-1 rounded-xl gap-1">
          {['all', 'active', 'suspended'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black rounded-lg transition-all ${statusFilter === s ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/20 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Member</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Role</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Membership</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map(u => {
              const role = u.role || 'user';
              const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG.user;
              const isSaving = savingId === u.id;
              const isSuspended = u.status === 'suspended';
              return (
                <tr key={u.id} className={`hover:bg-white/5 transition-colors ${isSuspended ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-teal/10 border border-brand-teal/20 rounded-full flex items-center justify-center text-xs font-black text-brand-teal">
                        {(u.full_name || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black">{u.full_name || 'No Name'}</p>
                        <p className="text-[10px] text-white/40 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={role}
                      disabled={isSaving}
                      onChange={e => handleUpdate(u.id, { role: e.target.value as any })}
                      className={`text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 border outline-none cursor-pointer ${roleConf.color}`}
                    >
                      <option value="user">User</option>
                      <option value="athlete">Athlete</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.tier || 'Free'}
                      disabled={isSaving}
                      onChange={e => handleUpdate(u.id, { tier: e.target.value, membership_status: e.target.value === 'Basic' ? 'active' : 'inactive' } as any)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:border-brand-teal cursor-pointer"
                    >
                      <option value="Free">Free</option>
                      <option value="Basic">Basic (Active)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-black uppercase ${
                      isSuspended ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingUser(u)}
                        title="View profile"
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                      >
                        <User size={13} />
                      </button>
                      <button
                        onClick={() => handleSuspend(u)}
                        title={isSuspended ? 'Reactivate' : 'Suspend'}
                        className={`p-2 rounded-lg transition-all ${isSuspended ? 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400' : 'bg-amber-500/10 hover:bg-amber-500 text-amber-400'} hover:text-black`}
                      >
                        <Ban size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingUser(u)}
                        title="Delete user"
                        className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-400 hover:text-white transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-white/40 text-sm">No users match your search.</div>
        )}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {viewingUser && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setViewingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#050505] border border-white/10 rounded-[2rem] p-6 lg:p-8 w-full max-w-lg shadow-[0_0_80px_rgba(45,212,191,0.05)] space-y-6 relative overflow-hidden"
            >
              {/* Background Glows */}
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-brand-teal/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-brand-coral/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10 pb-2 border-b border-white/5">
                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <Shield size={20} className="text-brand-teal" /> 
                  Intel <span className="text-brand-coral">Profile</span>
                </h3>
                <button onClick={() => setViewingUser(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"><X size={16} /></button>
              </div>

              {/* Header Box */}
              <div className="flex items-center gap-5 relative z-10 bg-white/[0.02] border border-white/5 p-5 rounded-3xl backdrop-blur-md">
                <div className="w-20 h-20 bg-brand-teal/5 border border-brand-teal/20 rounded-[1.2rem] flex items-center justify-center text-3xl font-black text-brand-teal shrink-0 shadow-inner overflow-hidden relative group">
                  <div className="absolute inset-0 bg-brand-teal/10 animate-pulse pointer-events-none" />
                  {viewingUser.profile_image ? (
                    <img src={viewingUser.profile_image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (viewingUser.full_name || viewingUser.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight truncate text-white">{viewingUser.full_name || 'Anonymous User'}</h2>
                  <p className="text-[10px] lg:text-[11px] text-white/40 font-mono mt-0.5 mb-3 truncate">{viewingUser.email}</p>
                  
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    viewingUser.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {viewingUser.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {viewingUser.status || 'active'}
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 relative z-10">
                {[
                  { label: 'Platform Role', value: viewingUser.role || 'user', icon: Crown },
                  { label: 'Access Tier', value: viewingUser.tier || 'Free', icon: Zap },
                  { label: 'Membership', value: (viewingUser as any).membership_status || '—', icon: CreditCard },
                  { label: 'Joined', value: viewingUser.signup_date ? new Date(viewingUser.signup_date).toLocaleDateString() : '—', icon: Clock },
                  { label: 'Streak', value: `${(viewingUser as any).streak_count || 0} days`, icon: Flame },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] flex flex-col justify-between hover:bg-white/[0.04] transition-colors ${idx === 4 ? 'col-span-2 md:col-span-1' : ''}`}>
                      <p className="text-[8px] uppercase tracking-widest text-white/40 font-bold mb-2 flex items-center gap-1.5">
                        <Icon size={10} className="text-white/30" /> {item.label}
                      </p>
                      <p className="text-sm font-black capitalize text-white truncate">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/5 relative z-10">
                <button
                  onClick={() => { handleSuspend(viewingUser); setViewingUser(null); }}
                  className="flex-1 py-3.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 font-black uppercase text-[9px] tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                >
                  {viewingUser.status === 'suspended' ? 'Reactivate User' : 'Suspend Account'}
                </button>
                <button
                  onClick={() => { setDeletingUser(viewingUser); setViewingUser(null); }}
                  className="flex-1 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-black uppercase text-[9px] tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                >
                  Delete Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deletingUser && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#0d0d0d] border border-red-500/30 rounded-3xl p-8 w-full max-w-md text-center space-y-6"
            >
              <AlertTriangle size={40} className="mx-auto text-red-500" />
              <div>
                <h3 className="text-xl font-black uppercase">Delete User?</h3>
                <p className="text-white/50 text-sm mt-2">{deletingUser.full_name} ({deletingUser.email})</p>
                <p className="text-white/30 text-xs mt-1">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeletingUser(null)} className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={() => handleDelete(deletingUser)} className="flex-1 py-3 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-600 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
