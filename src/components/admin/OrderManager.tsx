import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, Search, Download, 
  Package, Truck, CheckCircle, 
  XCircle, Filter, Eye, Printer,
  ArrowUpRight, AlertCircle
} from 'lucide-react';
import { Order } from '../../types';

interface OrderManagerProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: string) => void;
  onViewDetails: (order: Order) => void;
}

export const OrderManager = ({ 
  orders, onUpdateStatus, onViewDetails 
}: OrderManagerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           o.customer_name_snapshot?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || o.fulfillment_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div className="space-y-12 fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Order <span className="text-brand-teal">Fulfillment</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Track purchases, manage shipping status, and process refunds.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:border-brand-teal transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-grow lg:flex-none bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer appearance-none hover:bg-white/10 transition-all text-white/60"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="card-gradient rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Order Details</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Customer</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Financials</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Fulfillment</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-white/5 text-white/40 group-hover:text-brand-teal transition-colors border border-white/10">
                        <ClipboardList size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tight uppercase group-hover:text-brand-teal transition-colors">#{o.order_number || o.id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">
                          {new Date(o.placed_at || o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-bold uppercase tracking-tight text-white/80">{o.customer_name_snapshot}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded tracking-widest border border-white/10">{o.items.length} ITEMS</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-mono font-bold text-brand-teal">${o.total_amount.toFixed(2)}</p>
                      <span className={`text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded font-black border ${
                        o.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-brand-coral/10 text-brand-coral border-brand-coral/20'
                      }`}>
                        {o.payment_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        o.fulfillment_status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                        o.fulfillment_status === 'shipped' ? 'bg-brand-teal/10 text-brand-teal' :
                        o.fulfillment_status === 'processing' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-white/5 text-white/40'
                      }`}>
                        {o.fulfillment_status === 'delivered' ? <CheckCircle size={14} /> : 
                         o.fulfillment_status === 'shipped' ? <Truck size={14} /> :
                         o.fulfillment_status === 'processing' ? <Package size={14} /> :
                         <AlertCircle size={14} />}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        o.fulfillment_status === 'delivered' ? 'text-emerald-400' :
                        o.fulfillment_status === 'shipped' ? 'text-brand-teal' :
                        o.fulfillment_status === 'processing' ? 'text-amber-400' :
                        'text-white/40'
                      }`}>
                        {o.fulfillment_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => onViewDetails(o)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-brand-teal hover:text-black transition-all shadow-xl"
                        title="View Full Order"
                      >
                        <Eye size={14} />
                      </button>
                      <button className="p-3 rounded-xl bg-white/5 hover:bg-white/20 transition-all shadow-xl" title="Print Invoice">
                        <Printer size={14} />
                      </button>
                      <button className="p-3 rounded-xl bg-brand-teal/10 hover:bg-brand-teal hover:text-black text-brand-teal transition-all shadow-xl" title="Process Update">
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="py-24 text-center space-y-4">
            <ClipboardList size={48} className="mx-auto text-white/5" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold italic">No orders matching current criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};
