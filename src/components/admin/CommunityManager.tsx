import React, { useState, useEffect } from 'react';
import { Trash2, MessageSquare, Plus, CheckCircle, XCircle, Users, X, Activity, UserPlus, Eye, ShieldCheck } from 'lucide-react';
import { supabase } from '../../supabase';

// Helper interface
interface JoinRequest {
   id: string;
   user_id: string;
   status: string;
   requested_at: string;
   notes: string;
   users: { full_name: string; email: string; city: string; tier: string };
}

interface Community {
   id: string;
   name: string;
   description: string;
   category_id?: string;
   status: 'active' | 'inactive';
}

export const CommunityManager = ({ posts, onDeletePost, showToast }: any) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'groups'>('requests');
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [groups, setGroups] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Partial<Community> | null>(null);

  const fetchData = async () => {
     setLoading(true);
     try {
       const [reqs, grps] = await Promise.all([
          supabase.from('community_requests').select('*, users:profiles!community_requests_user_id_fkey(full_name, email, city, tier)').order('requested_at', { ascending: false }),
          supabase.from('communities').select('*').order('name', { ascending: true })
       ]);
       if (reqs.data) setRequests(reqs.data);
       if (grps.data) setGroups(grps.data);
     } catch (e: any) {
       console.error("Community fetch error", e);
     } finally {
       setLoading(false);
     }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequestStatus = async (req: JoinRequest, status: string) => {
     try {
       await supabase.from('community_requests').update({ status }).eq('id', req.id);
       setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status } : r));
       
       await supabase.from('notifications').insert({
          user_id: req.user_id,
          type: 'community',
          title: `Tribe Request ${status.toUpperCase()}`,
          message: `Your early access request has been evaluated. New Status: ${status}.`,
          metadata: { route: '#/profile' }
       });

       if (showToast) showToast(`Action successful: marked as ${status}`, 'success');
     } catch(e: any) {
       if (showToast) showToast('Failed to update request', 'error');
     }
  };

  const handleSaveGroup = async () => {
    if (!editingGroup?.name) return;
    try {
      if (editingGroup.id) {
         await supabase.from('communities').update({
            name: editingGroup.name,
            description: editingGroup.description,
            status: editingGroup.status || 'active'
         }).eq('id', editingGroup.id);
      } else {
         await supabase.from('communities').insert({
            name: editingGroup.name,
            description: editingGroup.description,
            status: editingGroup.status || 'active'
         });
      }
      setIsEditorOpen(false);
      fetchData();
      if (showToast) showToast('Group saved', 'success');
    } catch(err) {
      if (showToast) showToast('Failed to save group', 'error');
    }
  };

  return (
    <div className="space-y-8 fade-in h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Community <span className="text-brand-teal">Nexus</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">Manage early access requests and organizational groups.</p>
        </div>
        
        <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl">
           {[
             { id: 'requests', label: 'Early Access Requests' },
             { id: 'groups', label: 'Groups / Communities' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-6 py-2 text-[10px] uppercase tracking-widest font-black rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white'}`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
          {requests.map(req => (
             <div key={req.id} className="bg-black/40 border border-white/10 hover:border-white/30 rounded-3xl overflow-hidden flex flex-col transition-all relative">
                <div className="p-6 border-b border-white/5">
                   <div className="flex justify-between items-start mb-4">
                     <span className={`px-2 py-1 rounded-full text-[8px] uppercase tracking-widest font-black border ${
                        req.status === 'pending' ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' : 
                        req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 
                        'bg-red-500/20 text-red-400 border-red-500/50'
                     }`}>
                        {req.status}
                     </span>
                     <span className="text-[10px] text-white/30 font-mono">{new Date(req.requested_at).toLocaleDateString()}</span>
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-tight">{req.users?.full_name || 'Unknown User'}</h3>
                   <p className="text-[10px] text-brand-teal font-bold uppercase tracking-widest mt-1">
                      Requested: General Early Access
                   </p>
                </div>
                {req.notes && (
                   <div className="p-4 bg-white/5 border-b border-white/5 text-[10px] italic text-white/70">
                      "{req.notes}"
                   </div>
                )}
                <div className="p-6 space-y-4 flex-grow bg-white/[0.02] text-[11px]">
                   <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/40 uppercase font-bold tracking-widest text-[9px]">Email</span>
                      <span className="font-mono text-white/80">{req.users?.email}</span>
                   </div>
                   <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/40 uppercase font-bold tracking-widest text-[9px]">City</span>
                      <span className="font-bold text-white/80 uppercase">{req.users?.city || 'Unspecified'}</span>
                   </div>
                   <div className="flex justify-between pb-2">
                      <span className="text-white/40 uppercase font-bold tracking-widest text-[9px]">Membership</span>
                      <span className="font-bold text-brand-coral uppercase">{req.users?.tier || 'None'}</span>
                   </div>
                </div>
                <div className="p-4 border-t border-white/5 flex gap-2 bg-black/80">
                   {req.status === 'pending' && (
                     <>
                        <button onClick={() => handleRequestStatus(req, 'approved')} className="flex-1 py-3 bg-brand-teal text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">Approve</button>
                        <button onClick={() => handleRequestStatus(req, 'rejected')} className="flex-1 py-3 bg-white/5 text-white/60 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">Reject</button>
                     </>
                   )}
                   {req.status !== 'pending' && (
                     <div className="w-full py-3 text-center text-[10px] uppercase tracking-widest font-bold text-white/30">Action Completed</div>
                   )}
                </div>
             </div>
          ))}

          {requests.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center">
               <ShieldCheck size={48} className="text-white/10 mb-4" />
               <p className="text-sm font-black uppercase tracking-widest text-white/40">Zero Pending Requests</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="flex flex-col h-full space-y-6">
           <div className="flex justify-between items-center px-4">
              <h3 className="text-xl font-black uppercase tracking-tighter">Active Topologies</h3>
              <button 
                onClick={() => { setEditingGroup({ status: 'active' }); setIsEditorOpen(true); }}
                className="px-6 py-2 bg-brand-teal text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-glow-teal"
              >
                 <Plus size={14} /> Create Group
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {groups.map(group => (
               <div key={group.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col relative group overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                     <h4 className="text-2xl font-black uppercase tracking-tight max-w-[80%]">{group.name}</h4>
                     <span className={`px-2 py-1 rounded-full text-[8px] uppercase tracking-widest font-black border ${group.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/10 text-white/40 border-white/20'}`}>
                        {group.status}
                     </span>
                  </div>
                  <p className="text-[11px] text-white/60 mb-6 flex-grow">{group.description || 'No description provided.'}</p>
                  
                  <div className="pt-4 border-t border-white/5 flex gap-2">
                     <button onClick={() => { setEditingGroup(group); setIsEditorOpen(true); }} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                        Configure
                     </button>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Group Editor Modal */}
      {isEditorOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-brand-teal/20 p-8 rounded-3xl w-full max-w-lg relative shadow-2xl">
               <button onClick={() => setIsEditorOpen(false)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"><X size={20} /></button>
               <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 text-brand-teal">{editingGroup?.id ? 'Configure Group' : 'Initialize Group'}</h3>
               
               <div className="space-y-6">
                  <div>
                     <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Group Name</label>
                     <input type="text" value={editingGroup?.name || ''} onChange={e => setEditingGroup({...editingGroup, name: e.target.value})} placeholder="e.g. Miami Local, Advanced Training..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white outline-none" />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Description</label>
                     <textarea rows={3} value={editingGroup?.description || ''} onChange={e => setEditingGroup({...editingGroup, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white resize-none outline-none" />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Status</label>
                     <select value={editingGroup?.status || 'active'} onChange={e => setEditingGroup({...editingGroup, status: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white outline-none">
                        <option value="active">Active (Visible)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                     </select>
                  </div>
                  <button onClick={handleSaveGroup} disabled={!editingGroup?.name} className="w-full py-4 bg-brand-teal text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-glow-teal transition-all disabled:opacity-50">Save Group</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
