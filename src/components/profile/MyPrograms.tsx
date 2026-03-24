import { motion } from 'motion/react';
import { PlaySquare, CheckCircle, ArrowRight, Play, Calendar } from 'lucide-react';
import { UserProfile } from '../../types';

export const MyPrograms = ({ user }: { user: UserProfile }) => {
  // Using dummy structure matching types for demo
  const activePrograms = [
    {
      id: 'p1',
      title: '30-Day Core Blast',
      phase: 'Phase 2: Endurance',
      completion: 45,
      videosAssigned: 12,
      videosCompleted: 5,
      coachNotes: 'Focus on breathing during hollow body holds. Form over reps this week!',
      dateStarted: '2026-08-01'
    }
  ];

  const completedPrograms = [
    {
      id: 'p2',
      title: 'Elite Foundation',
      completionDate: '2026-07-28',
      score: 95
    }
  ];

  return (
    <div className="space-y-12 fade-in">
      <header className="space-y-4">
        <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
          My <span className="text-brand-teal">Programs</span>
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
          Programs assigned by your coach or purchased from the catalog.
        </p>
      </header>

      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
          <PlaySquare size={20} className="text-brand-teal" />
          <h3 className="text-xl font-bold uppercase tracking-tight">Active Training Blocks</h3>
        </div>

        {activePrograms.length > 0 ? activePrograms.map((program) => (
          <div key={program.id} className="card-gradient p-8 md:p-10 space-y-8 rounded-3xl border border-brand-teal/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <h4 className="text-2xl font-bold uppercase tracking-tighter">{program.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-brand-teal text-black text-[8px] uppercase tracking-widest font-bold rounded">
                    {program.phase}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">
                    Started {new Date(program.dateStarted).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-bold font-mono text-brand-teal">{program.completion}%</span>
                <span className="text-[8px] uppercase tracking-widest text-white/40">Completion Rate</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-brand-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]" 
                initial={{ width: 0 }} 
                animate={{ width: `${program.completion}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Coach Notes</h5>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 border-l-4 border-l-brand-teal text-sm text-white/80 font-light italic leading-relaxed">
                  "{program.coachNotes}"
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Quick Actions</h5>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-brand-teal text-black hover:bg-white text-[10px] uppercase tracking-widest font-bold rounded-xl transition-colors shadow-lg shadow-brand-teal/20">
                    <Play size={14} className="translate-x-0.5" /> Next Session
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase tracking-widest font-bold rounded-xl transition-colors border border-white/10">
                    <Calendar size={14} /> Schedule Block
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="card-gradient p-12 text-center rounded-3xl border-dashed border-2 border-white/10 text-white/40">
            <p className="text-xs uppercase tracking-widest font-bold mb-4">No active programs at the moment.</p>
            <button className="px-6 py-2 border border-brand-teal text-brand-teal hover:bg-brand-teal/10 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all">
              Browse Workouts
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6 pt-12">
        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
          <CheckCircle size={20} className="text-white/40" />
          <h3 className="text-lg font-bold uppercase tracking-tight text-white/80">Completed Blocks</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedPrograms.map(prog => (
            <div key={prog.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-brand-teal/20 transition-colors flex justify-between items-center group cursor-pointer">
              <div className="space-y-1">
                <h4 className="text-sm font-bold uppercase tracking-tight group-hover:text-brand-teal transition-colors">{prog.title}</h4>
                <p className="text-[10px] uppercase tracking-widest text-white/40">Completed: {new Date(prog.completionDate).toLocaleDateString()}</p>
              </div>
              <ArrowRight size={16} className="text-white/20 group-hover:text-brand-teal transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
