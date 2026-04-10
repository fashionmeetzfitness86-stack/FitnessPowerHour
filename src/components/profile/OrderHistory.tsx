import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Filter, Clock, CheckCircle, Truck, Package, XCircle, ChevronRight, X, AlertTriangle, ShieldAlert, CreditCard, RotateCcw } from 'lucide-react';
import { supabase } from '../../supabase';
import { UserProfile } from '../../types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: {
    name: string;
    description: string;
    images: string[];
    category: string;
  };
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string; // pending, paid, processing, shipping, completed, cancelled
  shipping_address?: any;
  created_at: string;
  items?: OrderItem[];
}

const STATUS_DICT: Record<string, { label: string; color: string; icon: any; order: number }> = {
  pending:    { label: 'Pending Payment', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: Clock,       order: 1 },
  paid:       { label: 'Confirmed',       color: 'text-brand-teal bg-brand-teal/10 border-brand-teal/30',icon: CreditCard,  order: 2 },
  processing: { label: 'Processing',      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',      icon: RotateCcw,   order: 3 },
  shipping:   { label: 'Shipping',        color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',icon: Truck,       order: 4 },
  completed:  { label: 'Delivered',       color: 'text-green-400 bg-green-500/10 border-green-500/30',   icon: CheckCircle, order: 5 },
  cancelled:  { label: 'Cancelled',       color: 'text-red-400 bg-red-500/10 border-red-500/30',         icon: XCircle,     order: -1},
  closed:     { label: 'Closed',          color: 'text-gray-400 bg-gray-500/10 border-gray-500/30',      icon: Package,     order: 5 },
};

const ORDER_TIMELINE = ['pending', 'paid', 'processing', 'shipping', 'completed'];

export const OrderHistory = ({ user, showToast }: { user: UserProfile; showToast: (msg: string, type?: any) => void }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [search, setSearch] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Data Fetching ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch orders
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          setOrders([]); // Graceful degradation for missing production tables
          return;
        }
        throw error;
      }
      if (!ordersData) return;

      // Fetch items for these orders
      const orderIds = ordersData.map(o => o.id);
      if (orderIds.length > 0) {
        const { data: itemsData, error: itemsErr } = await supabase
          .from('order_items')
          .select('*, product:public_products(*)') // Use foreign key to join if permitted, or just select
          .in('order_id', orderIds);

        // Mapped to avoid syntax error if relation doesn't map automatically
        const { data: fallbackItems, error: fbErr } = itemsErr ? await supabase.from('order_items').select('*').in('order_id', orderIds) : { data: null, error: null };
        const itemsList = itemsData || fallbackItems || [];

        // Fetch product details manually if relation failed
        let productsMap: any = {};
        if (itemsErr && itemsList.length > 0) {
           const pIds = itemsList.map(i => i.product_id).filter(Boolean);
           if (pIds.length > 0) {
             const { data: pds } = await supabase.from('products').select('*').in('id', pIds);
             productsMap = (pds || []).reduce((acc: any, p: any) => { acc[p.id] = p; return acc; }, {});
           }
        }

        const enrichedOrders = ordersData.map((o: any) => ({
          ...o,
          items: itemsList.filter((i: any) => i.order_id === o.id).map((i: any) => ({
            ...i,
            product: i.product || productsMap[i.product_id] || { name: 'Unknown Product', images: [] }
          }))
        }));
        
        setOrders(enrichedOrders);
      } else {
        setOrders(ordersData);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load order history', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Filters & Search ─────────────────────────────────────────────────────────
  const activeStatuses = ['pending', 'paid', 'processing', 'shipping'];
  const pastStatuses = ['completed', 'delivered', 'closed', 'cancelled'];

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Tab filter
      const isActive = activeStatuses.includes(o.status?.toLowerCase());
      if (activeTab === 'active' && !isActive) return false;
      if (activeTab === 'past' && isActive) return false;

      // Search filter (order ID, product name)
      if (search) {
        const q = search.toLowerCase();
        const matchId = o.id.toLowerCase().includes(q);
        const matchNames = o.items?.some(i => i.product?.name?.toLowerCase().includes(q));
        if (!matchId && !matchNames) return false;
      }

      return true;
    });
  }, [orders, activeTab, search]);

  // ── Cancel/Delete ────────────────────────────────────────────────────────────
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
    try {
      setIsDeleting(true);
      const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: 'cancelled' } : prev);
      showToast('Order cancelled successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Sub-components ───────────────────────────────────────────────────────────
  const renderTimeline = (currentStatus: string) => {
    // If cancelled, show a specific cancelled state
    if (currentStatus === 'cancelled') {
        return (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl w-full text-red-400">
                <XCircle size={20} />
                <div>
                    <h4 className="font-black uppercase tracking-widest text-[10px]">Order Cancelled</h4>
                    <p className="text-[9px] opacity-70">This order has been terminated. It will not be processed.</p>
                </div>
            </div>
        );
    }

    const currentOrder = STATUS_DICT[currentStatus]?.order || 1;

    return (
      <div className="relative w-full pt-6 pb-2">
        {/* Connection Line */}
        <div className="absolute top-10 left-[10%] right-[10%] h-[2px] bg-white/10 z-0" />
        <div 
          className="absolute top-10 left-[10%] h-[2px] bg-brand-teal z-0 transition-all duration-500 shadow-glow-teal" 
          style={{ width: `${Math.max(0, (currentOrder - 1) / (ORDER_TIMELINE.length - 1)) * 80}%` }} 
        />
        
        {/* Steps */}
        <div className="relative z-10 flex justify-between">
          {ORDER_TIMELINE.map((step, idx) => {
            const stepConfig = STATUS_DICT[step];
            const isCompleted = currentOrder > stepConfig.order;
            const isCurrent = currentOrder === stepConfig.order;
            
            return (
              <div key={step} className="flex flex-col items-center gap-2 group w-16">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-brand-teal border-brand-teal text-black shadow-glow-teal' :
                    isCurrent ? 'bg-[#1a1a1a] border-brand-teal text-brand-teal scale-110 shadow-[0_0_15px_rgba(45,212,191,0.3)]' :
                    'bg-[#0a0a0a] border-white/20 text-white/20'
                }`}>
                  {isCompleted ? <CheckCircle size={14} /> : React.createElement(stepConfig.icon, { size: 14 })}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest text-center ${
                    isCompleted || isCurrent ? 'text-white' : 'text-white/20'
                }`}>
                  {stepConfig.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 fade-in h-full flex flex-col pt-8 lg:pt-0">
      
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
            Order <span className="text-brand-coral">History</span>
          </h2>
          <p className="text-xs uppercase tracking-widest text-white/40 mt-1 font-bold">
            Track and manage your premium acquisitions.
          </p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white/5 p-1 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 md:w-32 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'active' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'
            }`}
          >
            Active Orders
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`flex-1 md:w-32 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'past' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'
            }`}
          >
            Past Orders
          </button>
        </div>

        <div className="relative w-full md:w-64">
           <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
           <input 
             type="text" 
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Search by ID or Item..." 
             className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs outline-none focus:border-brand-coral transition-colors"
           />
        </div>
      </div>

      {/* ── Order List ── */}
      <div className="flex-1 space-y-4">
        {loading ? (
          <div className="h-48 flex items-center justify-center text-white/30">
            <span className="text-[10px] uppercase tracking-widest font-black animate-pulse">Loading Manifest...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-8">
            <ShoppingBag size={48} className="text-white/10 mb-4" />
            <h3 className="text-lg font-black uppercase tracking-widest text-white/40">No {activeTab} orders</h3>
            <p className="text-xs text-white/30 mt-2">Any transactions will be logged here.</p>
          </div>
        ) : (
          filteredOrders.map((order, i) => {
            const statusConf = STATUS_DICT[order.status?.toLowerCase()] || STATUS_DICT.pending;
            const StatusIcon = statusConf.icon;
            // Get first product image for thumbnail
            const thumbnail = order.items?.[0]?.product?.images?.[0];

            return (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedOrder(order)}
                className="bg-black/40 border border-white/10 rounded-3xl p-5 hover:border-brand-coral/30 hover:bg-white/[0.04] transition-all cursor-pointer group flex flex-col md:flex-row gap-6 md:items-center"
              >
                {/* Thumbnail */}
                <div className="w-full md:w-24 h-24 bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {thumbnail ? (
                        <img src={thumbnail} alt="Item" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity scale-105 group-hover:scale-100" />
                    ) : (
                        <Package size={24} className="text-white/10" />
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[9px] text-white/30 font-mono tracking-widest uppercase">ID: {order.id.split('-')[0]}</span>
                        <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} /> {new Date(order.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <h3 className="font-black uppercase text-sm md:text-base tracking-tight truncate">
                        {order.items?.length === 1 
                            ? order.items[0].product?.name 
                            : `${order.items?.[0]?.product?.name || 'Item'} + ${order.items!.length - 1} more`
                        }
                    </h3>
                    <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest mt-1">
                        ${order.total_amount?.toFixed(2)} • {order.items?.length} Items
                    </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                    <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${statusConf.color}`}>
                        <StatusIcon size={12} />
                        {statusConf.label}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-coral opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Track <ChevronRight size={14} />
                    </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* ── ORDER DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 shrink-0 bg-white/[0.02]">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Order Details</h3>
                    <p className="text-[10px] font-mono text-white/40 mt-1 uppercase tracking-widest">#{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-10 flex-1">
                
                {/* Tracker */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Tracking Status</h4>
                  {renderTimeline(selectedOrder.status)}
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Manifest</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={item.id || idx} className="flex gap-4 items-center bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                        <div className="w-16 h-16 bg-[#111] rounded-xl overflow-hidden border border-white/5 shrink-0">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt="Item" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-white/10" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black uppercase tracking-tight text-sm truncate">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">QTY: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summaries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Address */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Destination</h4>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-sm">
                      {selectedOrder.shipping_address ? (
                        <>
                          <p className="font-bold">{selectedOrder.shipping_address.name || user.full_name}</p>
                          <p className="text-white/60 mt-1">{selectedOrder.shipping_address.street}</p>
                          <p className="text-white/60">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</p>
                          <p className="text-white/60">{selectedOrder.shipping_address.country}</p>
                        </>
                      ) : (
                        <p className="text-white/40 italic">No physical shipping address (Digital/Service)</p>
                      )}
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Summary</h4>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                       <div className="flex justify-between text-xs text-white/60">
                         <span>Subtotal</span>
                         <span>${selectedOrder.total_amount?.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between text-xs text-white/60">
                         <span>Shipping</span>
                         <span>$0.00</span>
                       </div>
                       <div className="h-px bg-white/10 w-full my-2" />
                       <div className="flex justify-between text-sm font-black text-brand-teal uppercase tracking-widest">
                         <span>Total</span>
                         <span>${selectedOrder.total_amount?.toFixed(2)}</span>
                       </div>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Footer Actions */}
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'paid') && (
                <div className="p-6 border-t border-white/5 bg-white/[0.02] shrink-0 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-white/40 text-[9px] uppercase tracking-widest font-bold">
                     <ShieldAlert size={12} className="text-amber-400" /> Modify details via Support before processing
                   </div>
                   <button 
                     disabled={isDeleting}
                     onClick={() => handleCancelOrder(selectedOrder.id)}
                     className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                   >
                     {isDeleting ? 'Processing...' : 'Cancel Order'}
                   </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
