import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Package, ArrowUpRight, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Order } from '../../types';
import { supabase } from '../../supabase';

export const OrderHistoryTab = ({ user }: { user: UserProfile }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user.id]);

  return (
    <div className="space-y-8 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Order <span className="text-brand-coral">History</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Track and manage your physical FMF purchases.
          </p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search Orders..."
            className="pl-10 pr-4 py-3 bg-white/5 border border-white/10 hover:border-brand-teal/50 focus:border-brand-teal outline-none rounded-xl text-[10px] uppercase tracking-widest font-bold w-64 transition-colors"
          />
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="text-brand-coral animate-spin" size={40} />
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {orders.map((order, i) => (
              <motion.div 
                key={order.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-gradient p-10 border border-white/5 hover:border-brand-teal/30 transition-all rounded-[3rem] group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.02] transition-opacity">
                   <ShoppingBag size={200} />
                </div>
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 border-b border-white/5 pb-6 mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded-xl text-white/40">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">Order #{order.order_number || order.id.slice(-8).toUpperCase()}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                      Placed on {new Date(order.placed_at || order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-right">
                    <p className="text-xl font-bold font-mono text-brand-teal">${order.total_amount.toFixed(2)}</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/40 mt-1">Total Amount</p>
                  </div>
                  <button className="p-3 bg-brand-teal/10 hover:bg-brand-teal hover:text-black text-brand-teal transition-colors rounded-xl ml-4">
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="flex-grow">
                  <h4 className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-4">Items Summary</h4>
                  <div className="space-y-3">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-white/40">{item.quantity}x</span>
                          <span className="text-xs font-bold uppercase tracking-tight">{item.product_name_snapshot}</span>
                        </div>
                        <span className="text-[10px] font-mono text-brand-teal">${item.line_total.toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold pt-2 ml-2">
                        + {order.items.length - 3} more items...
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="w-full md:w-64 space-y-4 border-l-0 md:border-l border-white/5 md:pl-8">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-2">Fulfillment</h4>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[8px] uppercase tracking-widest font-bold ${
                      order.fulfillment_status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      order.fulfillment_status === 'shipped' ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20' :
                      order.fulfillment_status === 'processing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-white/5 text-white/60 border border-white/10'
                    }`}>
                      <Package size={12} /> {order.fulfillment_status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-2">Payment</h4>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[8px] uppercase tracking-widest font-bold ${
                      order.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-brand-coral/10 text-brand-coral border border-brand-coral/20'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card-gradient p-24 text-center rounded-[4rem] border-dashed border-2 border-white/10 flex flex-col items-center justify-center space-y-8 bg-brand-coral/[0.02]">
          <div className="w-24 h-24 rounded-full bg-brand-coral/10 flex items-center justify-center text-brand-coral border border-brand-coral/20 shadow-glow-coral">
             <ShoppingBag size={40} />
          </div>
          <div className="space-y-4">
             <h3 className="text-4xl font-black uppercase tracking-tighter">No Neural <span className="text-brand-coral">Artifacts</span></h3>
             <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold max-w-sm mx-auto leading-relaxed">
               Your inventory is currently empty. Initialize a transmission from the FMF catalog to begin your physical collection.
             </p>
          </div>
          <button 
            onClick={() => window.location.href = '/shop'}
            className="px-16 py-6 bg-brand-coral text-white transition-all text-[11px] uppercase font-black tracking-[0.4em] rounded-3xl shadow-glow-coral hover:bg-white hover:text-black flex items-center gap-4 group"
          >
            Visit Emporium <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
