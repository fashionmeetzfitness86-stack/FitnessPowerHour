import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, PlayCircle, Activity, Star, User
} from 'lucide-react';
import { supabase } from '../../supabase';
import { UserProfile, Video, ProgramTemplate, UserProgramAssignment } from '../../types';
import { ProgramManager } from '../admin/ProgramManager';

interface AthleteDashboardProps {
  athleteUser: UserProfile;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const AthleteDashboard = ({ athleteUser, showToast }: AthleteDashboardProps) => {
  const [activeTab, setActiveTab] = useState('programs');
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [assignments, setAssignments] = useState<UserProgramAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAthleteData();
  }, [athleteUser.id]);

  const fetchAthleteData = async () => {
    setLoading(true);
    try {
      const [
        usersRes, vDataRes, templatesRes, assignmentsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('videos').select('*'),
        supabase.from('program_templates').select('*'),
        supabase.from('user_program_assignments').select('*').or(`assigned_by_user_id.eq.${athleteUser.id}`)
      ]);

      setUsers(usersRes.data || []);
      setVideos(vDataRes.data || []);
      // Athletes can only manage templates they created OR we can let them see all, but let's filter to their own
      setTemplates((templatesRes.data || []).filter((t: any) => t.created_by_user_id === athleteUser.id));
      setAssignments(assignmentsRes.data || []);

    } catch (err) {
      showToast('Synchronization Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgramTemplate = async (data: Partial<ProgramTemplate>) => {
    try {
      if (data.id) {
        const { error } = await supabase.from('program_templates').update(data).eq('id', data.id);
        if (error) throw error;
        setTemplates(prev => prev.map(p => p.id === data.id ? { ...p, ...data } as ProgramTemplate : p));
        showToast('System protocol updated', 'success');
      } else {
        const { data: newP, error } = await supabase.from('program_templates').insert({ ...data, created_by_user_id: athleteUser.id }).select().single();
        if (error) throw error;
        if (newP) setTemplates(prev => [newP, ...prev]);
        showToast('New system template initialized', 'success');
      }
    } catch (err) { showToast('Protocol sync failed', 'error'); }
  };

  const handleAssignProgram = async (userId: string, templateId: string, notes: string) => {
    try {
      const { data: assignment, error } = await supabase.from('user_program_assignments').insert({
        user_id: userId,
        program_template_id: templateId,
        assigned_by_user_id: athleteUser.id,
        assigned_by_role: athleteUser.role,
        start_date: new Date().toISOString().split('T')[0],
        custom_notes: notes,
        status: 'active'
      }).select().single();
      
      if (error) throw error;
      if (assignment) setAssignments(prev => [assignment, ...prev]);
      showToast('Program assigned successfully', 'success');
    } catch (err) {
      showToast('Assignment deployment failed', 'error');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await supabase.from('program_templates').delete().eq('id', id);
      setTemplates(prev => prev.filter(p => p.id !== id));
      showToast('Template purged', 'success');
    } catch (error) {
      showToast('Template purge failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white p-6 lg:p-12 space-y-12 fade-in">
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="p-3.5 bg-brand-coral/10 rounded-2xl border border-brand-coral/20 text-brand-coral border-glow-brand-coral-subtle rotate-3">
                <Star size={24} fill="currentColor" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Athlete Command</h1>
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 mt-2 font-black">Authorized: {athleteUser.full_name || athleteUser.email}</p>
             </div>
          </div>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit">
          {[
            { id: 'programs', label: 'Program Control', icon: PlayCircle },
            { id: 'metrics', label: 'Yield Analytics', icon: Activity },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[9px] uppercase tracking-[0.3em] font-black transition-all ${
                activeTab === t.id ? 'bg-brand-coral text-black shadow-glow-coral' : 'text-white/30 hover:text-white'
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="py-20 text-center animate-pulse">
           <div className="w-16 h-16 border-2 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-glow-coral" />
           <p className="text-[10px] uppercase tracking-[0.5em] text-brand-coral font-black">Decrypting Dashboard State...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'programs' ? (
            <motion.div key="programs" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
               <div className="card-gradient p-8 rounded-3xl border border-white/5">
                 <ProgramManager 
                    templates={templates} 
                    assignments={assignments}
                    users={users} 
                    videos={videos} 
                    onAddTemplate={() => handleSaveProgramTemplate({ title: 'New Template Module', status: 'draft' })} 
                    onEditTemplate={handleSaveProgramTemplate} 
                    onAssignProgram={handleAssignProgram}
                    onDeleteTemplate={handleDeleteTemplate} 
                  />
               </div>
            </motion.div>
          ) : (
             <motion.div 
               key="metrics" 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="flex flex-col items-center justify-center py-40 card-gradient border-dashed border border-white/5 rounded-[4rem] text-center space-y-8"
             >
                <div className="w-24 h-24 rounded-full bg-brand-coral/10 border border-brand-coral/20 flex items-center justify-center text-brand-coral border-glow-brand-coral shadow-glow-coral animate-bounce">
                   <Activity size={48} />
                </div>
                <div className="space-y-4">
                   <h2 className="text-4xl font-black uppercase tracking-tighter">Yield Analytics Blocked</h2>
                   <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black max-w-sm mx-auto leading-relaxed italic italic-glow-brand-coral">
                      Operational metrics are currently undergoing high-level encryption. Authorized analytics will be available in Phase 4.
                   </p>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
