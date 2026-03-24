import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Video, ShoppingBag, 
  TrendingUp, Activity, DollarSign 
} from 'lucide-react';

export const AdminOverview = ({ stats }: any) => {
  const cards = [
    { label: 'Total Members', value: stats.users || 0, icon: Users, color: 'brand-teal' },
    { label: 'Active Videos', value: stats.videos || 0, icon: Video, color: 'brand-coral' },
    { label: 'Total Orders', value: stats.orders || 0, icon: ShoppingBag, color: 'white' },
    { label: 'Revenue (MTD)', value: `$${stats.revenue || '0.00'}`, icon: DollarSign, color: 'brand-teal' },
  ];

  return (
    <div className="space-y-12 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-gradient p-8 border border-white/5 space-y-4 hover:border-brand-teal/30 transition-all"
          >
            <div className={`p-3 rounded-xl bg-${card.color}/10 w-fit text-${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{card.label}</p>
              <h3 className="text-3xl font-bold tracking-tighter mt-1">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-gradient p-8 border border-white/5 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-3">
              <Activity size={20} className="text-brand-teal" /> Recent Activity
            </h3>
            <button className="text-[10px] uppercase tracking-widest text-brand-teal hover:underline font-bold">View System Logs</button>
          </div>
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-brand-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">New Order #INV-{i}2345</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/40 mt-1">2 minutes ago</p>
                  </div>
                </div>
                <TrendingUp size={14} className="text-white/20" />
              </div>
            ))}
          </div>
        </div>

        <div className="card-gradient p-8 border border-white/5 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-3">
              <TrendingUp size={20} className="text-brand-coral" /> Growth Metrics
            </h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 pt-8">
            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
              <div key={i} className="flex-grow flex flex-col items-center gap-4 group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-brand-teal/20 group-hover:bg-brand-teal/50 transition-all rounded-t-sm relative"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-brand-teal text-black text-[8px] px-2 py-1 rounded font-bold">{h}%</span>
                  </div>
                </motion.div>
                <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">W{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
