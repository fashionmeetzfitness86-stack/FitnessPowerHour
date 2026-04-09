import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Plus, Check, X,
  Trash2, Edit2, Users, Calendar,
  Globe, ShieldCheck, Mail, Loader2, Save, Image
} from 'lucide-react';
import { Retreat, RetreatApplication } from '../../types';
import { supabase } from '../../supabase';
import { MediaCapture } from '../MediaCapture';

interface RetreatManagerProps {
  retreats: Retreat[];
  applications: RetreatApplication[];
  onAdd: () => void;
  onReview: (id: string, status: 'accepted' | 'declined') => void;
  onDelete: (id: string) => void;
  onSave?: (retreat: Partial<Retreat>) => Promise<void>;
  showToast?: any;
}

const emptyRetreat = (): Partial<Retreat> => ({
  title: '',
  description: '',
  location: '',
  price: 0,
  capacity: 10,
  visibility_status: 'draft' as any,
  is_sold_out: false,
  requirements: '',
  start_date: '',
  end_date: '',
  cover_image: '',
});

export const RetreatManager = ({
  retreats, applications, onAdd, onReview, onDelete, onSave, showToast
}: RetreatManagerProps) => {
  const [editingRetreat, setEditingRetreat] = useState<Partial<Retreat> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!editingRetreat?.title || !editingRetreat?.location) {
      if (showToast) showToast('Title and location are required', 'error');
      return;
    }
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(editingRetreat);
      } else {
        // Direct Supabase save fallback
        const row = {
          title: editingRetreat.title,
          description: editingRetreat.description || null,
          location: editingRetreat.location,
          price: editingRetreat.price || 0,
          capacity: editingRetreat.capacity || 10,
          visibility_status: editingRetreat.visibility_status || 'draft',
          is_sold_out: editingRetreat.is_sold_out || false,
          cover_image: editingRetreat.cover_image || null,
          requirements: (editingRetreat as any).requirements || null,
          start_date: (editingRetreat as any).start_date || null,
          end_date: (editingRetreat as any).end_date || null,
          updated_at: new Date().toISOString(),
        };
        if ((editingRetreat as any).id) {
          await supabase.from('retreats').update(row).eq('id', (editingRetreat as any).id);
        } else {
          await supabase.from('retreats').insert({ ...row, created_at: new Date().toISOString() });
        }
        if (showToast) showToast('Retreat saved ✅', 'success');
      }
      setEditingRetreat(null);
    } catch (err: any) {
      if (showToast) showToast(err?.message || 'Failed to save retreat', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">
            Retreat <span className="text-brand-coral">Control</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">
            {retreats.length} retreats · {applications.filter(a => a.status === 'pending').length} pending applications
          </p>
        </div>
        <button
          onClick={() => setEditingRetreat(emptyRetreat())}
          className="px-8 py-4 bg-brand-teal text-black font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-3 hover:shadow-glow-teal transition-all"
        >
          <Plus size={16} /> Create Retreat
        </button>
      </div>

      {/* Retreat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {retreats.map((retreat, i) => (
          <motion.div
            key={retreat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-gradient group relative overflow-hidden flex flex-col md:flex-row border border-white/5 hover:border-brand-teal/20 transition-all rounded-[2rem]"
          >
            <div className="md:w-44 relative h-48 md:h-auto overflow-hidden flex-shrink-0">
              {retreat.cover_image ? (
                <img src={retreat.cover_image} alt={retreat.title}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <Image size={32} className="text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]" />
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-teal mb-1">
                  <MapPin size={11} />
                  <span className="text-[9px] uppercase tracking-widest font-black">{retreat.location}</span>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tighter">{retreat.title}</h3>
                <p className="text-xs text-white/40 mt-1 line-clamp-2">{retreat.description}</p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <div className="flex gap-4 text-xs">
                  <span className="text-brand-coral font-black">${retreat.price}</span>
                  <span className={`font-black uppercase text-[9px] px-2 py-0.5 rounded ${
                    retreat.visibility_status === 'published' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>{retreat.visibility_status}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingRetreat(retreat as any)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeletingId(retreat.id)}
                    className="p-2 bg-white/5 hover:bg-red-500/20 rounded-xl text-white/40 hover:text-red-400 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {retreats.length === 0 && (
          <div className="col-span-full py-24 text-center card-gradient rounded-[3rem] border-2 border-dashed border-white/5">
            <Globe size={48} className="mx-auto text-white/5 mb-4" />
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">No retreats yet — create your first one</p>
          </div>
        )}
      </div>

      {/* Applications */}
      {applications.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-brand-teal" />
            <h3 className="text-xl font-black uppercase tracking-tighter">
              Applicant Queue <span className="text-brand-teal ml-2 text-sm">{applications.filter(a => a.status === 'pending').length} pending</span>
            </h3>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Applicant</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Retreat</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Status</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-black text-sm uppercase">{app.user_name}</p>
                      <p className="text-[10px] text-white/30 font-mono">{app.user_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-white/60">{retreats.find(r => r.id === app.retreat_id)?.title || 'Unknown'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                        app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        app.status === 'declined' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onReview(app.id, 'accepted')}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500 rounded-lg text-emerald-400 hover:text-white transition-all"><Check size={13} /></button>
                          <button onClick={() => onReview(app.id, 'declined')}
                            className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-400 hover:text-white transition-all"><X size={13} /></button>
                        </div>
                      ) : (
                        <span className="text-[9px] text-white/20 uppercase tracking-widest">Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {editingRetreat && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingRetreat(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d0d0d] border border-white/10 rounded-t-3xl sm:rounded-3xl p-8 w-full sm:max-w-2xl shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  {(editingRetreat as any).id ? 'Edit Retreat' : 'Create Retreat'}
                </h3>
                <button onClick={() => setEditingRetreat(null)} className="p-2 text-white/30 hover:text-white"><X size={18} /></button>
              </div>

              {/* Image */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Cover Image</label>
                {editingRetreat.cover_image ? (
                  <div className="relative h-36 rounded-2xl overflow-hidden">
                    <img src={editingRetreat.cover_image} className="w-full h-full object-cover" alt="cover" />
                    <button onClick={() => setEditingRetreat({ ...editingRetreat, cover_image: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white/60 hover:text-white"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <MediaCapture bucket="fmf-media" folder="retreats" accept="image/*"
                      onUploadSuccess={(url: string) => setEditingRetreat({ ...editingRetreat, cover_image: url })} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Retreat Title *</label>
                  <input type="text" placeholder="e.g. Costa Rica Immersion" value={editingRetreat.title || ''}
                    onChange={e => setEditingRetreat({ ...editingRetreat, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Location *</label>
                  <input type="text" placeholder="City, Country" value={editingRetreat.location || ''}
                    onChange={e => setEditingRetreat({ ...editingRetreat, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Price ($)</label>
                  <input type="number" min="0" placeholder="0" value={editingRetreat.price || ''}
                    onChange={e => setEditingRetreat({ ...editingRetreat, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                {/* Capacity */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Capacity</label>
                  <input type="number" min="1" placeholder="10" value={editingRetreat.capacity || ''}
                    onChange={e => setEditingRetreat({ ...editingRetreat, capacity: parseInt(e.target.value) || 10 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                {/* Start Date */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Start Date</label>
                  <input type="date" value={(editingRetreat as any).start_date || ''}
                    onChange={e => setEditingRetreat({ ...editingRetreat, ...(editingRetreat as any), start_date: e.target.value } as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                {/* End Date */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">End Date</label>
                  <input type="date" value={(editingRetreat as any).end_date || ''}
                    onChange={e => setEditingRetreat({ ...(editingRetreat as any), end_date: e.target.value } as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
                </div>
                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Status</label>
                  <select value={editingRetreat.visibility_status || 'draft'}
                    onChange={e => setEditingRetreat({ ...editingRetreat, visibility_status: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal">
                    <option value="draft">Draft</option>
                    <option value="published">Published (Active)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                {/* Sold Out */}
                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <input type="checkbox" id="sold_out" checked={editingRetreat.is_sold_out || false}
                    onChange={e => setEditingRetreat({ ...editingRetreat, is_sold_out: e.target.checked })}
                    className="w-4 h-4 accent-brand-coral" />
                  <label htmlFor="sold_out" className="text-xs font-black uppercase tracking-widest cursor-pointer">Mark as Sold Out</label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Description</label>
                <textarea rows={4} placeholder="Full retreat description..." value={editingRetreat.description || ''}
                  onChange={e => setEditingRetreat({ ...editingRetreat, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal resize-none" />
              </div>

              {/* Requirements */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-white/40 font-black">Requirements (optional)</label>
                <textarea rows={2} placeholder="e.g. Basic fitness level required. No experience needed." value={(editingRetreat as any).requirements || ''}
                  onChange={e => setEditingRetreat({ ...(editingRetreat as any), requirements: e.target.value } as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingRetreat(null)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white/60 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {(editingRetreat as any).id ? 'Update Retreat' : 'Publish Retreat'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#0d0d0d] border border-red-500/30 rounded-3xl p-8 w-full max-w-sm text-center space-y-5"
            >
              <p className="text-lg font-black uppercase">Delete Retreat?</p>
              <p className="text-white/40 text-xs">This cannot be undone. All applications will be orphaned.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-white/5 font-black uppercase text-[10px] rounded-xl hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={() => { onDelete(deletingId); setDeletingId(null); }}
                  className="flex-1 py-3 bg-red-500 text-white font-black uppercase text-[10px] rounded-xl hover:bg-red-600 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
