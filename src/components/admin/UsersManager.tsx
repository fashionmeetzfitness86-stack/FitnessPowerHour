import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Download, Edit2, 
  Eye, Ban, UserPlus, Filter, X,
  MapPin, Shield, Activity, PlayCircle, 
  ShoppingBag, MessageSquare, Briefcase,
  TrendingUp, Clock, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  onUpdateUser: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  currentUser: UserProfile;
}

export const UsersManager = ({ 
  users, packages, searchQuery, setSearchQuery, 
  roleFilter, setRoleFilter, statusFilter, setStatusFilter, onEdit,
  onUpdateUser, currentUser
}: UsersManagerProps) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [cityFilter, setCityFilter] = useState('All');

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      // Assume metadata might have city, or use placeholder
      const matchesCity = cityFilter === 'All' || (u as any).city === cityFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesCity;
    });
  }, [users, searchQuery, roleFilter, statusFilter, cityFilter]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(users.map(u => (u as any).city).filter(Boolean));
    return ['All', ...Array.from(cities)];
  }, [users]);

  return (
    <div className="space-y-8 fade-in relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Candidate <span className="text-brand-teal">Nexus</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/20 mt-1 font-bold">Synchronize clearance levels across the matrix.</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0 lg:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input
              type="text"
              placeholder="Search directory..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-xs outline-none focus:border-brand-teal uppercase tracking-widest font-black transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-[9px] uppercase tracking-widest font-black outline-none focus:border-brand-teal transition-all cursor-pointer min-w-[120px]"
            >
              <option value="All">Roles: All</option>
              <option value="user">User</option>
              <option value="athlete">Athlete</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <select 
              value={cityFilter} 
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-[9px] uppercase tracking-widest font-black outline-none focus:border-brand-teal transition-all cursor-pointer min-w-[120px]"
            >
               {uniqueCities.map(c => <option key={c} value={c}>City: {c}</option>)}
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-[9px] uppercase tracking-widest font-black outline-none focus:border-brand-teal transition-all cursor-pointer min-w-[120px]"
            >
              <option value="All">Status: All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-gradient rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">Ident Schema</th>
                <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">Access Layer</th>
                <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">Tier Protocol</th>
                <th className="px-8 py-6 text-[9px] uppercase tracking-[0.4em] text-white/20 font-black text-right">Security Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-brand-teal/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedUser(u)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-brand-teal/5 border border-white/5 flex items-center justify-center text-brand-teal font-black text-lg group-hover:scale-110 transition-transform">
                        {u.profile_image ? (
                          <img src={u.profile_image} alt={u.full_name} className="w-full h-full rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                        ) : (
                          (u.full_name || 'U')[0]
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight group-hover:text-brand-teal transition-colors">{u.full_name}</p>
                        <p className="text-[10px] text-white/20 font-bold mt-1 lowercase">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-lg font-black border ${
                      u.role === 'super_admin' ? 'bg-brand-coral/10 text-brand-coral border-brand-coral/20' :
                      u.role === 'admin' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' :
                      'bg-white/5 text-white/40 border-white/10'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <Shield size={14} className={u.tier && u.tier !== 'Free Access' ? 'text-brand-teal' : 'text-white/20'} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{u.tier || 'Free Access'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white">
                        <Eye size={16} />
                      </button>
                      <button className="p-3 rounded-xl bg-brand-coral/10 text-brand-coral hover:bg-brand-coral hover:text-black transition-all border border-brand-coral/20">
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. USER DETAIL DRAWER */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-[150]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-full lg:w-[600px] bg-brand-black border-l border-white/10 z-[160] overflow-y-auto no-scrollbar shadow-2xl p-12 space-y-12"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                   <div className="w-24 h-24 rounded-[2rem] bg-brand-teal/10 border-2 border-brand-teal/30 p-1">
                      <img 
                        src={selectedUser.profile_image || `https://i.pravatar.cc/200?u=${selectedUser.id}`} 
                        className="w-full h-full rounded-[1.8rem] object-cover"
                        alt="Profile"
                      />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter">{selectedUser.full_name}</h2>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-brand-teal font-black mt-2">Designation: {selectedUser.role?.replace('_', ' ')}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-4 bg-white/5 rounded-2xl hover:bg-brand-coral hover:text-black transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* STATS OVERVIEW */}
              <div className="grid grid-cols-3 gap-6">
                {[
                   { label: 'Sync Integrity', value: '98%', icon: Shield, color: 'brand-teal' },
                   { label: 'Action Yield', value: '412', icon: Activity, color: 'brand-teal' },
                   { label: 'Nexus Tier', value: selectedUser.tier || 'None', icon: Briefcase, color: 'brand-teal' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-2">
                    <stat.icon size={16} className={`text-${stat.color}`} />
                    <p className="text-[10px] font-black tracking-tighter text-white">{stat.value}</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/20 font-black">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* CORE DETAILS SECTION */}
              <div className="space-y-8">
                 <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black border-b border-white/5 pb-4">Biometric Data</h3>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-1">
                          <p className="text-[8px] uppercase tracking-widest text-white/20 font-black">Matrix Key</p>
                          <p className="text-xs font-mono text-white/60 truncate">{selectedUser.id}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] uppercase tracking-widest text-white/20 font-black">Comm Signal</p>
                          <p className="text-xs font-bold text-white/60 uppercase tracking-widest">{selectedUser.email}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] uppercase tracking-widest text-white/20 font-black">Node Location</p>
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter text-white/80">
                             <MapPin size={12} className="text-brand-teal" /> {(selectedUser as any).city || 'Downtown Miami'}
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] uppercase tracking-widest text-white/20 font-black">Synchronization Rate</p>
                          <div className="flex items-center gap-3">
                             <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-teal w-[72%] shadow-glow-teal" />
                             </div>
                             <span className="text-[9px] font-black text-brand-teal">72%</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black border-b border-white/5 pb-4">Operational History</h3>
                    <div className="space-y-4">
                       {[
                          { label: 'Order #FMF-2931', date: '2 days ago', status: 'Fulfilled', icon: ShoppingBag },
                          { label: 'Protocol: Core Shred', date: '5 days ago', status: 'In Progress', icon: PlayCircle },
                          { label: 'Retreat Interest: Tulum', date: '1 week ago', status: 'Waitlist', icon: MapPin },
                          { label: 'Collective: Miami Run Club', date: '2 weeks ago', status: 'Member', icon: MessageSquare },
                       ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-teal/20 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                                   <item.icon size={18} />
                                </div>
                                <div>
                                   <p className="text-[11px] font-black uppercase tracking-tight">{item.label}</p>
                                   <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1 font-bold">{item.date}</p>
                                </div>
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-brand-teal bg-brand-teal/10 px-2 py-1 rounded-md">{item.status}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 pt-8 border-t border-white/5">
                 <button className="flex-1 py-5 bg-brand-teal text-black rounded-2xl text-[10px] uppercase tracking-[0.5em] font-black shadow-glow-teal hover:scale-[1.05] transition-all">Synchronize User</button>
                 <button className="px-8 py-5 bg-brand-coral/10 text-brand-coral border border-brand-coral/20 rounded-2xl text-[10px] uppercase tracking-[0.5em] font-black hover:bg-brand-coral hover:text-black transition-all">X-Null Protocol</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
