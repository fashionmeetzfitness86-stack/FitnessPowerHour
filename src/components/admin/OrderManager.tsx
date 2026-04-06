import React, { useState } from 'react';
import { ClipboardList, Search } from 'lucide-react';
import { Order, UserProfile } from '../../types';

interface OrderManagerProps {
  orders: Order[];
  users: UserProfile[];
  onUpdateStatus: (id: string, status: string) => void;
  // Included unused props to keep compatibility
  onViewDetails?: (order: Order) => void;
}

export const OrderManager = ({ 
  orders, users, onUpdateStatus 
}: OrderManagerProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(o => {
    const u = users.find(user => user.id === o.user_id);
    const matchesSearch = o.id.includes(searchQuery) || 
                         (u?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (u?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Orders</h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Manage shop orders and fulfillments.</p>
        </div>
        <div className="w-full md:w-64">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
             <input
               type="text"
               placeholder="Search orders..."
               className="w-full bg-brand-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-brand-teal outline-none"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
             <tr className="bg-black/20 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Order #</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Customer</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Total</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">Status</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.map(o => {
              const u = users.find(user => user.id === o.user_id);
              return (
                <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                     <p className="text-sm font-bold">#{o.id.split('-')[0]}</p>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-sm font-bold">{u?.full_name || 'Unknown'}</p>
                     <p className="text-[10px] text-white/40">{u?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-sm font-bold text-brand-teal">${o.total_amount.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-xs text-white/80">{new Date(o.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <select
                        value={o.status}
                        onChange={e => onUpdateStatus(o.id, e.target.value)}
                        className="bg-brand-black border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-teal"
                     >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Completed</option>
                        <option value="cancelled">Cancelled</option>
                     </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-white/40 text-sm">
             <ClipboardList size={48} className="mx-auto opacity-20 mb-4" />
             No orders found.
          </div>
        )}
      </div>
    </div>
  );
};
