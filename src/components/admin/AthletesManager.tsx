import React, { useState } from 'react';
import { Trophy, CheckCircle, XCircle, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AthletesManager = ({ athletes, onUpdate, onDelete }: any) => {
  const [editingAthlete, setEditingAthlete] = useState<any>(null);

  const handleApprove = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    onUpdate(id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {athletes.map((athlete: any) => (
          <div key={athlete.id} className="card-gradient p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <img 
                src={athlete.user?.profile_image || 'https://picsum.photos/100'} 
                alt={athlete.user?.full_name}
                className="w-16 h-16 rounded-full object-cover border border-white/10"
              />
              <div>
                <h3 className="font-bold uppercase tracking-tighter text-lg">{athlete.user?.full_name}</h3>
                <p className="text-[10px] text-brand-teal uppercase tracking-widest font-bold">{athlete.specialty}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${
                    athlete.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {athlete.status || 'pending'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/50 line-clamp-2">{athlete.short_description}</p>
            
            <div className="flex pt-4 border-t border-white/5 gap-2">
              <button 
                onClick={() => handleApprove(athlete.id, athlete.status)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] uppercase tracking-widest font-bold transition-all flex justify-center items-center gap-1"
              >
                {athlete.status === 'approved' ? <XCircle size={12} /> : <CheckCircle size={12} />}
                {athlete.status === 'approved' ? 'Revoke' : 'Approve'}
              </button>
              <button 
                onClick={() => setEditingAthlete(athlete)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] uppercase tracking-widest font-bold transition-all flex justify-center items-center gap-1"
              >
                <Edit2 size={12} /> Edit
              </button>
              <button 
                onClick={() => onDelete(athlete.id)}
                className="flex-none p-2 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral rounded-xl transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editingAthlete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg card-gradient rounded-[2rem] border border-white/10 p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Edit <span className="text-brand-teal">Athlete</span></h3>
                <button onClick={() => setEditingAthlete(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] text-white/40 uppercase tracking-widest font-bold block mb-2">Short Description</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm min-h-[80px]"
                    value={editingAthlete.short_description || ''}
                    onChange={(e) => setEditingAthlete({...editingAthlete, short_description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[9px] text-white/40 uppercase tracking-widest font-bold block mb-2">Workout Style</label>
                  <input 
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
                    value={editingAthlete.workout_style || ''}
                    onChange={(e) => setEditingAthlete({...editingAthlete, workout_style: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[9px] text-white/40 uppercase tracking-widest font-bold block mb-2">Specialty</label>
                  <input 
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
                    value={editingAthlete.specialty || ''}
                    onChange={(e) => setEditingAthlete({...editingAthlete, specialty: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[9px] text-white/40 uppercase tracking-widest font-bold block mb-2">Fitness Philosophy</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm min-h-[80px]"
                    value={editingAthlete.fitness_philosophy || ''}
                    onChange={(e) => setEditingAthlete({...editingAthlete, fitness_philosophy: e.target.value})}
                  />
                </div>
                <button 
                  onClick={() => {
                    onUpdate(editingAthlete.id, editingAthlete);
                    setEditingAthlete(null);
                  }}
                  className="w-full py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:shadow-glow-teal transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
