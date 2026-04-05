import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ListChecks, Search, Plus, Filter, ClipboardList,
  Target, Activity, Clock, FileText, CheckCircle2, User, PlayCircle, Trash2, Edit2
} from 'lucide-react';
import { ProgramTemplate, UserProgramAssignment, UserProfile, Video } from '../../types';

interface ProgramManagerProps {
  templates: ProgramTemplate[];
  assignments: UserProgramAssignment[];
  users: UserProfile[];
  videos: Video[];
  onAddTemplate: () => void;
  onEditTemplate: (template: ProgramTemplate) => void;
  onAssignProgram: (userId: string, templateId: string, notes: string) => void;
  onDeleteTemplate: (id: string) => void;
}

export const ProgramManager = ({ 
  templates, assignments, users, videos,
  onAddTemplate, onEditTemplate, onAssignProgram, onDeleteTemplate
}: ProgramManagerProps) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'assign' | 'active'>('templates');
  
  // Templates state
  const [searchTemplates, setSearchTemplates] = useState('');
  
  // Assign state
  const [searchUsers, setSearchUsers] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');

  // Active state
  const [searchAssignments, setSearchAssignments] = useState('');

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => t.title.toLowerCase().includes(searchTemplates.toLowerCase()) || t.phase.toLowerCase().includes(searchTemplates.toLowerCase()));
  }, [templates, searchTemplates]);

  const filteredUsers = useMemo(() => {
    if (!searchUsers) return [];
    return users.filter(u => u.full_name?.toLowerCase().includes(searchUsers.toLowerCase()) || u.email.toLowerCase().includes(searchUsers.toLowerCase())).slice(0, 5);
  }, [users, searchUsers]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      const user = users.find(u => u.id === a.user_id);
      return user?.full_name?.toLowerCase().includes(searchAssignments.toLowerCase()) || user?.email.toLowerCase().includes(searchAssignments.toLowerCase());
    });
  }, [assignments, users, searchAssignments]);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && selectedTemplate) {
      onAssignProgram(selectedUser, selectedTemplate, assignmentNotes);
      setSelectedUser(null);
      setSelectedTemplate(null);
      setAssignmentNotes('');
      setActiveTab('active');
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
           <h2 className="text-3xl font-black uppercase tracking-tighter">Program <span className="text-brand-coral">Control</span></h2>
           <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Standardize tracking. Assign phases. Optimize retention.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl w-full md:w-auto">
          <button onClick={() => setActiveTab('templates')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${activeTab === 'templates' ? 'bg-brand-coral text-black shadow-[0_0_20px_rgba(251,113,133,0.3)]' : 'text-white/40 hover:text-white'}`}>Templates</button>
          <button onClick={() => setActiveTab('assign')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${activeTab === 'assign' ? 'bg-brand-teal text-black shadow-glow-teal' : 'text-white/40 hover:text-white'}`}>Deploy</button>
          <button onClick={() => setActiveTab('active')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${activeTab === 'active' ? 'bg-white text-black shadow-glow-white' : 'text-white/40 hover:text-white'}`}>Live Radar</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB A: TEMPLATES */}
        {activeTab === 'templates' && (
          <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-between gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                 <input type="text" placeholder="Search templates..." value={searchTemplates} onChange={e => setSearchTemplates(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors text-white" />
              </div>
              <button onClick={onAddTemplate} className="px-6 py-3 bg-brand-coral text-black font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-2 hover:shadow-[0_0_20px_rgba(251,113,133,0.3)] transition-all">
                <Plus size={16} /> Build Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(t => (
                <div key={t.id} className="card-gradient rounded-3xl p-6 border border-white/5 flex flex-col group hover:border-brand-coral/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[8px] bg-brand-coral/10 text-brand-coral px-2 py-0.5 rounded uppercase tracking-widest font-bold border border-brand-coral/20">{t.phase}</span>
                      <h3 className="text-xl font-black uppercase tracking-tight leading-none mt-2 group-hover:text-brand-coral transition-colors">{t.title}</h3>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => onEditTemplate(t)} className="text-white/20 hover:text-brand-teal"><Edit2 size={14}/></button>
                       <button onClick={() => onDeleteTemplate(t.id)} className="text-white/20 hover:text-brand-coral"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Duration: {t.duration_days} Days | {t.sessions_per_week}x / wk</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-4">Focus: {t.training_focus}</p>
                  <p className="text-xs text-white/50 leading-relaxed italic line-clamp-2">"{t.description}"</p>
                </div>
              ))}
            </div>
            {filteredTemplates.length === 0 && (
               <div className="py-24 text-center border-dashed border border-white/10 rounded-3xl text-white/20">
                  <ListChecks size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-[10px] uppercase tracking-widest">No templates constructed yet.</p>
               </div>
            )}
          </motion.div>
        )}

        {/* TAB B: ASSIGN */}
        {activeTab === 'assign' && (
          <motion.div key="assign" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
             <div className="card-gradient p-8 rounded-3xl border border-white/5 max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-2 mb-8">
                   <Target size={32} className="mx-auto text-brand-teal" />
                   <h3 className="text-xl font-black uppercase tracking-tighter">Deploy Program</h3>
                   <p className="text-[10px] uppercase tracking-widest text-white/40">Push a template explicitly to a user's dashboard matrix.</p>
                </div>

                <form onSubmit={handleAssignSubmit} className="space-y-6 flex flex-col">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">1. Target User</label>
                      {!selectedUser ? (
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                          <input type="text" placeholder="Search by name or email..." value={searchUsers} onChange={e => setSearchUsers(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all text-white" />
                          {filteredUsers.length > 0 && (
                            <div className="absolute top-full mt-2 w-full bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                               {filteredUsers.map(u => (
                                  <div key={u.id} onClick={() => { setSelectedUser(u.id); setSearchUsers(''); }} className="p-3 hover:bg-white/5 rounded-lg cursor-pointer flex justify-between items-center transition-colors">
                                     <span className="font-bold text-sm tracking-tight">{u.full_name}</span>
                                     <span className="text-[10px] text-white/40 font-mono tracking-widest">{u.email}</span>
                                  </div>
                               ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-4">
                           <div className="flex items-center gap-3">
                              <CheckCircle2 size={16} className="text-brand-teal" />
                              <span className="text-sm font-bold tracking-tight">{users.find(u => u.id === selectedUser)?.full_name}</span>
                           </div>
                           <button type="button" onClick={() => setSelectedUser(null)} className="text-[10px] font-bold text-brand-coral uppercase hover:underline">Change</button>
                        </div>
                      )}
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">2. Program Template</label>
                      <select required value={selectedTemplate || ''} onChange={e => setSelectedTemplate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal transition-all text-white appearance-none">
                         <option value="" disabled>Select a Template...</option>
                         {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.phase} - {t.title}</option>
                         ))}
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">3. Coach Notes (Optional)</label>
                      <textarea rows={3} value={assignmentNotes} onChange={e => setAssignmentNotes(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-brand-teal transition-all text-white resize-none" placeholder="Add specific guidance or motivation..." />
                   </div>

                   <button type="submit" disabled={!selectedUser || !selectedTemplate} className="w-full py-5 mt-4 bg-brand-teal text-black rounded-xl text-[10px] uppercase tracking-[0.2em] font-black hover:shadow-glow-teal transition-all disabled:opacity-50">
                     Deploy Program
                   </button>
                </form>
             </div>
          </motion.div>
        )}

        {/* TAB C: LIVE RADAR */}
        {activeTab === 'active' && (
          <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
             <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                 <input type="text" placeholder="Search active deployments by user..." value={searchAssignments} onChange={e => setSearchAssignments(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors text-white max-w-md" />
             </div>
             
             <div className="card-gradient rounded-3xl overflow-hidden border border-white/5">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                         <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">User</th>
                         <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Program</th>
                         <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Deployed</th>
                         <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Progress</th>
                         <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {filteredAssignments.map(a => {
                         const u = users.find(u => u.id === a.user_id);
                         const t = templates.find(t => t.id === a.program_template_id);
                         return (
                            <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                               <td className="px-6 py-4">
                                  <p className="text-sm font-bold tracking-tight">{u?.full_name}</p>
                                  <p className="text-[10px] text-white/40 uppercase font-mono tracking-widest">{u?.email}</p>
                               </td>
                               <td className="px-6 py-4">
                                  <p className="text-sm font-bold uppercase tracking-tighter text-brand-teal">{t?.title}</p>
                                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{t?.phase}</p>
                               </td>
                               <td className="px-6 py-4">
                                  <p className="text-[10px] text-white/60 font-mono tracking-widest">{new Date(a.start_date).toLocaleDateString()}</p>
                               </td>
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                     <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-brand-teal" style={{ width: `${a.completion_percent}%` }} />
                                     </div>
                                     <span className="text-[10px] font-mono tracking-widest text-brand-teal">{a.completion_percent}%</span>
                                  </div>
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <span className={`text-[8px] px-2 py-1 rounded font-black uppercase tracking-widest border ${a.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : a.status === 'active' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' : 'bg-white/10 text-white/60 border-white/20'}`}>
                                     {a.status}
                                  </span>
                               </td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
                {filteredAssignments.length === 0 && (
                  <div className="py-16 text-center text-white/20">
                     <p className="text-[10px] uppercase tracking-widest">No active matrix deployments found.</p>
                  </div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
