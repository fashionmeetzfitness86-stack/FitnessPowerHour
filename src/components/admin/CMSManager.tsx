import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, X, Search, Link2, ImageIcon, Type } from 'lucide-react';
import { supabase } from '../../supabase';
import { SiteContent } from '../../types';

interface CMSManagerProps {
  contentKeys: SiteContent[];
  onAdd: () => void;
  onEdit: (data: Partial<SiteContent>) => void;
  onDelete: (id: string) => void;
  showToast: (m: string, t?: 'success'|'error') => void;
}

export const CMSManager = ({ contentKeys, onAdd, onEdit, onDelete, showToast }: CMSManagerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContent, setEditingContent] = useState<SiteContent | Partial<SiteContent> | null>(null);
  
  const filteredContent = contentKeys.filter(c => 
    c.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getIconForType = (type: string) => {
    switch (type) {
      case 'image_url': return <ImageIcon size={16} className="text-brand-coral" />;
      case 'link': return <Link2 size={16} className="text-blue-400" />;
      default: return <Type size={16} className="text-brand-teal" />;
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-black p-6 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Search content keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-brand-teal transition-colors text-white"
            />
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setEditingContent({ key: 'new_prefix_key', value: '', type: 'text', description: 'New dynamic content key' })}
            className="flex-1 md:flex-none btn-primary py-3 px-6 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> New Variable
          </button>
        </div>
      </div>

      {/* Content Table */}
      <div className="grid grid-cols-1 gap-4">
        {filteredContent.map(content => (
          <div 
            key={content.id} 
            className="card-gradient p-6 border border-white/5 hover:border-brand-teal/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  {getIconForType(content.type)}
               </div>
               <div className="space-y-1">
                 <h4 className="text-sm font-bold uppercase tracking-widest text-white">{content.key}</h4>
                 <p className="text-[10px] uppercase tracking-widest text-white/40">{content.description || 'No description assigned'}</p>
                 <div className="mt-2 text-xs text-brand-teal line-clamp-1 border-l-2 border-brand-teal/30 pl-3 italic">
                    "{content.value}"
                 </div>
               </div>
            </div>

            <button 
              onClick={() => setEditingContent(content)}
              className="px-6 py-2 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-brand-teal/10 hover:text-brand-teal transition-all whitespace-nowrap"
            >
              Configure
            </button>
          </div>
        ))}
        {filteredContent.length === 0 && (
          <div className="p-12 text-center text-white/40 uppercase tracking-widest text-sm border border-dashed border-white/10 rounded-3xl">
             No content configuration nodes found.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingContent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-black/90 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-gradient p-8 rounded-3xl w-full max-w-lg border border-brand-teal/20 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-4 border-b border-brand-teal/20">
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                {editingContent.id ? 'Edit Variable' : 'Create Variable'}
              </h3>
              <button onClick={() => setEditingContent(null)} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              onEdit(editingContent);
              setEditingContent(null);
            }}>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-brand-teal font-bold">Key (Identifier)</label>
                <input
                  type="text"
                  value={editingContent.key || ''}
                  onChange={e => setEditingContent({...editingContent, key: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal text-white"
                  placeholder="e.g., home_hero_title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-brand-teal font-bold">Content Type</label>
                <select
                  value={editingContent.type || 'text'}
                  onChange={e => setEditingContent({...editingContent, type: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal text-white"
                  required
                >
                  <option value="text">Raw Text</option>
                  <option value="image_url">Image URL</option>
                  <option value="link">Hyperlink</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-brand-teal font-bold">Value Payload</label>
                <textarea
                  value={editingContent.value || ''}
                  onChange={e => setEditingContent({...editingContent, value: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal text-white min-h-[120px]"
                  placeholder="The actual text, link, or media path."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Description (Private)</label>
                <input
                  type="text"
                  value={editingContent.description || ''}
                  onChange={e => setEditingContent({...editingContent, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal text-white"
                  placeholder="Where does this appear?"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button type="submit" className="flex-1 btn-primary py-3 px-6 flex items-center justify-center gap-2">
                  <Save size={18} /> Deploy Variable
                </button>
                {editingContent.id && (
                  <button 
                    type="button" 
                    onClick={() => { onDelete(editingContent.id!); setEditingContent(null); }}
                    className="btn-outline py-3 px-6 border-brand-coral text-brand-coral hover:bg-brand-coral hover:text-black flex items-center justify-center"
                  >
                    Purge
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
