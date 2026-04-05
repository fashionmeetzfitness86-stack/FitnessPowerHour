import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, Search, Eye, Filter, ArrowUpRight, DollarSign, Package, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Order, UserProfile } from '../../types';

interface OrderManagerProps {
  orders: Order[];
  users: UserProfile[];
  onUpdateStatus: (id: string, status: string) => void;
  onViewDetails: (order: Order) => void;
}

export const OrderManager = ({ 
  orders, users, onUpdateStatus, onViewDetails 
}: OrderManagerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const u = users.find(u => u.id === o.user_id);
      const matchesSearch = o.id.includes(searchQuery.toLowerCase()) || 
                           u?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           u?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, users, searchQuery, statusFilter]);

  return (
    <div className="space-y-12 fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Order <span className="text-brand-coral">Control</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Fulfillment engine and transaction visibility.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              placeholder="Search ID or node..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-coral transition-colors outline-none font-black uppercase tracking-widest text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-grow lg:flex-none bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-black outline-none cursor-pointer appearance-none text-white/60 focus:border-brand-coral focus:text-white"
          >
            <option value="All">All Transactions</option>
            <option value="pending">Pending</option>
            <option value="paid">Authorized (Paid)</option>
            <option value="shipped">Deployed (Shipped)</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card-gradient rounded-3xl overflow-hidden border border-white/5 relative">
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">System ID</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Node (Purchaser)</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Vector Value</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Status</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map(o => {
                const u = users.find(u => u.id === o.user_id);
                return (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white/5 text-white/20 group-hover:text-brand-coral group-hover:border-brand-coral/30 transition-all border border-white/5">
                          <ClipboardList size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black tracking-tight uppercase group-hover:text-brand-coral transition-colors">#{o.id.split('-')[0]}</p>
                          <p className="text-[10px] text-white/40 font-mono tracking-widest mt-1">
                            {new Date(o.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-bold uppercase tracking-tight text-white">{u?.full_name || 'UNKNOWN'}</p>
                        <p className="text-[10px] font-mono tracking-widest text-white/40">{u?.email}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <DollarSign size={14} />
                        <span className="text-xl font-black tracking-tighter">{o.total_amount.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select
                          value={o.status}
                          onChange={e => onUpdateStatus(o.id, e.target.value)}
                          className={`text-[8px] px-3 py-1.5 rounded font-black uppercase tracking-widest border outline-none cursor-pointer appearance-none ${
                            o.status === 'shipped' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                            o.status === 'paid' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' : 
                            o.status === 'cancelled' ? 'bg-brand-coral/10 text-brand-coral border-brand-coral/20' : 
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}
                      >
                         <option value="pending">Pending</option>
                         <option value="paid">Paid - Awaiting Ship</option>
                         <option value="shipped">Deployed (Shipped)</option>
                         <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => onViewDetails(o)}
                          className="p-3 rounded-xl bg-white/5 hover:bg-brand-coral hover:text-black transition-all"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="py-32 text-center space-y-4 border-dashed border-2 border-white/5 rounded-3xl m-8">
            <ClipboardList size={48} className="mx-auto text-white/5" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black">No transactions matching current radar</p>
          </div>
        )}
      </div>
    </div>
  );
};
