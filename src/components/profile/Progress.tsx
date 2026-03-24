import { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Activity, Target, Zap, ChevronRight, Play } from 'lucide-react';
import { UserProfile } from '../../types';

export const Progress = ({ user }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'metrics'>('overview');
  
  const streak = user.streak || 0;
  const hoursTrained = Math.floor((user.workoutLogs?.reduce((acc, log) => acc + log.duration, 0) || 0) / 60);
  const completedSessions = user.workoutLogs?.length || 0;

  const milestones = [
    { title: 'First Workout', completed: true },
    { title: '7 Day Streak', completed: streak >= 7 },
    { title: '14 Day Streak', completed: streak >= 14 },
    { title: '10 Hours Trained', completed: hoursTrained >= 10 },
  ];

  return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Progress <span className="text-brand-teal">Tracker</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Monitor your markers, performance, and milestones.
          </p>
        </div>
        <div className="flex bg-white/5 rounded-full p-1 overflow-x-auto no-scrollbar">
          {['overview', 'logs', 'metrics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'overview' | 'logs' | 'metrics')}
              className={`px-6 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all ${
                activeTab === tab ? 'bg-brand-teal text-black shadow-lg' : 'text-white/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stat Block */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Current Streak', value: streak, unit: 'Days', icon: Zap },
              { label: 'Sessions', value: completedSessions, unit: 'Total', icon: Activity },
              { label: 'Time Trained', value: hoursTrained, unit: 'Hours', icon: Target },
              { label: 'Check-ins', value: 2, unit: 'Videos', icon: Play },
            ].map((stat, i) => (
              <div key={i} className="card-gradient p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 border border-white/5 hover:border-brand-teal/30 transition-all group">
                <stat.icon size={20} className="text-white/20 group-hover:text-brand-teal mb-2 transition-colors" />
                <span className="text-3xl font-bold font-mono">{stat.value}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40">{stat.label} <br/> ({stat.unit})</span>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div className="card-gradient p-8 space-y-8 lg:col-span-1">
            <div className="flex items-center gap-4">
              <Trophy size={20} className="text-brand-teal" />
              <h3 className="text-lg font-bold uppercase tracking-tight">Milestones</h3>
            </div>
            <div className="space-y-6">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-4 relative">
                  {i !== milestones.length - 1 && (
                    <div className={`absolute top-6 bottom-0 left-[11px] w-0.5 ${m.completed ? 'bg-brand-teal' : 'bg-white/5'} transform -translate-y-4 h-full`} />
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 flex-shrink-0 ${
                    m.completed ? 'border-brand-teal bg-brand-teal/20 text-brand-teal' : 'border-white/10 bg-brand-black text-white/20'
                  }`}>
                    {m.completed && <div className="w-1.5 h-1.5 bg-brand-teal rounded-full" />}
                  </div>
                  <span className={`text-xs uppercase tracking-widest font-bold ${m.completed ? 'text-white' : 'text-white/40'}`}>
                    {m.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Summary Chart Placeholder */}
          <div className="card-gradient p-8 space-y-8 lg:col-span-2 flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold uppercase tracking-tight">Weekly Summary</h3>
              <button className="text-[10px] uppercase tracking-widest text-brand-teal font-bold hover:underline py-1">View All</button>
            </div>
            
            <div className="flex-grow flex items-end justify-between gap-2 md:gap-6 pt-12 relative border-b border-white/10 pb-6">
              {/* Decorative Chart Lines */}
              <div className="absolute top-0 w-full border-b border-dashed border-white/5" />
              <div className="absolute top-1/2 w-full border-b border-dashed border-white/5" />
              
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const height = i === 1 || i === 4 ? 80 : i === 2 ? 60 : i === 5 ? 40 : 20;
                const active = day === 'Wed';
                return (
                  <div key={day} className="flex flex-col items-center gap-4 w-full group cursor-crosshair z-10">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`w-full max-w-[40px] rounded-t-sm transition-all ${
                        active ? 'bg-brand-teal' : 'bg-white/5 group-hover:bg-white/20'
                      }`}
                    />
                    <span className={`text-[8px] uppercase tracking-widest font-bold ${active ? 'text-brand-teal' : 'text-white/40'}`}>{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Target</p>
                <p className="text-sm font-bold text-white">4 Sessions</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Achieved</p>
                <p className="text-sm font-bold text-brand-teal">2 Sessions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card-gradient p-8">
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-8">
            <h3 className="text-lg font-bold uppercase tracking-tight">Workout Logs</h3>
            <button className="px-6 py-2 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-bold rounded">Log Session</button>
          </div>
          
          <div className="space-y-4">
            {user.workoutLogs && user.workoutLogs.length > 0 ? user.workoutLogs.map(log => (
              <div key={log.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center hover:border-brand-teal/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase">{new Date(log.completed_at).toLocaleDateString('en-US', { day: '2-digit' })}</span>
                    <span className="text-[8px] uppercase tracking-widest text-white/40">{new Date(log.completed_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">{(log as any).sessionTitle || 'Training Session'}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{log.duration} Minutes</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-brand-teal transition-colors" />
              </div>
            )) : (
              <p className="text-xs uppercase tracking-widest text-white/40 text-center py-12">No workouts logged yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="card-gradient p-8 text-center py-20">
          <Target size={40} className="mx-auto text-brand-coral mb-6 opacity-50" />
          <h3 className="text-xl font-bold uppercase tracking-tight mb-2">Metrics & Measurements</h3>
          <p className="text-[10px] uppercase tracking-widest text-white/40 max-w-sm mx-auto">
            Log your body metrics, measurements, and upload transformation photos to visually track your journey over time.
          </p>
          <button className="mt-8 px-8 py-3 bg-brand-coral text-black text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(251,113,133,0.4)] transition-all">
            Unlock Advanced Tracking
          </button>
        </div>
      )}
    </div>
  );
};
