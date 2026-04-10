import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Users, MapPin, Target, Bell, Clock, Calendar,
  Repeat, FileText, CheckCircle, Eye, Trash2, X, Loader2, Search
} from 'lucide-react';
import { supabase } from '../../supabase';

interface DraftNotification {
  id: string;
  title: string;
  message: string;
  recipient_type: string;
  recipient_value: string;
  scheduled_at: string | null;
  status: 'draft' | 'scheduled' | 'sent';
  created_at: string;
  sent_count?: number;
  repeat_interval?: 'none' | '12h' | '24h' | 'weekly';
}

export const NotificationManager = ({ users = [], groups = [], showToast }: any) => {
  const [tab, setTab] = useState<'compose' | 'history'>('compose');

  // Compose state
  const [title, setTitle]                   = useState('');
  const [message, setMessage]               = useState('');
  const [recipientType, setRecipientType]   = useState<'broadcast' | 'individual' | 'city' | 'group'>('broadcast');
  const [recipientValue, setRecipientValue] = useState('');
  const [userSearch, setUserSearch]         = useState('');
  const [targetRoute, setTargetRoute]       = useState('#/profile');
  const [isDraft, setIsDraft]               = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);

  // History state
  const [history, setHistory]     = useState<DraftNotification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const uniqueCities = useMemo(() =>
    Array.from(new Set(users.map((u: any) => u.city?.trim()).filter(Boolean))).sort() as string[],
    [users]
  );

  const filteredUsers = useMemo(() =>
    users.filter((u: any) =>
      (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
    ).slice(0, 20),
    [users, userSearch]
  );

  useEffect(() => {
    if (tab === 'history') fetchHistory();
  }, [tab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await supabase
        .from('admin_broadcast_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setHistory(data as DraftNotification[]);
    } catch {
      // Table may not exist yet — handled gracefully
    } finally {
      setLoadingHistory(false);
    }
  };

  const logBroadcast = async (payload: any, sentCount: number, status: DraftNotification['status']) => {
    try {
      await supabase.from('admin_broadcast_log').insert({
        title: payload.title,
        message: payload.message,
        recipient_type: recipientType,
        recipient_value: recipientValue,
        status,
        sent_count: sentCount,
        created_at: new Date().toISOString(),
      });
    } catch {}
  };

  const handleDispatch = async (asDraft = false) => {
    if (!title || !message) { showToast?.('Title and message are required', 'error'); return; }
    if (recipientType !== 'broadcast' && !recipientValue) { showToast?.('Select a recipient', 'error'); return; }

    setIsSubmitting(true);
    try {
      let userIds: string[] = [];

      if (recipientType === 'broadcast') {
        userIds = users.map((u: any) => u.id);
      } else if (recipientType === 'individual') {
        userIds = [recipientValue];
      } else if (recipientType === 'city') {
        userIds = users.filter((u: any) => u.city?.toLowerCase() === recipientValue.toLowerCase()).map((u: any) => u.id);
      } else if (recipientType === 'group') {
        const { data } = await supabase.from('community_members').select('user_id').eq('community_id', recipientValue).eq('status', 'approved');
        if (data) userIds = data.map((r: any) => r.user_id);
      }

      if (userIds.length === 0 && !asDraft) {
        showToast?.('No users found for this target', 'error');
        setIsSubmitting(false);
        return;
      }

      const status: DraftNotification['status'] = asDraft ? 'draft' : 'sent';

      if (!asDraft) {
        // Batch insert max 50 at a time to avoid payload limits
        const payloads = userIds.map(id => ({
          user_id: id,
          type: 'system',
          title,
          message,
          metadata: { source: 'Admin Broadcast', route: targetRoute || '#/profile' }
        }));
        for (let i = 0; i < payloads.length; i += 50) {
          const { error } = await supabase.from('notifications').insert(payloads.slice(i, i + 50));
          if (error) throw error;
        }
      }

      await logBroadcast({ title, message, route: targetRoute }, userIds.length, status);

      showToast?.(
        asDraft ? 'Saved as draft ✅' : `Broadcast active! Sent to ${userIds.length} user(s) ✅`,
        'success'
      );

      // Reset
      setTitle(''); setMessage(''); setRecipientValue(''); setTargetRoute('#/profile'); setUserSearch('');
      if (tab === 'compose') fetchHistory();
    } catch (err: any) {
      showToast?.(err?.message || 'Dispatch failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    await supabase.from('admin_broadcast_log').delete().eq('id', id);
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleEditHistory = (h: DraftNotification) => {
    setTitle(h.title);
    setMessage(h.message);
    setRecipientType(h.recipient_type as any);
    setRecipientValue(h.recipient_value || '');
    setTab('compose');
  };

  const handleResendHistory = async (h: DraftNotification) => {
    handleEditHistory(h);
    // User can just click 'Send Now' from compose, but we'll show toast
    showToast?.('Notification loaded. Review and click Send Now.', 'success');
  };

  const RECIPIENT_TYPES = [
    { id: 'broadcast', label: 'All Users', icon: Users, desc: `${users.length} users` },
    { id: 'individual', label: 'Individual', icon: Target, desc: 'Single user' },
    { id: 'city', label: 'By City', icon: MapPin, desc: `${uniqueCities.length} cities` },
    { id: 'group', label: 'By Group', icon: Users, desc: `${groups.length} groups` },
  ];

  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">
            Notification <span className="text-brand-teal">Center</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">Broadcast directly to user dashboards</p>
        </div>
        <div className="flex bg-black/40 border border-white/10 p-1 rounded-xl">
          {(['compose', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-[9px] uppercase tracking-widest font-black rounded-lg transition-all ${tab === t ? 'bg-brand-teal text-black' : 'text-white/40 hover:text-white'}`}>
              {t === 'compose' ? '✏️ Compose' : '📋 History'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'compose' ? (
          <motion.div key="compose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-6">

            {/* Step 1: Target */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs uppercase font-black tracking-widest text-brand-teal flex items-center gap-2">
                <Target size={14} /> 1. Target Audience
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {RECIPIENT_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button key={type.id} onClick={() => { setRecipientType(type.id as any); setRecipientValue(''); setUserSearch(''); }}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all ${
                        recipientType === type.id ? 'bg-brand-teal text-black border-brand-teal' : 'bg-white/5 border-white/10 text-white/50 hover:border-brand-teal/30'
                      }`}>
                      <Icon size={18} />
                      <span className="text-[9px] uppercase font-black tracking-widest">{type.label}</span>
                      <span className="text-[8px] opacity-60">{type.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Recipient selector */}
              {recipientType === 'individual' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm outline-none focus:border-brand-teal" />
                  </div>
                  <select value={recipientValue} onChange={e => setRecipientValue(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal">
                    <option value="">— Select user —</option>
                    {filteredUsers.map((u: any) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                  </select>
                </div>
              )}

              {recipientType === 'city' && (
                <select value={recipientValue} onChange={e => setRecipientValue(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal">
                  <option value="">— Select city —</option>
                  {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}

              {recipientType === 'group' && (
                <select value={recipientValue} onChange={e => setRecipientValue(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal">
                  <option value="">— Select group —</option>
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              )}

              {recipientType === 'broadcast' && (
                <p className="text-xs text-brand-teal font-black flex items-center gap-2"><Bell size={12} /> Sending to all {users.length} registered users</p>
              )}
            </div>

            {/* Step 2: Message */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs uppercase font-black tracking-widest text-brand-teal flex items-center gap-2">
                <Send size={14} /> 2. Message
              </h3>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-white/40">Title</label>
                <input type="text" placeholder="e.g. New class available!" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-white/40">Message Body</label>
                <textarea rows={4} placeholder="Write your message..." value={message} onChange={e => setMessage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-brand-teal" />
                <p className="text-[9px] text-white/30 text-right">{message.length} chars</p>
              </div>
            </div>

            {/* Step 3: Schedule & Repeat (optional) */}
            {/* Step 3: Destination (optional) */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs uppercase font-black tracking-widest text-white/40 flex items-center gap-2">
                <Target size={14} /> 3. Destination Link (Optional)
              </h3>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-white/40">In-App Target Route</label>
                <select value={targetRoute} onChange={e => setTargetRoute(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal">
                  <option value="#/profile">Profile/Dashboard (Default)</option>
                  <option value="#/shop">Shop Page</option>
                  <option value="#/retreats">Retreats Page</option>
                  <option value="#/community">Community Timeline</option>
                  <option value="#/videos">Video Library</option>
                  <option value="#/services">Services Page</option>
                </select>
                <p className="text-[8px] opacity-50 mt-1">When users click the notification on their bell, they will be sent here.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => handleDispatch(true)} disabled={isSubmitting || !title || !message}
                className="flex-1 py-4 bg-white/5 border border-white/10 text-white/70 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                <FileText size={14} /> Save Draft
              </button>
              <button onClick={() => handleDispatch(false)} disabled={isSubmitting || !title || !message}
                className="flex-1 py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Broadcast Now
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {loadingHistory ? (
              <div className="text-center py-12 text-white/40 text-xs uppercase tracking-widest">Loading...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-20 text-white/20">
                <Bell size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-xs uppercase tracking-widest font-black">No notifications sent yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(h => (
                  <div key={h.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      h.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400' :
                      h.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-white/5 text-white/30'
                    }`}>
                      {h.status === 'sent' ? <CheckCircle size={14} /> : h.status === 'scheduled' ? <Clock size={14} /> : <FileText size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight">{h.title}</p>
                          <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">{h.message}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg flex-shrink-0 ${
                          h.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400' :
                          h.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-white/5 text-white/30'
                        }`}>{h.status}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[9px] uppercase tracking-widest text-white/30 font-black">
                        <span>{h.recipient_type}</span>
                        {h.sent_count !== undefined && <span>{h.sent_count} recipients</span>}
                        <span>{new Date(h.created_at).toLocaleDateString()}</span>
                        {h.scheduled_at && <span className="text-amber-400">⏰ {new Date(h.scheduled_at).toLocaleString()}</span>}
                        {h.repeat_interval && h.repeat_interval !== 'none' && <span className="text-brand-teal flex items-center gap-1"><Repeat size={10} /> Every {h.repeat_interval}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => handleResendHistory(h)} className="p-1 text-white/60 hover:text-brand-teal transition-all flex items-center justify-center bg-white/5 hover:bg-white/10 rounded" title="Edit & Re-send">
                        <Send size={12} />
                      </button>
                      <button onClick={() => handleDeleteHistory(h.id)} className="p-1 text-white/40 hover:text-red-400 transition-all flex items-center justify-center bg-white/5 hover:bg-white/10 rounded" title="Delete Log">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
