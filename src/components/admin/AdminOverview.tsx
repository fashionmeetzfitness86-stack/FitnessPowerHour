import React from 'react';
import { 
  Users, ShoppingBag, DollarSign, Activity,
  Package, Mail, Calendar, TrendingUp, Flame, Brain
} from 'lucide-react';

export const AdminOverview = ({ stats, onNavigate }: any) => {
  const cards = [
    { id: 'users', label: 'Active Members', value: stats.activeMembers || 0, icon: Flame, color: 'text-brand-coral', bg: 'bg-brand-coral/10' },
    { id: 'orders', label: 'Revenue Today', value: `$${stats.revenueToday || '0.00'}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'orders', label: 'Pending Orders', value: stats.pendingOrders || 0, icon: Package, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { id: 'users', label: 'Active Users Today', value: stats.activeUsersToday || 0, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'requests', label: 'Pending Requests', value: stats.pendingRequests || 0, icon: Mail, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'athletes', label: 'Workouts Logged Today', value: stats.workoutsToday || 0, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  return (
    <div className="space-y-12 fade-in pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter shadow-glow-teal inline-block"><span className="text-brand-teal">Control</span> Center</h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-2 font-bold max-w-sm">
            Live nexus overview. Manage ecosystem flow and metrics in real-time.
          </p>
        </div>
      </div>

      {/* TOP SECTION — LIVE CONTROL BAR */}
      <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2">
            <Activity size={16} /> Live Control Bar
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {cards.map((card, i) => (
              <div
                key={i}
                onClick={() => onNavigate?.(card.id)}
                className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.03] hover:border-white/20 transition-all flex flex-col justify-between cursor-pointer group shadow-2xl relative overflow-hidden"
              >
                <div className={`absolute -right-10 -top-10 w-32 h-32 blur-[50px] rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity ${card.bg.split('/')[0]}`} />
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                    <card.icon size={20} />
                  </div>
                  <TrendingUp size={14} className="text-white/10 group-hover:text-white/30 transition-colors" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-4xl font-black tracking-tighter mb-1 truncate">{card.value}</h3>
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">{card.label}</p>
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* SECOND SECTION — ACTION CENTER */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2">
          <Calendar size={16} /> Action Center
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Booking */}
            <button 
                onClick={() => onNavigate?.('requests')}
                className="group relative overflow-hidden p-8 rounded-3xl bg-brand-coral border-2 border-brand-coral text-black flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(255,107,107,0.2)]"
            >
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Calendar size={48} className="mb-4 relative z-10" />
                <h2 className="text-2xl font-black uppercase tracking-tight relative z-10">Create Booking</h2>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mt-2 relative z-10">Schedule & Manage Service Requests</p>
            </button>
            
            {/* Manage Orders */}
            <button 
                onClick={() => onNavigate?.('orders')}
                className="group relative overflow-hidden p-8 rounded-3xl bg-brand-teal border-2 border-brand-teal text-black flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(45,212,191,0.2)]"
            >
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Package size={48} className="mb-4 relative z-10" />
                <h2 className="text-2xl font-black uppercase tracking-tight relative z-10">Manage Orders</h2>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mt-2 relative z-10">Review, Ship, and Process Sales</p>
            </button>
        </div>
      </div>

    </div>
  );
};
