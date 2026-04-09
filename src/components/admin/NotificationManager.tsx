import React, { useState } from 'react';
import { Send, Users, MapPin, Target, CheckCircle } from 'lucide-react';
import { supabase } from '../../supabase';

export const NotificationManager = ({ users, groups, showToast }: any) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'individual' | 'city' | 'group'>('individual');
  const [recipientValue, setRecipientValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique cities from users, filtering out empty ones
  const uniqueCities = Array.from(new Set(users.map((u: any) => u.city?.trim()).filter(Boolean))).sort();

  const handleSendNotification = async () => {
     if (!title || !message || !recipientValue) return;
     setIsSubmitting(true);

     try {
        let userIdsToNotify: string[] = [];

        if (recipientType === 'individual') {
           userIdsToNotify = [recipientValue];
        } else if (recipientType === 'city') {
           userIdsToNotify = users.filter((u: any) => u.city?.toLowerCase() === recipientValue.toLowerCase()).map((u: any) => u.id);
        } else if (recipientType === 'group') {
           const { data } = await supabase.from('community_members')
              .select('user_id')
              .eq('community_id', recipientValue)
              .eq('status', 'approved');
           if (data) userIdsToNotify = data.map((row: any) => row.user_id);
        }

        if (userIdsToNotify.length === 0) {
           showToast('No users found matching these criteria', 'error');
           setIsSubmitting(false);
           return;
        }

        const notificationPayloads = userIdsToNotify.map(id => ({
           user_id: id,
           type: 'system',
           title,
           message,
           metadata: { source: 'Admin Console' }
        }));

        const { error } = await supabase.from('notifications').insert(notificationPayloads);
        
        if (error) throw error;
        
        showToast(`Sent successfully to ${userIdsToNotify.length} user(s)`, 'success');
        setTitle('');
        setMessage('');
        setRecipientValue('');
     } catch(err) {
        showToast('Failed to dispatch notifications', 'error');
     } finally {
        setIsSubmitting(false);
     }
  };

  return (
    <div className="space-y-8 fade-in h-full flex flex-col max-w-4xl mx-auto">
      <div className="flex flex-col justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Targeted <span className="text-brand-teal">Broadcasting</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">Direct message injection into user dashboards.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8 relative overflow-hidden">
         {/* Recipient Targeting */}
         <div className="space-y-4">
            <h3 className="text-xs uppercase font-black tracking-widest text-brand-teal flex items-center gap-2">
              <Target size={14} /> 1. Operational Target
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
               {[
                 { id: 'individual', label: 'Individual User', icon: Users },
                 { id: 'city', label: 'By City', icon: MapPin },
                 { id: 'group', label: 'By Group', icon: Users }
               ].map(type => (
                 <button
                   key={type.id}
                   onClick={() => { setRecipientType(type.id as any); setRecipientValue(''); }}
                   className={`p-4 rounded-xl border flex items-center justify-center gap-3 text-[10px] uppercase font-black tracking-widest transition-all ${
                      recipientType === type.id ? 'bg-brand-teal text-black border-brand-teal shadow-[0_0_15px_rgba(45,212,191,0.2)]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                   }`}
                 >
                    <type.icon size={16} /> {type.label}
                 </button>
               ))}
            </div>

            {recipientType === 'individual' && (
               <select value={recipientValue} onChange={e => setRecipientValue(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white outline-none focus:border-brand-teal">
                  <option value="">-- Search and select user --</option>
                  {users.map((u: any) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
               </select>
            )}

            {recipientType === 'city' && (
               <select value={recipientValue} onChange={e => setRecipientValue(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white outline-none focus:border-brand-teal">
                  <option value="">-- Select Active City --</option>
                  {uniqueCities.map((c: any) => <option key={c} value={c}>{c}</option>)}
               </select>
            )}

            {recipientType === 'group' && (
               <select value={recipientValue} onChange={e => setRecipientValue(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white outline-none focus:border-brand-teal">
                  <option value="">-- Select Network Group --</option>
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
               </select>
            )}
         </div>

         {/* Message Construction */}
         <div className="space-y-4 pt-6 border-t border-white/10">
            <h3 className="text-xs uppercase font-black tracking-widest text-brand-teal flex items-center gap-2">
              <Send size={14} /> 2. Payload Construction
            </h3>

            <div>
               <label className="text-[9px] uppercase font-bold tracking-widest text-white/40 block mb-2">Notification Title</label>
               <input 
                  type="text" 
                  placeholder="e.g. Action Required: Account Audit"
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white outline-none focus:border-brand-teal transition-colors" 
               />
            </div>
            
            <div>
               <label className="text-[9px] uppercase font-bold tracking-widest text-white/40 block mb-2">Message Body</label>
               <textarea 
                  rows={4} 
                  placeholder="Enter the transmission details..."
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white resize-none outline-none focus:border-brand-teal transition-colors" 
               />
            </div>
         </div>

         {/* Dispatch */}
         <div className="pt-6">
            <button
               onClick={handleSendNotification}
               disabled={!title || !message || !recipientValue || isSubmitting}
               className="w-full py-5 bg-brand-teal text-black rounded-xl text-xs uppercase font-black tracking-widest hover:shadow-glow-teal transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
               {isSubmitting ? 'Transmitting...' : 'Dispatch Notification'}
            </button>
         </div>
      </div>
    </div>
  );
};
