import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Search, Shield, ShieldCheck,
  CreditCard, Ban, Trash2, X, Edit2,
  Mail, Phone, Crown, UserCheck, AlertTriangle,
  CheckCircle, XCircle, Zap, Clock, Flame, Dumbbell, Target, HeartPulse, Activity
} from 'lucide-react';
import { UserProfile } from '../../types';
import { supabase } from '../../supabase';

interface UsersManagerProps {
  users: UserProfile[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onUpdateUser: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  packages?: any;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

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
    } catch (err) {
      if (showToast) showToast('Failed to update user', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleSuspend = async (u: UserProfile) => {
    const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
    await handleUpdate(u.id, { status: nextStatus });
    if (showToast) showToast('User ' + (nextStatus === 'suspended' ? 'suspended' : 'reactivated'), 'success');
  };

  const handleDelete = async (u: UserProfile) => {
    try {
      await onUpdateUser(u.id, { status: 'deleted' });
      setDeletingUser(null);
      if (showToast) showToast('User removed from platform', 'success');
    } catch (err) {
      if (showToast) showToast('Delete failed', 'error');
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
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            data-testid="search-users"
            type="text"
            placeholder="Search name or email..."
            className="w-full sm:w-56 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs focus:border-brand-teal outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
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
                      <div className="w-9 h-9 bg-brand-teal/10 border border-brand-teal/20 rounded-full flex items-center justify-center text-xs font-black text-brand-teal overflow-hidden">
                        {u.profile_image
                          ? <img src={u.profile_image} className="w-full h-full object-cover" alt="" />
                          : (u.full_name || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black">{u.full_name || 'No Name'}</p>
                        <p className="text-[10px] text-white/40 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      data-testid={`role-update-${u.id}`}
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
                      data-testid={`tier-update-${u.id}`}
                      value={u.tier || 'Free'}
                      disabled={isSaving}
                      onChange={e => {
                        const updates: Partial<UserProfile> = {
                          tier: e.target.value,
                          membership_status: e.target.value === 'Basic' ? 'active' : 'inactive'
                        };
                        handleUpdate(u.id, updates);
                      }}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:border-brand-teal cursor-pointer"
                    >
                      <option value="Free">Free</option>
                      <option value="Basic">Basic (Active)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-black uppercase ${
                      isSuspended
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        data-testid={`view-user-${u.id}`}
                        onClick={() => { 
                          setViewingUser(u); 
                          setActiveTab('overview'); 
                          setIsEditing(false);
                          setEditForm({ full_name: u.full_name, phone: u.phone, city: u.city, country: u.country, short_bio: u.short_bio });
                        }}
                        title="View profile"
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                      >
                        <User size={13} />
                      </button>
                      <button
                        data-testid={`suspend-user-${u.id}`}
                        onClick={() => handleSuspend(u)}
                        title={isSuspended ? 'Reactivate' : 'Suspend'}
                        className={`p-2 rounded-lg transition-all hover:text-black ${isSuspended ? 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400' : 'bg-amber-500/10 hover:bg-amber-500 text-amber-400'}`}
                      >
                        <Ban size={13} />
                      </button>
                      <button
                        data-testid={`delete-user-${u.id}`}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto pt-20"
            onClick={() => setViewingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#050505] border border-brand-teal/20 rounded-[2.5rem] p-8 w-full max-w-4xl shadow-2xl space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-[-20%] right-[-10%] w-[30rem] h-[30rem] bg-brand-teal/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[20rem] h-[20rem] bg-brand-coral/5 blur-[100px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between relative z-10 pb-4 border-b border-white/5">
                <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <Shield size={24} className="text-brand-teal" />
                  Intel <span className="text-brand-coral">Profile</span>
                </h3>
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <button 
                      data-testid="save-user-btn"
                      onClick={async () => {
                        await handleUpdate(viewingUser.id, editForm);
                        setViewingUser({ ...viewingUser, ...editForm });
                        setIsEditing(false);
                        if (showToast) showToast('Profile updated!', 'success');
                      }}
                      disabled={savingId === viewingUser.id}
                      className="px-4 py-2 bg-brand-teal text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
                    >
                      {savingId === viewingUser.id ? 'Saving...' : 'Save Changes'}
                    </button>
                  ) : (
                    <button 
                      data-testid="edit-user-btn"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors flex items-center gap-2"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                  <button onClick={() => setViewingUser(null)} className="p-2 bg-white/5 hover:bg-white/20 rounded-full text-white/40 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Hero Row */}
              <div className="flex items-start gap-8 relative z-10 bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                <div className="w-32 h-32 bg-brand-teal/5 border border-brand-teal/20 rounded-2xl flex items-center justify-center text-5xl font-black text-brand-teal shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-brand-teal/10 animate-pulse pointer-events-none" />
                  {viewingUser.profile_image
                    ? <img src={viewingUser.profile_image} alt="Avatar" className="w-full h-full object-cover" />
                    : (viewingUser.full_name || viewingUser.email || 'U')[0].toUpperCase()}
                  {viewingUser.country && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[8px] uppercase tracking-widest font-black text-white border border-white/10">
                      {viewingUser.country}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.full_name || ''} 
                      onChange={e => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Full Name"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-brand-teal"
                    />
                  ) : (
                    <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight truncate text-white">
                      {viewingUser.full_name || 'Anonymous User'}
                    </h2>
                  )}
                  <div className="flex items-center gap-3 mt-1 mb-4 flex-wrap">
                    <p className="text-xs text-white/60 font-mono flex items-center gap-1.5">
                      <Mail size={12} className="text-brand-teal" /> {viewingUser.email}
                    </p>
                    {isEditing ? (
                      <input 
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone Number"
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-teal"
                      />
                    ) : (
                      viewingUser.phone && (
                        <p className="text-xs text-white/60 font-mono flex items-center gap-1.5 border-l border-white/10 pl-3">
                          <Phone size={12} className="text-brand-teal" /> {viewingUser.phone}
                        </p>
                      )
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      viewingUser.status === 'active'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                      {viewingUser.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {viewingUser.status || 'active'}
                    </span>
                    {(isEditing || viewingUser.age || viewingUser.city || viewingUser.country) && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/60">
                        {isEditing ? (
                          <div className="flex items-center divide-x divide-white/10">
                            <input type="text" placeholder="City" value={editForm.city || ''} onChange={e => setEditForm(prev => ({ ...prev, city: e.target.value }))} className="bg-transparent px-3 py-1.5 outline-none max-w-[80px]" />
                            <input type="text" placeholder="Country" value={editForm.country || ''} onChange={e => setEditForm(prev => ({ ...prev, country: e.target.value }))} className="bg-transparent px-3 py-1.5 outline-none max-w-[80px]" />
                          </div>
                        ) : (
                          <span className="px-3 py-1.5">
                            {viewingUser.age ? `${viewingUser.age} Y/O` : 'AGE N/A'}
                            {viewingUser.city ? ` / ${viewingUser.city}` : ''}
                            {viewingUser.country ? `, ${viewingUser.country}` : ''}
                          </span>
                        )}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-brand-coral/10 border-brand-coral/20 text-brand-coral">
                      <Flame size={10} /> {viewingUser.streak_count ?? 0} Day Streak
                    </span>
                  </div>
                  {(isEditing || viewingUser.short_bio) && (
                    <div className="mt-4 p-4 bg-black/40 border border-white/5 rounded-xl">
                      <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-2">Bio / Goal</p>
                      {isEditing ? (
                        <textarea 
                          rows={3}
                          value={editForm.short_bio || ''}
                          onChange={e => setEditForm(prev => ({ ...prev, short_bio: e.target.value }))}
                          placeholder="User bio..."
                          className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-xs outline-none focus:border-brand-teal resize-none"
                        />
                      ) : (
                        <p className="text-xs text-white/70 italic leading-relaxed">"{viewingUser.short_bio}"</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 relative z-10 gap-6 px-2">
                {(['overview', 'metrics'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-brand-teal' : 'text-white/30 hover:text-white/60'}`}
                  >
                    {tab === 'overview' ? 'Account Base' : 'Athletic Intel'}
                    {activeTab === tab && (
                      <motion.div layoutId="activetab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal rounded-t-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="relative z-10">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Platform Role', value: viewingUser.role ?? 'user', icon: Crown },
                      { label: 'Access Tier', value: viewingUser.tier ?? 'Free', icon: Zap },
                      { label: 'Membership', value: viewingUser.membership_status ?? 'Not set', icon: CreditCard },
                      { label: 'Joined', value: viewingUser.signup_date ? new Date(viewingUser.signup_date).toLocaleDateString() : 'Unknown', icon: Clock },
                      { label: 'Stripe Sub ID', value: viewingUser.stripe_subscription_id ?? 'N/A', icon: CreditCard },
                      { label: 'Last Check-In', value: viewingUser.last_checkin || 'Never', icon: Activity },
                    ].map(item => (
                      <div key={item.label} className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                        <p className="text-[8px] uppercase tracking-widest text-white/40 font-bold mb-3 flex items-center gap-1.5">
                          <item.icon size={10} className="text-white/30" /> {item.label}
                        </p>
                        <p className="text-sm font-black text-white truncate" title={item.value}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'metrics' && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
                      <p className="text-[9px] uppercase tracking-widest text-brand-teal font-black mb-4 flex items-center gap-2">
                        <Target size={12} /> Physicals
                      </p>
                      <div className="space-y-3 border-l-2 border-white/5 pl-3">
                        <div><span className="text-[9px] uppercase text-white/40 font-bold block">Height</span><span className="text-xs font-black">{viewingUser.height || '—'}</span></div>
                        <div><span className="text-[9px] uppercase text-white/40 font-bold block">Weight</span><span className="text-xs font-black">{viewingUser.weight || '—'}</span></div>
                      </div>
                    </div>
                    <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
                      <p className="text-[9px] uppercase tracking-widest text-brand-teal font-black mb-4 flex items-center gap-2">
                        <Dumbbell size={12} /> Training Model
                      </p>
                      <div className="space-y-3 border-l-2 border-white/5 pl-3">
                        <div><span className="text-[9px] uppercase text-white/40 font-bold block">Level</span><span className="text-xs font-black text-brand-coral uppercase tracking-widest">{viewingUser.fitness_level || '—'}</span></div>
                        <div><span className="text-[9px] uppercase text-white/40 font-bold block">Style</span><span className="text-xs font-black">{viewingUser.workout_style || '—'}</span></div>
                      </div>
                    </div>
                    <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.05] col-span-2 lg:col-span-1">
                      <p className="text-[9px] uppercase tracking-widest text-brand-teal font-black mb-4 flex items-center gap-2">
                        <HeartPulse size={12} /> Limitations & Goals
                      </p>
                      <div className="space-y-3 border-l-2 border-white/5 pl-3">
                        <div><span className="text-[9px] uppercase text-white/40 font-bold block">Injuries / Limits</span><span className="text-xs font-black text-red-400">{viewingUser.limitations_or_injuries || 'None Disclosed'}</span></div>
                        <div><span className="text-[9px] uppercase text-white/40 font-bold block">Core Goal</span><span className="text-xs font-black">{viewingUser.training_goals || '—'}</span></div>
                      </div>
                    </div>
                    <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.05] col-span-2 md:col-span-3">
                      <p className="text-[9px] uppercase tracking-widest text-brand-teal font-black mb-4 flex items-center gap-2">
                        <Clock size={12} /> Schedule Preferences
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-[9px] uppercase text-white/40 font-bold block">Time</span>
                          <span className="text-xs font-black uppercase tracking-widest">{viewingUser.preferred_workout_time || '—'}</span>
                        </div>
                        <div className="col-span-3">
                          <span className="text-[9px] uppercase text-white/40 font-bold block mb-1">Days Focus</span>
                          <div className="flex flex-wrap gap-1">
                            {viewingUser.preferred_workout_days?.length
                              ? viewingUser.preferred_workout_days.map(d => (
                                  <span key={d} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[8px] uppercase tracking-widest font-black">{d}</span>
                                ))
                              : <span className="text-[10px] font-black uppercase tracking-widest text-white/40">—</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-white/5 relative z-10">
                <button
                  onClick={() => { handleSuspend(viewingUser); setViewingUser(null); }}
                  className="flex-1 py-4 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-500 text-amber-500 hover:text-black font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all"
                >
                  {viewingUser.status === 'suspended' ? 'Reactivate User' : 'Suspend Account'}
                </button>
                <button
                  onClick={() => { setDeletingUser(viewingUser); setViewingUser(null); }}
                  className="flex-1 py-4 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all"
                >
                  Delete Profile Forever
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
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#0a0a0a] border border-red-500/30 rounded-[2.5rem] p-10 w-full max-w-md text-center space-y-8"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <AlertTriangle size={36} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Terminate Profile?</h3>
                <p className="text-white/50 text-sm mt-3 font-mono border border-white/5 bg-white/5 py-2 px-4 rounded-xl inline-block">{deletingUser.email}</p>
                <p className="text-red-400/80 text-[10px] uppercase font-bold tracking-widest mt-4 block">This action permanently deletes all history.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeletingUser(null)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={() => handleDelete(deletingUser)} className="flex-1 py-4 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-600 transition-all">Execute</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
