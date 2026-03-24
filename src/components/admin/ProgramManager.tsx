import React from 'react';
import { motion } from 'motion/react';
import { 
  ListChecks, Plus, Trash2, Edit2, 
  Users, Clock, PlayCircle, Star,
  TrendingUp, ClipboardList
} from 'lucide-react';
import { Program, Athlete } from '../../types';

interface ProgramManagerProps {
  programs: Program[];
  athletes: Athlete[];
  onAdd: () => void;
  onEdit: (program: Program) => void;
  onDelete: (id: string) => void;
}

export const ProgramManager = ({ 
  programs, athletes, onAdd, onEdit, onDelete 
}: ProgramManagerProps) => {
  return (
    <div className="space-y-12 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">System <span className="text-brand-teal">Architect</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Design and deploy elite training protocols and multi-week programs.</p>
        </div>
        <button 
          onClick={onAdd}
          className="px-8 py-4 bg-brand-teal text-black font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-3 hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] transition-all transform hover:-translate-y-1"
        >
          <Plus size={18} /> Deploy Program
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.map((program, i) => (
          <motion.div 
            key={program.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="card-gradient group relative overflow-hidden flex flex-col h-full border border-white/5 hover:border-brand-teal/30 transition-all rounded-[2rem]"
          >
            <div className="p-8 space-y-6 flex-grow ">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-brand-teal/10 text-brand-teal border border-brand-teal/20 group-hover:scale-110 transition-transform">
                  <ListChecks size={20} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button onClick={() => onEdit(program)} className="p-2.5 bg-white/5 hover:bg-brand-teal hover:text-black rounded-xl text-white/40 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDelete(program.id)} className="p-2.5 bg-white/5 hover:bg-brand-coral hover:text-white rounded-xl text-white/40 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] uppercase tracking-widest text-brand-teal font-black border border-brand-teal/30 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(45,212,191,0.1)]">
                    {program.type || 'Standard'}
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">
                    {program.duration_weeks || 4} Weeks
                  </span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter group-hover:text-brand-teal transition-colors">
                  {program.title}
                </h3>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4 text-[10px] text-white/40 uppercase tracking-widest font-black">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-brand-teal" />
                    <span>{program.difficulty || 'Advanced'}</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                    <Star size={12} className="text-brand-teal" />
                    <span>{program.sessions?.length || 0} Modules</span>
                  </div>
                </div>
                <p className="text-xs text-white/20 leading-relaxed font-light italic line-clamp-2">
                  {program.description || "A comprehensive elite protocol designed for maximizing human performance through functional movement."}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black uppercase border border-white/10 text-brand-teal">
                  {athletes.find(a => a.id === program.athlete_id)?.name[0] || 'F'}
                </div>
                <p className="text-[10px] uppercase tracking-widest font-black text-white/60">
                  {athletes.find(a => a.id === program.athlete_id)?.name || 'FMF Global'}
                </p>
              </div>
            </div>

            <div className="px-8 pb-8 pt-2 flex gap-3 mt-auto">
              <button className="flex-1 py-3 bg-white/5 group-hover:bg-brand-teal/10 rounded-xl text-[9px] uppercase tracking-[0.2em] font-black transition-all border border-white/5 group-hover:border-brand-teal/20 flex items-center justify-center gap-2 text-white/40 group-hover:text-brand-teal hover:bg-brand-teal hover:text-black">
                <TrendingUp size={12} /> Analytics
              </button>
              <button className="flex-1 py-3 bg-white/5 group-hover:bg-white/10 rounded-xl text-[9px] uppercase tracking-[0.2em] font-black transition-all border border-white/5 group-hover:border-brand-teal/20 flex items-center justify-center gap-2 text-white/40 group-hover:text-white">
                <ClipboardList size={12} /> Structure
              </button>
            </div>
          </motion.div>
        ))}
        {programs.length === 0 && (
          <div className="col-span-full py-32 text-center card-gradient border-dashed border-2 border-white/5 rounded-[3rem]">
            <ListChecks size={64} className="mx-auto text-white/5 mb-6 opacity-20" />
            <h3 className="text-xl font-bold uppercase tracking-tighter">Architecture Empty</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mt-2">Begin your legacy by architecting your first training protocol.</p>
          </div>
        )}
      </div>
    </div>
  );
};
