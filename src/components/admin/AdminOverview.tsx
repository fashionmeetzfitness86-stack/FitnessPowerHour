import React from 'react';
import { 
  Users, ShoppingBag, 
  DollarSign, Activity,
  PlayCircle, ClipboardList
} from 'lucide-react';

export const AdminOverview = ({ stats }: any) => {
  const cards = [
    { label: 'Total Users', value: stats.users || 0, icon: Users, color: 'text-brand-teal' },
    { label: 'Active Members', value: stats.activeMembers || 0, icon: Activity, color: 'text-brand-teal' },
    { label: 'Active Programs', value: stats.programs || 0, icon: PlayCircle, color: 'text-brand-coral' },
    { label: 'Products', value: stats.products || 0, icon: ShoppingBag, color: 'text-white' },
    { label: 'Orders', value: stats.orders || 0, icon: ClipboardList, color: 'text-white' },
  ];

  return (
    <div className="space-y-8 fade-in">
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Dashboard Overview</h2>
        <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Welcome back. Here is a quick look at how your platform is doing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-brand-teal/10 border border-brand-teal/30 p-8 rounded-3xl flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4 text-brand-teal">
            <DollarSign size={24} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Total Revenue</span>
          </div>
          <h3 className="text-5xl font-black tracking-tighter text-brand-teal">${stats.revenue || '0.00'}</h3>
        </div>

        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">{card.label}</p>
              <h3 className="text-3xl font-black tracking-tighter">{card.value}</h3>
            </div>
            <div className={`p-4 rounded-2xl bg-white/5 ${card.color}`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
