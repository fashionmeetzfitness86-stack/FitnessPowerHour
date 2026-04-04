import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlaySquare, CheckCircle, ArrowRight, Play, Calendar, Clock, Lock, Plus, User, Award, MessageSquare, Edit3, X, Save, Trash2 } from 'lucide-react';
import { UserProfile, Program, ProgramAssignment } from '../../types';
import { supabase } from '../../supabase';

export const MyPrograms = ({ user }: { user: UserProfile }) => {
  const [assignments, setAssignments] = useState<(ProgramAssignment & { program: Program })[]>([]);
  const [userCreatedPrograms, setUserCreatedPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [newProgram, setNewProgram] = useState({
    title: '',
    description: '',
    video_ids: [] as string[]
  });
  const [availableVideos, setAvailableVideos] = useState<any[]>([]);
  const [playingAssignmentId, setPlayingAssignmentId] = useState<string | null>(null);

  const completeAssignment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_program_assignments')
        .update({ completion_percent: 100, status: 'completed' })
        .eq('id', id);
      if (error) throw error;
      setPlayingAssignmentId(null);
      fetchAssignments();
    } catch (err) {
      console.error('Error completing assignment:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_program_assignments')
        .select(`
          *,
          program:programs(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('created_by', user.id)
        .eq('status', 'published');
      if (error) throw error;
      setUserCreatedPrograms(data || []);
    } catch (err) {
      console.error('Error fetching user programs:', err);
    }
  };

  const fetchVideos = async () => {
    try {
      const { data } = await supabase.from('videos').select('*');
      setAvailableVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  const createProgram = async () => {
    if (!newProgram.title) return;
    try {
      const { data: prog, error: pError } = await supabase
        .from('programs')
        .insert({
          title: newProgram.title,
          description: newProgram.description,
          video_ids: newProgram.video_ids,
          created_by: user.id,
          status: 'published'
        })
        .select()
        .single();
      
      if (pError) throw pError;

      // Assign to self
      await supabase.from('user_program_assignments').insert({
        user_id: user.id,
        program_id: prog.id,
        assigned_by: user.id,
        status: 'active'
      });

      setShowCreator(false);
      setNewProgram({ title: '', description: '', video_ids: [] });
      fetchAssignments();
      fetchUserPrograms();
    } catch (err) {
      console.error('Error creating program:', err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchUserPrograms();
    fetchVideos();
  }, [user.id]);

  const activePrograms = assignments.filter(a => a.status === 'active');
  const completedPrograms = assignments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <div className="space-y-4">
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            My <span className="text-brand-teal">Programs</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
            Programs assigned by your coach or created via your custom neural protocol.
          </p>
        </div>
        <button 
          onClick={() => setShowCreator(true)}
          className="flex items-center gap-4 px-8 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-2xl shadow-glow-teal hover:scale-105 transition-all"
        >
          <Plus size={16} /> Create Custom Program
        </button>
      </header>

      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
          <PlaySquare size={20} className="text-brand-teal" />
          <h3 className="text-xl font-bold uppercase tracking-tight">Active Training Blocks</h3>
        </div>

        {activePrograms.length > 0 ? activePrograms.map((assignment) => (
          <div key={assignment.id} className="card-gradient p-8 md:p-10 space-y-8 rounded-3xl border border-brand-teal/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <h4 className="text-2xl font-bold uppercase tracking-tighter">{assignment.program.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-brand-teal text-black text-[8px] uppercase tracking-widest font-bold rounded">
                    {assignment.program.type || 'FMF Protocol'}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">
                    Initialized {new Date(assignment.assigned_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-bold font-mono text-brand-teal">{assignment.completion_percent || 0}%</span>
                <span className="text-[8px] uppercase tracking-widest text-white/40">Completion Matrix</span>
              </div>
            </div>

            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-brand-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]" 
                initial={{ width: 0 }} 
                animate={{ width: `${assignment.completion_percent || 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Administrative Guidance</h5>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 border-l-4 border-l-brand-teal text-sm text-white/80 font-light italic leading-relaxed">
                   {assignment.notes || "No coach notes assigned for this training block."}
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Neural Command</h5>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setPlayingAssignmentId(assignment.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-brand-teal text-black hover:bg-white text-[10px] uppercase tracking-widest font-bold rounded-xl transition-colors shadow-lg shadow-brand-teal/20"
                  >
                    <Play size={14} className="translate-x-0.5" /> Synchronize Session
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase tracking-widest font-bold rounded-xl transition-colors border border-white/10">
                    <Calendar size={14} /> Schedule Sync
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="card-gradient p-12 text-center rounded-3xl border-dashed border-2 border-white/10 text-white/40">
            <p className="text-xs uppercase tracking-widest font-bold mb-4">No authorized training blocks detected.</p>
            <button className="px-6 py-2 border border-brand-teal text-brand-teal hover:bg-brand-teal/10 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all">
              Initialize Protocol
            </button>
          </div>
        )}
      </div>

      {user.tier !== 'Elite' && (
        <div className="card-gradient p-8 flex items-center gap-8 border-brand-coral/20 bg-brand-coral/5 rounded-[2.5rem]">
           <div className="w-16 h-16 rounded-full bg-brand-coral/10 flex items-center justify-center text-brand-coral border border-brand-coral/20 shadow-glow-coral">
             <Lock size={24} />
           </div>
           <div className="flex-grow">
              <h4 className="text-lg font-bold uppercase tracking-tight text-white">Elite Analytics Locked</h4>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-2">
                Advanced physiological tracking and real-time biometric analysis are reserved for Elite Tier athletes. 
              </p>
           </div>
           <button className="px-8 py-4 bg-brand-coral text-white text-[10px] uppercase tracking-widest font-black rounded-xl hover:bg-white hover:text-black transition-all shadow-lg">
             Unlock Tracking
           </button>
        </div>
      )}

      <div className="space-y-6 pt-12">
        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
          <CheckCircle size={20} className="text-white/40" />
          <h3 className="text-lg font-bold uppercase tracking-tight text-white/80">Archived Blocks</h3>
        </div>
        {completedPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedPrograms.map(prog => (
              <div key={prog.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-brand-teal/20 transition-colors flex justify-between items-center group cursor-pointer">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-tight group-hover:text-brand-teal transition-colors">{prog.program.title}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Archived On {new Date(prog.assigned_at).toLocaleDateString()}</p>
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-brand-teal transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold text-center py-12">No archived blocks detected.</p>
        )}
      </div>

      {/* Program Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="card-gradient w-full max-w-4xl p-12 space-y-12 rounded-[4rem] border border-brand-teal/20 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
             >
                <button 
                  onClick={() => setShowCreator(false)}
                  className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center text-brand-teal border border-brand-teal/20">
                    <Edit3 size={32} />
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Program <span className="text-brand-teal">Architect</span></h3>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Construct a custom logic block tailored to your neural objectives.</p>
                </div>

                <div className="flex-grow overflow-y-auto pr-6 custom-scrollbar space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-2">Protocol Label</label>
                            <input 
                              type="text"
                              value={newProgram.title}
                              onChange={e => setNewProgram({...newProgram, title: e.target.value})}
                              placeholder="e.g. Hyper-Tension Block A"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-brand-teal outline-none transition-colors"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-2">Logical Intent</label>
                            <textarea 
                              value={newProgram.description}
                              onChange={e => setNewProgram({...newProgram, description: e.target.value})}
                              placeholder="Define the primary objective of this protocol..."
                              rows={4}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-brand-teal outline-none transition-colors resize-none"
                            />
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Video Matrix Execution</label>
                            <span className="text-[10px] font-black text-brand-teal">{newProgram.video_ids.length} Loaded</span>
                         </div>
                         <div className="h-64 bg-white/5 border border-white/10 rounded-3xl overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {availableVideos.map(video => {
                               const isSelected = newProgram.video_ids.includes(video.id);
                               return (
                                  <button 
                                    key={video.id}
                                    onClick={() => {
                                       if (isSelected) setNewProgram({...newProgram, video_ids: newProgram.video_ids.filter(id => id !== video.id)});
                                       else setNewProgram({...newProgram, video_ids: [...newProgram.video_ids, video.id]});
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${isSelected ? 'bg-brand-teal/10 border-brand-teal/30 text-brand-teal' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:bg-white/[0.07]'}`}
                                  >
                                     <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 rounded border border-white/10 overflow-hidden">
                                           <img src={video.thumbnail_url} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-tight font-black">{video.title}</span>
                                     </div>
                                     {isSelected ? <CheckCircle size={14} /> : <Plus size={14} />}
                                  </button>
                               );
                            })}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                   <button 
                     onClick={createProgram}
                     className="flex-1 py-5 bg-brand-teal text-black text-[11px] uppercase tracking-[0.4em] font-black rounded-3xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-4"
                   >
                      Authorize Protocol <Save size={18} />
                   </button>
                   <button 
                     onClick={() => setShowCreator(false)}
                     className="flex-1 py-5 border border-white/10 text-white/40 text-[11px] uppercase tracking-[0.4em] font-black rounded-3xl hover:text-white hover:bg-white/5 transition-all"
                   >
                      Abort Initialization
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Playback Simulation Modal */}
      <AnimatePresence>
        {playingAssignmentId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl card-gradient p-12 rounded-[3rem] border border-brand-teal/20 space-y-8 flex flex-col items-center justify-center text-center relative"
            >
              <button onClick={() => setPlayingAssignmentId(null)} className="absolute top-8 right-8 text-white/20 hover:text-brand-coral"><X size={24} /></button>
              <div className="w-24 h-24 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-4 animate-pulse">
                <Play size={40} className="translate-x-1" />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Neural Link <span className="text-brand-teal">Active</span></h3>
                {(() => {
                  const assignment = assignments.find((a: any) => a.id === playingAssignmentId);
                  const firstVid = assignment?.program?.video_ids?.[0];
                  return firstVid ? (
                    <div className="w-full aspect-video mt-8 rounded-xl overflow-hidden border border-brand-teal/20">
                      <iframe
                        src={`https://www.youtube.com/embed/${firstVid.split('v=')[1] || firstVid}?autoplay=1&enablejsapi=1`}
                        className="w-full h-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={(e) => {
                          const iframe = e.target as HTMLIFrameElement;
                          if (!iframe.contentWindow) return;
                          const handleMessage = (event: MessageEvent) => {
                            if (event.origin !== 'https://www.youtube.com') return;
                            try {
                              const data = JSON.parse(event.data);
                              if (data.event === 'onStateChange' && data.info === 0) {
                                completeAssignment(playingAssignmentId);
                              }
                            } catch (err) {}
                          };
                          window.addEventListener('message', handleMessage);
                          return () => window.removeEventListener('message', handleMessage);
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-coral mt-2">Video matrix missing</p>
                  );
                })()}
              </div>
              <p className="text-sm text-white/60 max-w-lg leading-relaxed font-light">
                In a production environment, the embedded video element fires an `onEnded` event when playback completes. This triggers an automated state update, syncing the user's progress directly to the database.
              </p>
              <button 
                onClick={() => completeAssignment(playingAssignmentId)}
                className="px-12 py-5 bg-brand-teal text-black text-[11px] uppercase tracking-[0.4em] font-black rounded-3xl hover:shadow-glow-teal hover:scale-105 active:scale-95 transition-all mt-8"
              >
                Trigger onEnded Event (100% Completion)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
