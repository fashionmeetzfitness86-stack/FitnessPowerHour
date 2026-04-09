import React, { useState, useMemo } from 'react';
import { Users, Upload, Trash2, X, Save, CheckSquare, Square, AlertTriangle, Eye, Edit2, ShieldCheck, Mail, Plus } from 'lucide-react';
import { MediaCapture } from '../MediaCapture';
import { UserProfile } from '../../types';

export interface AthleteProfile {
  id: string; // Foreign key to profiles table
  workout_style: string;
  eating_schedule: string;
  preferred_body_type: string;
  fitness_philosophy: string;
  specialty: string;
  short_description: string;
  is_active: boolean;
  social_links?: any;
  images?: string[];
}

export type JoinedAthlete = AthleteProfile & {
  profile: Partial<UserProfile>;
};

interface AthletesManagerProps {
  athletes: JoinedAthlete[];
  onEdit: (athlete: JoinedAthlete) => void;
  onDelete: (id: string) => void;
}

export const AthletesManager = ({ athletes, onEdit, onDelete }: AthletesManagerProps) => {
    const [editingAthlete, setEditingAthlete] = useState<Partial<JoinedAthlete> | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [quickFilter, setQuickFilter] = useState('ALL');
    const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const categories = ['ALL', 'Strength', 'Conditioning', 'Mobility', 'Recovery', 'Hybrid'];

    const filteredAthletes = useMemo(() => {
        let result = athletes;
        if (quickFilter !== 'ALL') {
            result = result.filter(a => a.specialty?.toLowerCase().includes(quickFilter.toLowerCase()));
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a => 
                a.profile?.full_name?.toLowerCase().includes(q) || 
                a.specialty?.toLowerCase().includes(q) ||
                a.profile?.email?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [athletes, quickFilter, searchQuery]);

    const handleSave = () => {
        if (editingAthlete) {
            onEdit({
                ...editingAthlete,
                is_active: editingAthlete.is_active === undefined ? true : editingAthlete.is_active,
                social_links: editingAthlete.social_links || {},
                images: editingAthlete.images || []
            } as JoinedAthlete);
            setEditingAthlete(null);
            setShowAdvanced(false);
        }
    };

    const handleBulkDelete = () => {
        selectedAthletes.forEach(id => onDelete(id));
        setSelectedAthletes([]);
    };

    return (
        <div className="space-y-6 fade-in h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Athlete <span className="text-brand-coral">Roster</span></h2>
                    <p className="text-xs uppercase tracking-widest text-white/40 mt-1 font-bold">Manage Elite Roster & Trainers</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search roster..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full lg:w-64 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-coral text-white"
                    />
                    <button 
                        onClick={() => setEditingAthlete({ profile: { full_name: '', email: '' }, short_description: '', specialty: 'Strength', workout_style: '', is_active: true })}
                        className="w-full md:w-auto px-8 py-3 bg-brand-coral text-black font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-md"
                    >
                        <Plus size={16} /> Add Athlete
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
                {categories.map(chip => (
                    <button 
                        key={chip}
                        onClick={() => setQuickFilter(chip)}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-sm border ${
                        quickFilter === chip 
                        ? 'bg-brand-coral text-black border-transparent' 
                        : 'bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Bulk Actions Menu */}
            {selectedAthletes.length > 0 && (
                <div className="bg-brand-coral/10 border border-brand-coral/30 rounded-2xl p-4 flex items-center gap-4 text-brand-coral animate-in slide-in-from-top-4">
                    <CheckSquare size={18} />
                    <span className="text-sm font-black uppercase tracking-widest">{selectedAthletes.length} Selected</span>
                    <button onClick={handleBulkDelete} className="ml-auto px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-xs font-bold uppercase hover:bg-red-500/30 border border-red-500/20">Remove Selected</button>
                </div>
            )}

            {/* Matrix View */}
            {filteredAthletes.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-white/10 rounded-[2rem] bg-black/20">
                    <Users size={48} className="text-white/20 mb-6" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">No athletes assigned</h3>
                    <button 
                        onClick={() => setEditingAthlete({ profile: {}, is_active: true })}
                        className="mt-6 px-8 py-4 bg-white/5 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                        Draft First Athlete
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAthletes.map((athlete) => {
                        const isSelected = selectedAthletes.includes(athlete.id);
                        return (
                            <div key={athlete.id} className={`relative overflow-hidden rounded-[2rem] border transition-all flex flex-col group bg-[#111] p-6 ${isSelected ? 'border-brand-coral shadow-[0_0_20px_rgba(232,116,97,0.2)]' : 'border-white/10 hover:border-white/30'}`}>
                                <div className="absolute top-4 left-4 z-20">
                                    <button onClick={() => setSelectedAthletes(prev => prev.includes(athlete.id) ? prev.filter(id => id !== athlete.id) : [...prev, athlete.id])} className="w-6 h-6 rounded flex items-center justify-center bg-black/50 text-white/40 hover:text-white border border-white/10">
                                        {isSelected ? <CheckSquare size={14} className="text-brand-coral" /> : <Square size={14} />}
                                    </button>
                                </div>
                                <div className="absolute top-4 right-4 z-20">
                                    <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded ${athlete.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/40'}`}>{athlete.is_active ? 'Active' : 'Inactive'}</span>
                                </div>

                                {deletingId === athlete.id && (
                                    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                                        <AlertTriangle size={32} className="text-red-500 mb-4" />
                                        <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Confirm Delete?</h4>
                                        <div className="flex gap-4 w-full">
                                            <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-white/10 text-white text-[10px] font-bold uppercase rounded-xl">Cancel</button>
                                            <button onClick={() => { onDelete(athlete.id); setDeletingId(null); }} className="flex-1 py-3 bg-red-500 text-white text-[10px] font-black uppercase rounded-xl">Remove</button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col items-center text-center mt-2">
                                    <div className="w-24 h-24 rounded-full border-[3px] border-white/10 overflow-hidden mb-4 relative group-hover:border-white/30 transition-colors">
                                        {athlete.profile?.profile_image || athlete.images?.[0] ? (
                                            <img src={athlete.profile?.profile_image || athlete.images?.[0]} alt={athlete.profile?.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20"><Users size={32}/></div>
                                        )}
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-tighter line-clamp-1">{athlete.profile?.full_name || 'Unnamed Athlete'}</h3>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-coral mt-1">{athlete.specialty || 'General Training'}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto border-t border-white/5 pt-6">
                                    <button onClick={() => setEditingAthlete(athlete)} className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white text-white/60 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        <Edit2 size={14} /> Profile
                                    </button>
                                    <button onClick={() => setDeletingId(athlete.id)} className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        <Trash2 size={14} /> Remove
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* SIDE PANEL EDITOR */}
            {editingAthlete && (
                <>
                    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setEditingAthlete(null)} />
                    <div className="fixed inset-y-0 right-0 z-[210] w-full max-w-lg bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h3 className="text-xl font-black uppercase tracking-tighter">{editingAthlete.id ? 'Edit' : 'Add'} Athlete</h3>
                            <button onClick={() => setEditingAthlete(null)} className="p-2 text-white/40 hover:text-white bg-white/5 rounded-full"><X size={18} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            
                            {/* Profile Image & Name Block */}
                            <div className="flex gap-6 items-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 shrink-0 relative group">
                                    {editingAthlete.profile?.profile_image || editingAthlete.images?.[0] ? (
                                        <img src={editingAthlete.profile?.profile_image || editingAthlete.images?.[0]} alt="Athlete" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20"><Upload size={24}/></div>
                                    )}
                                </div>
                                <div className="space-y-2 flex-1">
                                    <label className="text-[10px] uppercase tracking-widest text-brand-coral font-bold">Full Name</label>
                                    <input type="text" value={editingAthlete.profile?.full_name || ''} onChange={e => setEditingAthlete({ ...editingAthlete, profile: { ...editingAthlete.profile, full_name: e.target.value } })} className="w-full bg-transparent border-b-2 border-white/10 px-0 py-2 text-2xl font-black uppercase tracking-tight outline-none focus:border-brand-coral text-white placeholder:text-white/20" placeholder="e.g. John Doe" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Specialty</label>
                                    <select value={editingAthlete.specialty || ''} onChange={e => setEditingAthlete({ ...editingAthlete, specialty: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-brand-coral text-white/80 appearance-none uppercase tracking-widest font-bold">
                                        <option value="">Select Specialty</option>
                                        <option value="Strength">Strength</option>
                                        <option value="Mobility">Mobility</option>
                                        <option value="Conditioning">Conditioning</option>
                                        <option value="Recovery">Recovery</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Visibility Status</label>
                                    <select value={editingAthlete.is_active ? 'true' : 'false'} onChange={e => setEditingAthlete({ ...editingAthlete, is_active: e.target.value === 'true' })} className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-emerald-500 text-emerald-400 appearance-none uppercase tracking-widest font-bold">
                                        <option value="true">Active (Visible)</option>
                                        <option value="false">Inactive (Hidden)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Short Bio</label>
                                <textarea rows={3} value={editingAthlete.short_description || ''} onChange={e => setEditingAthlete({ ...editingAthlete, short_description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-coral text-white resize-none" />
                            </div>

                            {/* ADVANCED OVERLAY */}
                            <div className="pt-4 border-t border-white/10">
                                <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs uppercase tracking-widest font-bold text-white/40 hover:text-white transition-all flex items-center gap-2">
                                {showAdvanced ? 'Hide Fitness Profile & Socials' : 'Edit Fitness Profile & Socials'}
                                </button>
                                
                                {showAdvanced && (
                                    <div className="pt-6 space-y-6 animate-in fade-in">
                                        <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Workout Style</label>
                                                <input type="text" value={editingAthlete.workout_style || ''} onChange={e => setEditingAthlete({ ...editingAthlete, workout_style: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Eating Schedule</label>
                                                <input type="text" value={editingAthlete.eating_schedule || ''} onChange={e => setEditingAthlete({ ...editingAthlete, eating_schedule: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none text-white" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-[#050505]">
                            <button onClick={handleSave} disabled={!editingAthlete.profile?.full_name} className="w-full py-5 bg-brand-coral text-black text-xs uppercase tracking-[0.2em] font-black rounded-2xl hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                <Save size={18} /> Update Athlete Profile
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
