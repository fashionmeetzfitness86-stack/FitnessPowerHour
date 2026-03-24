import { motion } from 'motion/react';
import { 
  Trophy, Calendar, Video, Clock, 
  MapPin, ShoppingBag, Shield, CheckCircle 
} from 'lucide-react';
import { UserProfile } from '../../types';

export const Overview = ({ user }: { user: UserProfile }) => {
  // Calculate completion percentage based on filled fields
  const fields = ['full_name', 'email', 'phone', 'city', 'country', 'profile_image', 'height', 'weight', 'workout_style', 'training_goals'];
  const completedFields = fields.filter(f => user[f as keyof UserProfile]);
  const completionPercentage = Math.round((completedFields.length / fields.length) * 100);

  const streak = user.streak || 0;
  const sessionsThisWeek = user.workoutLogs?.filter(log => {
    const logDate = new Date(log.completed_at);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return logDate >= lastWeek;
  }).length || 0;

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Dashboard <span className="text-brand-teal">Overview</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Welcome back, {user.full_name?.split(' ')[0] || 'Athlete'}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-center px-6 py-4 card-gradient border-brand-coral/30 min-w-[100px]">
            <span className="text-brand-coral text-2xl font-bold">{streak}</span>
            <span className="text-[8px] uppercase tracking-widest text-white/40">Day Streak</span>
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-4 card-gradient border-brand-teal/30 min-w-[100px]">
            <span className="text-brand-teal text-2xl font-bold">{sessionsThisWeek}</span>
            <span className="text-[8px] uppercase tracking-widest text-white/40">This Week</span>
          </div>
        </div>
      </div>

      {/* Completion ProgressBar */}
      <div className="card-gradient p-6 border-white/5 space-y-4">
        <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold">
          <span className="text-white/60">Profile Completion</span>
          <span className="text-brand-teal">{completionPercentage}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${completionPercentage}%` }} 
            className="h-full bg-brand-teal"
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Membership & Billing summary */}
        <div className="card-gradient p-8 space-y-6">
          <div className="flex items-center gap-4 text-brand-teal">
            <Shield size={24} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Membership</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Current Plan</p>
              <p className="text-xl font-bold tracking-tight uppercase">{user.tier || 'Basic'} Tier</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Next Billing Date</p>
              <p className="text-sm font-bold opacity-80">Aug 24, 2026</p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-widest font-bold rounded-full">
                Payment Active
              </span>
            </div>
          </div>
        </div>

        {/* Training Summary */}
        <div className="card-gradient p-8 space-y-6">
          <div className="flex items-center gap-4 text-brand-coral">
            <Calendar size={24} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Training</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Active Program</p>
              <p className="text-lg font-bold tracking-tight uppercase line-clamp-1">30-Day Core Blast</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Upcoming Workout</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={12} className="text-brand-coral" />
                <p className="text-xs font-bold opacity-80">Today, 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Activity */}
        <div className="card-gradient p-8 space-y-6">
          <div className="flex items-center gap-4 text-white">
            <Video size={24} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Media</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Latest Video Upload</p>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg mt-2 cursor-pointer border border-transparent hover:border-brand-teal/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-teal/20 rounded flex items-center justify-center text-brand-teal">
                    <Video size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">Week 2 Check-in</p>
                    <p className="text-[8px] text-white/40 uppercase tracking-widest">2 Days Ago</p>
                  </div>
                </div>
                <CheckCircle size={14} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Retreats & Store */}
        <div className="card-gradient p-8 space-y-6 md:col-span-2 lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="space-y-4 md:pr-8">
              <div className="flex items-center gap-4 mb-6">
                <MapPin size={20} className="text-brand-teal" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Retreat Status</h3>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Upcoming Retreats</p>
              <div className="p-4 bg-white/5 rounded-xl flex items-center justify-between border border-white/5">
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-tight">Miami Beach Immersion</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Oct 12 - 15, 2026</p>
                </div>
                <span className="px-3 py-1 bg-brand-teal/20 text-brand-teal text-[10px] uppercase tracking-widest font-bold rounded-full">
                  Confirmed
                </span>
              </div>
            </div>
            
            <div className="space-y-4 pt-8 md:pt-0 md:pl-8">
              <div className="flex items-center gap-4 mb-6">
                <ShoppingBag size={20} className="text-brand-coral" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Recent Order</h3>
              </div>
              {user.orderHistory && user.orderHistory.length > 0 ? (
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm uppercase tracking-tight">Order #{user.orderHistory[0].id.slice(-6).toUpperCase()}</h4>
                    <span className="text-brand-teal font-bold">${user.orderHistory[0].total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{user.orderHistory[0].items.length} items</p>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] uppercase tracking-widest font-bold rounded">
                      {user.orderHistory[0].fulfillment_status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white/5 rounded-xl text-center border-dashed border border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">No recent orders</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
