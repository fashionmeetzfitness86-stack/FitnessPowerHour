import React, { useState } from 'react';
import { Package, Shield, Edit2, Trash2, Plus, DollarSign, Activity } from 'lucide-react';
import { Package as PackageType } from '../../types';

interface PackageManagerProps {
  packages: PackageType[];
  onSave: (data: Partial<PackageType>) => void;
  onDelete: (id: string) => void;
}

export const PackageManager = ({ packages, onSave, onDelete }: PackageManagerProps) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PackageType>>({});

  const handleEdit = (p: PackageType) => {
    setIsEditing(p.id);
    setFormData(p);
  };

  const handleNew = () => {
    setIsEditing('new');
    setFormData({ is_active: true });
  };

  return (
    <div className="space-y-12 fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Access <span className="text-brand-teal">Tiering</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Configure membership packages and access levels.</p>
        </div>
        <button 
          onClick={handleNew}
          className="px-8 py-3 bg-brand-teal text-black font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-3 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all"
        >
          <Plus size={18} /> New Protocol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((p) => (
          <div key={p.id} className="card-gradient p-8 space-y-8 border border-white/5 hover:border-brand-teal/30 transition-all rounded-3xl relative group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal">
                <Shield size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(p)} className="p-2 bg-white/5 hover:bg-brand-teal hover:text-black rounded-lg transition-all"><Edit2 size={12} /></button>
                <button onClick={() => onDelete(p.id)} className="p-2 bg-white/5 hover:bg-brand-coral hover:text-white rounded-lg transition-all"><Trash2 size={12} /></button>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">{p.name}</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1 line-clamp-2">{p.description}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                <span className="text-white/20 flex items-center gap-2"><DollarSign size={12} /> Rate</span>
                <span className="text-brand-teal">${p.price} / {p.billing_type}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                <span className="text-white/20 flex items-center gap-2"><Activity size={12} /> Capacity</span>
                <span className="text-white/80">{p.upload_limit} Uploads</span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                <span className="text-white/20 flex items-center gap-2"><Lock size={12} /> Status</span>
                <span className={p.is_active ? 'text-emerald-500' : 'text-brand-coral'}>{p.is_active ? 'Synchronized' : 'Offline'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60">
          <div className="card-gradient w-full max-w-lg p-12 space-y-10 rounded-[4rem] border-2 border-brand-teal/20 shadow-2xl">
            <h3 className="text-3xl font-black uppercase tracking-tighter">
              {isEditing === 'new' ? 'Initialize' : 'Configure'} <span className="text-brand-teal">Protocol</span>
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Package Name</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-brand-teal outline-none transition-colors"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Price ($)</label>
                  <input 
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-brand-teal outline-none transition-colors"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Period</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] uppercase tracking-widest font-black focus:border-brand-teal outline-none transition-colors appearance-none"
                    value={formData.billing_type || 'month'}
                    onChange={(e) => setFormData({...formData, billing_type: e.target.value})}
                  >
                    <option value="month">Month</option>
                    <option value="quarter">Quarter</option>
                    <option value="year">Year</option>
                    <option value="one-time">One-Time</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  onSave(formData);
                  setIsEditing(null);
                }}
                className="flex-1 py-5 bg-brand-teal text-black text-[11px] uppercase tracking-[0.4em] font-black rounded-2xl hover:scale-105 transition-all"
              >
                Sync Configuration
              </button>
              <button 
                onClick={() => setIsEditing(null)}
                className="flex-1 py-5 border border-white/10 text-white/40 text-[11px] uppercase tracking-[0.4em] font-black rounded-2xl hover:text-white transition-all"
              >
                Cancel Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
