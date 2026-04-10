import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList, Search, Check, X, ChevronDown,
  Package, Truck, Clock, CheckCircle, XCircle, RotateCcw
} from 'lucide-react';
import { Order, UserProfile } from '../../types';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'Pending',   color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',    icon: Clock },
  paid:      { label: 'Paid',      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',        icon: CheckCircle },
  shipping:  { label: 'Shipping',  color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',  icon: Truck },
  completed: { label: 'Completed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: Package },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-500/10 border-red-500/30',           icon: XCircle },
};

interface OrderManagerProps {
  orders: Order[];
  users: UserProfile[];
  onUpdateStatus: (id: string, status: string) => void;
  onViewDetails?: (order: Order) => void;
}

export const OrderManager = ({ orders, users, onUpdateStatus }: OrderManagerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState('');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const u = users.find(user => user.id === o.user_id);
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      o.id.toLowerCase().includes(q) ||
      (u?.full_name || '').toLowerCase().includes(q) ||
      (u?.email || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setConfirmingId(orderId);
    setConfirmStatus(newStatus);
  };

  const confirmStatusChange = () => {
    if (confirmingId && confirmStatus) {
      onUpdateStatus(confirmingId, confirmStatus);
    }
    setConfirmingId(null);
    setConfirmStatus('');
  };

  const totalRevenue = orders
    .filter(o => o.status === 'paid' || o.status === 'completed')
    .reduce((acc, o) => acc + (o.total_amount || 0), 0);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Order <span className="text-brand-coral">Control</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">
            {filteredOrders.length} orders · ${totalRevenue.toFixed(2)} revenue
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text" placeholder="Search orders..."
              className="w-48 bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-xs focus:border-brand-teal outline-none"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === 'all' ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'}`}>
          All ({orders.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, conf]) => {
          const Icon = conf.icon;
          const count = orders.filter(o => o.status === key).length;
          return (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${statusFilter === key ? conf.color : 'bg-white/5 text-white/40 border-white/10 hover:text-white'}`}>
              <Icon size={11} /> {conf.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/20 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Order #</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Customer</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Total</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Date</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.map(o => {
              const u = users.find(user => user.id === o.user_id);
              const conf = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
              const Icon = conf.icon;
              return (
                <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black font-mono">#{o.id.split('-')[0].toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black">{u?.full_name || 'Unknown'}</p>
                    <p className="text-[10px] text-white/40">{u?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-brand-coral">${o.total_amount?.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-white/70">{new Date(o.created_at).toLocaleDateString()}</p>
                    <p className="text-[10px] text-white/30">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${conf.color}`}>
                      <Icon size={11} /> {conf.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Details */}
                      <button
                        onClick={() => setViewingOrder(o)}
                        className="p-1.5 bg-blue-500/10 hover:bg-blue-500 rounded-lg text-blue-400 hover:text-white transition-all"
                        title="View Details"
                      >
                        <Eye size={13} />
                      </button>
                      {/* Quick complete */}
                      {o.status !== 'completed' && o.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(o.id, 'completed')}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 rounded-lg text-emerald-400 hover:text-white transition-all"
                          title="Mark Completed"
                        >
                          <Check size={13} />
                        </button>
                      )}
                      {/* Revert to pending */}
                      {(o.status === 'completed' || o.status === 'cancelled') && (
                        <button
                          onClick={() => handleStatusChange(o.id, 'pending')}
                          className="p-1.5 bg-amber-500/10 hover:bg-amber-500 rounded-lg text-amber-400 hover:text-black transition-all"
                          title="Revert to Pending"
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}
                      {/* Status dropdown */}
                      <select
                        value={o.status}
                        onChange={e => handleStatusChange(o.id, e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[9px] uppercase font-black outline-none focus:border-brand-teal cursor-pointer"
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, c]) =>
                          <option key={key} value={key}>{c.label}</option>
                        )}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-white/40 text-sm">
            <ClipboardList size={48} className="mx-auto opacity-20 mb-4" />
            No orders match filters.
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {confirmingId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center space-y-6"
            >
              <p className="text-lg font-black uppercase">Update Order Status?</p>
              <p className="text-white/50 text-sm">
                Change to: <span className={`font-black ${STATUS_CONFIG[confirmStatus]?.color.split(' ')[0]}`}>{STATUS_CONFIG[confirmStatus]?.label}</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmingId(null)} className="flex-1 py-3 bg-white/5 text-white font-black uppercase text-[10px] rounded-xl hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={confirmStatusChange} className="flex-1 py-3 bg-brand-coral text-black font-black uppercase text-[10px] rounded-xl hover:bg-brand-coral/80 transition-all">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Address/Details Modal */}
      <AnimatePresence>
        {viewingOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 w-full max-w-md space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Order Details</h3>
                <button onClick={() => setViewingOrder(null)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-bold">Stripe Session ID</p>
                  <p className="text-xs font-mono text-white/60">{viewingOrder.stripe_session_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-teal mb-2 font-bold">Shipping Address</p>
                  {viewingOrder.shipping_address ? (
                    <div className="bg-white/5 p-4 rounded-xl text-xs font-bold text-white/80 space-y-1.5 border border-white/10 shadow-inner">
                      {viewingOrder.shipping_address.name && <p className="text-brand-teal uppercase tracking-widest text-[10px] mb-2">{viewingOrder.shipping_address.name}</p>}
                      <p>{viewingOrder.shipping_address.line1}</p>
                      {viewingOrder.shipping_address.line2 && <p>{viewingOrder.shipping_address.line2}</p>}
                      <p>{viewingOrder.shipping_address.city}, {viewingOrder.shipping_address.state} {viewingOrder.shipping_address.postal_code}</p>
                      <p className="text-white/40 pt-2">{viewingOrder.shipping_address.country}</p>
                    </div>
                  ) : (
                    <div className="bg-amber-500/10 p-4 rounded-xl text-xs text-amber-500/60 italic border border-amber-500/20">
                      No shipping address was collected.
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setViewingOrder(null)} className="w-full py-4 mt-6 bg-white/10 hover:bg-white text-white hover:text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">Close Details</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
