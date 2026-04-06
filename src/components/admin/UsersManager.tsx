import React from 'react';
import { UserProfile } from '../../types';
import { Mail, Shield } from 'lucide-react';

interface UsersManagerProps {
  users: UserProfile[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onUpdateUser: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  // Keeping unused props from AdminDashboard to avoid breaking it
  packages?: any;
  roleFilter?: string;
  setRoleFilter?: any;
  statusFilter?: string;
  setStatusFilter?: any;
  onEdit?: any;
  currentUser?: any;
}

export const UsersManager = ({ 
  users, 
  searchQuery, 
  setSearchQuery, 
  onUpdateUser 
}: UsersManagerProps) => {

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Users</h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Manage members, roles, and access tiers.</p>
        </div>
        <div className="w-full md:w-64">
           <input
             type="text"
             placeholder="Search by name or email..."
             className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

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
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white/40">
                      {u.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{u.full_name || 'No Name'}</p>
                      <p className="text-[10px] text-white/60">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={u.role || 'user'}
                    onChange={(e) => onUpdateUser(u.id, { role: e.target.value as any })}
                    className="bg-brand-black border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-teal"
                  >
                    <option value="user">User</option>
                    <option value="athlete">Athlete</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={u.tier || 'Basic'}
                    onChange={(e) => onUpdateUser(u.id, { tier: e.target.value })}
                    className="bg-brand-black border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-teal"
                  >
                    <option value="Basic">Basic</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${u.status === 'active' || !u.status ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {u.status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <a href={`mailto:${u.email}`} className="p-2 rounded bg-brand-teal/10 text-brand-teal hover:bg-brand-teal hover:text-black transition-all inline-flex items-center gap-2 text-xs font-bold uppercase px-4 cursor-pointer">
                     <Mail size={14} /> Email
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-white/40 text-sm">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
};
