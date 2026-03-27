import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Mail, Send, Trash2, Edit2, 
  MessageSquare, UserPlus, Package, 
  Settings, User, Plus, CheckCircle, Clock,
  AlertCircle, Info, Shield
} from 'lucide-react';
import { supabase } from '../../supabase';

interface NotificationManagerProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const NotificationManager = ({ showToast }: NotificationManagerProps) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'alert',
    target: 'all' as 'all' | 'members' | 'athletes' | 'individual',
    target_user_id: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      showToast('Signal synchronization failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!form.title || !form.content) {
      showToast('Incomplete transmission parameters', 'warning');
      return;
    }

    try {
      const { error } = await supabase.from('notifications').insert({
        title: form.title,
        content: form.content,
        type: form.type,
        user_id: form.target === 'individual' ? form.target_user_id : null,
        broadcast: form.target !== 'individual',
        created_at: new Date().toISOString(),
        read: false
      });

      if (error) throw error;
      
      showToast('Global transmission successful', 'success');
      setActiveTab('browse');
      fetchNotifications();
      setForm({ title: '', content: '', type: 'info', target: 'all', target_user_id: '' });
    } catch (err) {
      showToast('Transmission failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('Transmission purged', 'success');
    } catch (err) {
      showToast('Purge failed', 'error');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle size={18} className="text-brand-coral" />;
      case 'success': return <CheckCircle size={18} className="text-emerald-500" />;
      case 'alert': return <Shield size={18} className="text-brand-coral" />;
      default: return <Info size={18} className="text-brand-teal" />;
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* 1. TABS NAVIGATION */}
      <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit">
        {[
          { id: 'browse', label: 'Transmission History', icon: Clock },
          { id: 'broadcast', label: 'Broadcast Nexus', icon: Send },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] uppercase tracking-[0.3em] font-black transition-all ${
              activeTab === t.id ? 'bg-white/10 text-brand-teal shadow-lg border border-brand-teal/20' : 'text-white/30 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'browse' ? (
          <motion.div 
            key="browse" 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="flex justify-center py-20 px-10 text-[10px] uppercase tracking-[0.4em] text-white/20 animate-pulse font-black italic italic-glow-brand-teal">Initializing transmission scan...</div>
            ) : notifications.length > 0 ? (
              notifications.map((n, i) => (
                <div key={n.id} className="card-gradient p-6 border border-white/10 flex items-center justify-between group hover:border-brand-teal/30 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-black uppercase tracking-tight">{n.title}</p>
                        {n.broadcast && <span className="bg-brand-teal/10 text-brand-teal text-[7px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">Global</span>}
                      </div>
                      <p className="text-[11px] text-white/40 mt-1 line-clamp-1">{n.content}</p>
                      <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold mt-2">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(n.id)}
                    className="p-3 bg-brand-coral/10 text-brand-coral rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-coral hover:text-black border border-brand-coral/20 border-glow-brand-coral-subtle"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 card-gradient border border-dashed border-white/5">
                <Bell size={48} className="mx-auto text-white/5 mb-6" />
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">Nexus quiet. No transmissions found.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="broadcast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card-gradient p-10 border border-white/5 max-w-3xl space-y-8"
          >
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black">Transmission Type</label>
                <div className="flex gap-3">
                  {['info', 'warning', 'success', 'alert'].map(type => (
                    <button
                      key={type}
                      onClick={() => setForm({ ...form, type: type as any })}
                      className={`p-3.5 rounded-xl border transition-all ${
                        form.type === type ? 'bg-brand-teal/10 border-brand-teal/50 text-brand-teal shadow-glow-teal' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                      }`}
                    >
                      {getIcon(type)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black">Nexus Target</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-white/80 outline-none uppercase tracking-widest font-black focus:border-brand-teal/50"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value as any })}
                >
                  <option value="all">FPH Directory (Global)</option>
                  <option value="members">Active Members Only</option>
                  <option value="athletes">Athletes Only</option>
                  <option value="individual">Specific Node (Individual)</option>
                </select>
              </div>
            </div>

            {form.target === 'individual' && (
               <div className="space-y-3">
                 <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black">Candidate ID / Email</label>
                 <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-brand-teal/50 uppercase tracking-widest font-black"
                  value={form.target_user_id}
                  onChange={(e) => setForm({ ...form, target_user_id: e.target.value })}
                  placeholder="Paste User Key..."
                 />
               </div>
            )}

            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black">Signal Heading</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-brand-teal/50 uppercase tracking-widest font-black"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Transmission Title..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black">Signal Payload (Content)</label>
              <textarea 
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-brand-teal/50 transition-all uppercase tracking-widest font-black"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Compose signal payload..."
              />
            </div>

            <button 
              onClick={handleSendBroadcast}
              className="w-full py-5 bg-brand-teal text-black rounded-2xl text-[11px] uppercase tracking-[0.5em] font-black shadow-glow-teal hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
            >
              Initialize Global Broadcast <Send size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
