import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Video, ShoppingBag, 
  TrendingUp, Activity, DollarSign,
  Plus, MessageSquare, MapPin, Package,
  UserPlus, PlayCircle, ClipboardList, Shield,
  ArrowRight
} from 'lucide-react';

export const AdminOverview = ({ stats }: any) => {
  const cards = [
    { label: 'Total Users', value: stats.users || 0, icon: Users, color: 'brand-teal' },
    { label: 'Active Members', value: stats.activeMembers || 0, icon: Shield, color: 'brand-teal' },
    { label: 'Athletes', value: stats.athletes || 0, icon: Activity, color: 'brand-coral' },
    { label: 'Active Programs', value: stats.programs || 0, icon: PlayCircle, color: 'brand-teal' },
    { label: 'Total Products', value: stats.products || 0, icon: ShoppingBag, color: 'white' },
    { label: 'Orders', value: stats.orders || 0, icon: ClipboardList, color: 'white' },
    { label: 'Active Communities', value: stats.communities || 0, icon: MessageSquare, color: 'brand-teal' },
    { label: 'Retreat Requests', value: stats.retreatRequests || 0, icon: MapPin, color: 'brand-coral' },
    { label: 'Service Requests', value: stats.serviceRequests || 0, icon: Activity, color: 'brand-teal' },
  ];

  const quickActions = [
    { label: 'Add User', icon: UserPlus, color: 'brand-teal' },
    { label: 'Add Product', icon: Plus, color: 'white' },
    { label: 'Create Program', icon: PlayCircle, color: 'brand-teal' },
    { label: 'Create Community', icon: MessageSquare, color: 'brand-teal' },
    { label: 'Add Retreat', icon: MapPin, color: 'brand-coral' },
    { label: 'Manage Packages', icon: Package, color: 'white' },
  ];

  return (
    <div className="space-y-12 fade-in">
      {/* 1. CORE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="card-gradient p-8 border border-brand-teal/20 space-y-4 lg:col-span-2 bg-brand-teal/5 flex flex-col justify-between"
        >
          <div>
            <div className="p-3 rounded-xl bg-brand-teal/10 w-fit text-brand-teal mb-4">
              <DollarSign size={24} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Total Gross Revenue (MTD)</p>
            <h3 className="text-5xl font-black tracking-tighter mt-1 text-brand-teal">${stats.revenue || '0.00'}</h3>
          </div>
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
             <span className="text-[8px] uppercase tracking-widest text-emerald-500 font-black">+14.2% FROM LAST PERIOD</span>
             <TrendingUp size={16} className="text-emerald-500" />
          </div>
        </motion.div>

        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-gradient p-8 border border-white/5 space-y-4 hover:border-brand-teal/30 transition-all group"
          >
            <div className={`p-3 rounded-xl bg-${card.color}/10 w-fit text-${card.color} group-hover:scale-110 transition-transform`}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">{card.label}</p>
              <h3 className="text-2xl font-black tracking-tighter mt-1">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. QUICK ACTIONS */}
      <section className="space-y-6">
        <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20">Operational Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              className="card-gradient p-6 border border-white/5 hover:border-brand-teal/30 flex flex-col items-center gap-4 transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-${action.color}/10 flex items-center justify-center text-${action.color} group-hover:shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all`}>
                <action.icon size={20} />
              </div>
              <span className="text-[9px] uppercase tracking-widest font-black text-white/60 group-hover:text-white transition-colors text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. ACTIVITY & ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-gradient p-10 border border-white/5 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
              <Activity size={24} className="text-brand-teal" /> Nexus Activity Log
            </h3>
            <button className="text-[9px] uppercase tracking-[0.3em] text-brand-teal hover:underline font-black flex items-center gap-2 group">
              Audit Path <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-teal shadow-glow-teal" />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-tight">Access Signal Detected: INV-{i}2345</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/40 mt-1 font-bold">Synchronized 2 minutes ago</p>
                  </div>
                </div>
                <TrendingUp size={14} className="text-white/20" />
              </div>
            ))}
          </div>
        </div>

        <div className="card-gradient p-10 border border-white/5 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
              <TrendingUp size={24} className="text-brand-coral" /> Ecosystem Growth
            </h3>
            <div className="p-1.5 bg-white/5 rounded-xl border border-white/10 flex gap-1">
              {['30D', '90D', '1Y'].map(t => (
                <button key={t} className={`px-3 py-1 text-[8px] uppercase font-black rounded-lg transition-all ${t === '30D' ? 'bg-brand-coral text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 pt-10">
            {[40, 70, 45, 90, 65, 85, 100, 75, 95, 60].map((h, i) => (
              <div key={i} className="flex-grow flex flex-col items-center gap-4 group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-brand-teal/10 border-t-2 border-brand-teal/40 group-hover:bg-brand-teal/30 transition-all rounded-t-sm relative"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="bg-brand-teal text-black text-[8px] px-2 py-1 rounded-md font-black shadow-glow-teal">{h}% LOAD</span>
                  </div>
                </motion.div>
                <span className="text-[8px] uppercase tracking-widest text-white/20 font-black">X{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
