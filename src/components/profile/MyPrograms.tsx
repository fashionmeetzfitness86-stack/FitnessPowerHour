import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlaySquare, CheckCircle, ArrowRight, Play, Calendar, FileText, CheckCircle2, MessageSquare, Award } from 'lucide-react';
import { UserProfile, UserProgramAssignment, ProgramTemplate, ProgramTemplateVideo } from '../../types';
import { supabase } from '../../supabase';
import { useAuth } from '../../hooks/useAuth';

export const MyPrograms = ({ user }: { user: UserProfile }) => {
  const [assignments, setAssignments] = useState<(UserProgramAssignment & { program_template: ProgramTemplate })[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingAssignmentId, setPlayingAssignmentId] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_program_assignments')
        .select(`
          *,
          program_template:program_templates(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setAssignments(data as any || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeAssignment = async (id: string, currentPercent: number) => {
    try {
      // Simulate simple increment progress logic
      const newPercent = Math.min(currentPercent + 10, 100);
      const newStatus = newPercent === 100 ? 'completed' : 'active';
      
      await supabase
        .from('user_program_assignments')
        .update({ completion_percent: newPercent, status: newStatus })
        .eq('id', id);
        
      setPlayingAssignmentId(null);
      fetchAssignments();
    } catch (err) {
      console.error('Error completing session:', err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user.id]);

  const activePrograms = assignments.filter(a => a.status === 'active' || a.status === 'assigned');
  const completedPrograms = assignments.filter(a => a.status === 'completed');

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
         <div className="w-16 h-16 border-4 border-brand-teal border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(45,212,191,0.2)]" />
         <div className="text-[12px] uppercase tracking-[0.4em] text-white/60 font-black animate-pulse">Syncing Matrix...</div>
       </div>
    );
  }

  return (
    <div className="space-y-12 fade-in">
      <header className="flex justify-between items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <div className="space-y-4">
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            My <span className="text-brand-teal">Programs</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
            Execute your required protocols. Track your progress. Never break discipline.
          </p>
        </div>
      </header>

      {/* ACTIVE PROGRAMS */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
          <PlaySquare size={20} className="text-brand-teal" />
          <h3 className="text-xl font-bold uppercase tracking-tight">Active Deployments</h3>
        </div>

        {activePrograms.length === 0 ? (
          <div className="py-24 text-center card-gradient border-2 border-dashed border-white/5 rounded-3xl space-y-4">
            <Calendar size={48} className="mx-auto text-white/10" />
            <h4 className="text-xl font-black uppercase tracking-tighter text-white/40">No Systems Active</h4>
            <p className="text-[10px] tracking-widest uppercase font-bold text-white/20">Your training matrix is currently clear. Await coach deployment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {activePrograms.map(assignment => (
              <div key={assignment.id} className="card-gradient group relative overflow-hidden flex flex-col border border-white/10 hover:border-brand-teal/30 transition-all rounded-3xl p-8">
                {/* Visual Background Accent based on Phase */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 pointer-events-none transition-all duration-700 ${assignment.program_template?.phase === 'Phase 1' ? 'bg-amber-500/10' : assignment.program_template?.phase === 'Phase 2' ? 'bg-brand-teal/10' : 'bg-brand-coral/10'}`} />
                
                <div className="flex justify-between items-start mb-6">
                   <div>
                     <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest border mb-2 inline-block ${assignment.program_template?.phase === 'Phase 1' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : assignment.program_template?.phase === 'Phase 2' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' : 'bg-brand-coral/10 text-brand-coral border-brand-coral/20'}`}>
                        {assignment.program_template?.phase}
                     </span>
                     <h3 className="text-2xl font-black uppercase tracking-tight leading-none group-hover:text-brand-teal transition-colors">
                       {assignment.program_template?.title}
                     </h3>
                     <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mt-2">Assigned by: Coach {assignment.assigned_by_role === 'super_admin' ? 'SysAdmin' : 'Athlete'}</p>
                   </div>
                </div>

                <div className="flex-grow space-y-4">
                   <p className="text-xs text-white/50 leading-relaxed italic line-clamp-2">"{assignment.program_template?.description}"</p>
                   {assignment.custom_notes && (
                      <div className="bg-brand-teal/5 border-l-2 border-brand-teal p-3 rounded-r-xl">
                         <div className="flex items-center gap-2 mb-1">
                            <MessageSquare size={12} className="text-brand-teal" />
                            <span className="text-[9px] uppercase tracking-widest font-black text-brand-teal">Coach Note</span>
                         </div>
                         <p className="text-[10px] text-white/60 leading-relaxed">"{assignment.custom_notes}"</p>
                      </div>
                   )}

                   <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Completion Matrix</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-brand-teal">{assignment.completion_percent}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <div className="h-full bg-brand-teal transition-all duration-1000" style={{ width: `${assignment.completion_percent}%` }} />
                      </div>
                   </div>
                </div>

                <div className="pt-6 mt-6 flex gap-3">
                   {playingAssignmentId === assignment.id ? (
                      <div className="flex w-full gap-3 animate-in slide-in-from-bottom">
                         <button onClick={() => completeAssignment(assignment.id, assignment.completion_percent)} className="flex-1 py-4 bg-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-500/30 transition-all border border-emerald-500/30 flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} /> Mark Complete
                         </button>
                         <button onClick={() => setPlayingAssignmentId(null)} className="py-4 px-6 bg-white/5 text-white/40 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">Cancel</button>
                      </div>
                   ) : (
                      <button onClick={() => setPlayingAssignmentId(assignment.id)} className="w-full py-4 bg-white/5 group-hover:bg-brand-teal group-hover:text-black text-white/60 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl flex items-center justify-center gap-2">
                         <Play size={14} /> Start Next Session
                      </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED PROGRAMS */}
      {completedPrograms.length > 0 && (
         <div className="space-y-6 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4 pb-4">
              <Award size={20} className="text-white/40" />
              <h3 className="text-xl font-bold uppercase tracking-tight text-white/60">Completed Systems</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {completedPrograms.map(assignment => (
                  <div key={assignment.id} className="card-gradient rounded-3xl p-6 border border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 flex items-center gap-2 bg-emerald-500/10 px-2 py-1 rounded">
                           <CheckCircle2 size={12} /> Mastered
                        </span>
                     </div>
                     <h4 className="text-lg font-black uppercase tracking-tight">{assignment.program_template?.title}</h4>
                     <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">{assignment.program_template?.phase}</p>
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
};
