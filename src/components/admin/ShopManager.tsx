import React, { useState, useMemo } from 'react';
import { ShoppingBag, Plus, Search, Edit2, Trash2, Tag, ChevronRight, X, Save, Image, Link, Video } from 'lucide-react';
import { Product } from '../../types';

interface ShopManagerProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAdd: () => void;
  onEdit: (product: Partial<Product>) => void;
  onDelete: (id: string) => void;
}

export const ShopManager = ({ 
  products, searchQuery, setSearchQuery, 
  onAdd, onEdit, onDelete 
}: ShopManagerProps) => {
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const categories = ['Wellness Products', 'Apparel', 'Recovery', 'Accessories'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategory]);

  return (
    <div className="space-y-12 fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-8">
        <div>
           <h2 className="text-3xl font-black uppercase tracking-tighter">Premium <span className="text-brand-coral">Storefront</span></h2>
           <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Curated lifestyle commerce matrix.</p>
        </div>
        <button 
          onClick={() => {
            onAdd();
            setEditingProduct({ name: '', price: 0, category: 'Wellness Products', is_active: true, is_recommended: false, images: [] });
          }}
          className="flex items-center gap-4 px-8 py-4 bg-brand-coral text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-2xl shadow-[0_0_20px_rgba(251,113,133,0.3)] hover:scale-105 transition-all"
        >
          <Plus size={16} /> Deploy Product
        </button>
      </div>

      {!editingProduct ? (
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row justify-between gap-6 bg-white/5 p-4 rounded-3xl border border-white/5">
              <div className="relative flex-grow">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                 <input 
                   type="text" 
                   placeholder="Search commercial matrix..." 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-brand-coral/50 transition-colors text-sm font-black uppercase tracking-widest"
                 />
              </div>
              <div className="flex gap-2 bg-black/20 p-2 rounded-2xl overflow-x-auto">
                 <button onClick={() => setFilterCategory('All')} className={`px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] whitespace-nowrap transition-all ${filterCategory === 'All' ? 'bg-brand-coral text-black shadow-glow-coral' : 'text-white/40 hover:text-white'}`}>All</button>
                 {categories.map(c => (
                    <button key={c} onClick={() => setFilterCategory(c)} className={`px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] whitespace-nowrap transition-all ${filterCategory === c ? 'bg-white text-black shadow-glow-white' : 'text-white/40 hover:text-white'}`}>{c}</button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                 <div key={p.id} className="card-gradient rounded-3xl border border-brand-coral/10 hover:border-brand-coral/40 transition-all flex flex-col overflow-hidden relative group">
                    <div className="h-48 bg-white/5 relative flex items-center justify-center">
                       {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> : <ShoppingBag size={48} className="text-white/10" />}
                       {p.is_recommended && <span className="absolute top-4 left-4 bg-brand-coral text-black text-[8px] uppercase tracking-widest font-black px-3 py-1 rounded-full shadow-[0_0_10px_rgba(251,113,133,0.5)]">Recommended</span>}
                       <span className={`absolute top-4 right-4 text-[8px] uppercase tracking-widest font-black px-2 py-1 rounded backdrop-blur-md border ${p.is_active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/10 text-white/40 border-white/20'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                       </span>
                    </div>

                    <div className="p-6 flex-grow flex flex-col">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-brand-coral mb-2">{p.category}</p>
                       <h3 className="text-xl font-black tracking-tight leading-none mb-3">{p.name}</h3>
                       
                       <div className="flex gap-4 items-center mb-6">
                           <p className="text-2xl font-black tracking-tighter">${p.price}</p>
                       </div>

                       <div className="mt-auto grid grid-cols-2 gap-3">
                          <button onClick={() => setEditingProduct(p)} className="py-3 bg-white/5 text-white/60 hover:text-white rounded-xl flex justify-center items-center gap-2 text-[10px] uppercase tracking-widest font-black transition-all">
                             <Edit2 size={14} /> Edit
                          </button>
                          <button onClick={() => onDelete(p.id)} className="py-3 bg-brand-coral/10 text-brand-coral hover:bg-brand-coral hover:text-black rounded-xl flex justify-center items-center gap-2 text-[10px] uppercase tracking-widest font-black transition-all">
                             <Trash2 size={14} /> Purge
                          </button>
                       </div>
                    </div>
                 </div>
              ))}
              {filteredProducts.length === 0 && (
                 <div className="col-span-full py-32 text-center border-dashed border border-white/10 rounded-[3rem]">
                    <ShoppingBag size={48} className="mx-auto mb-6 text-white/10" />
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">No commercial assets found in matrix.</p>
                 </div>
              )}
           </div>
        </div>
      ) : (
        <div className="card-gradient border border-white/10 rounded-3xl overflow-hidden relative">
           <div className="sticky top-0 bg-[#111] p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-20">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-brand-coral">{editingProduct.id ? 'Modify Product Structure' : 'Initialize New Product'}</h3>
              <div className="flex gap-3 w-full md:w-auto">
                 <button onClick={() => setEditingProduct(null)} className="flex-1 md:flex-none py-3 px-6 bg-white/5 text-white/60 hover:text-white rounded-xl text-[10px] uppercase font-black tracking-widest transition-all">Cancel</button>
                 <button onClick={() => { onEdit(editingProduct); setEditingProduct(null); }} className="flex-1 md:flex-none py-3 px-8 bg-brand-coral text-black shadow-[0_0_20px_rgba(251,113,133,0.3)] rounded-xl text-[10px] uppercase font-black tracking-[0.2em] flex items-center justify-center gap-2 transition-all">
                    <Save size={14} /> Transmit
                 </button>
              </div>
           </div>

           <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block font-mono">Product Title</label>
                    <input type="text" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-brand-coral text-white font-black uppercase text-xl" />
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    <div>
                       <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block font-mono">Standard Price ($)</label>
                       <input type="number" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-brand-coral text-brand-coral font-black text-xl" />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block font-mono">Category Allocation</label>
                    <select value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-brand-coral text-white font-black uppercase tracking-widest appearance-none">
                       {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block font-mono">Detailed Description</label>
                    <textarea rows={4} value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-brand-coral text-white text-sm" />
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block font-mono flex items-center gap-2"><Image size={14} /> Image Cover URL</label>
                    <input type="text" placeholder="https://" value={editingProduct.images?.[0] || ''} onChange={e => setEditingProduct({...editingProduct, images: [e.target.value]})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-brand-coral text-white text-xs font-mono" />
                 </div>

                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block font-mono flex items-center gap-2"><Link size={14} /> External Link Redirect (Optional)</label>
                    <input type="text" placeholder="URL for off-platform purchase" value={editingProduct.external_link || ''} onChange={e => setEditingProduct({...editingProduct, external_link: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-brand-coral text-white text-xs font-mono" />
                 </div>

                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block font-mono flex items-center gap-2"><Video size={14} /> Video URL (Optional)</label>
                    <input type="text" placeholder="YouTube/Vimeo promo block" value={editingProduct.video_url || ''} onChange={e => setEditingProduct({...editingProduct, video_url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-brand-coral text-white text-xs font-mono" />
                 </div>

                 <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <label className="flex items-center gap-4 cursor-pointer group">
                       <div className="relative">
                          <input type="checkbox" checked={editingProduct.is_active || false} onChange={e => setEditingProduct({...editingProduct, is_active: e.target.checked})} className="sr-only" />
                          <div className={`w-12 h-6 rounded-full transition-colors ${editingProduct.is_active ? 'bg-emerald-500' : 'bg-white/20'}`} />
                          <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${editingProduct.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                       </div>
                       <span className="text-xs uppercase font-black tracking-widest text-white/80 group-hover:text-white transition-colors">Visible in Storefront</span>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer group">
                       <div className="relative">
                          <input type="checkbox" checked={editingProduct.is_recommended || false} onChange={e => setEditingProduct({...editingProduct, is_recommended: e.target.checked})} className="sr-only" />
                          <div className={`w-12 h-6 rounded-full transition-colors ${editingProduct.is_recommended ? 'bg-brand-coral' : 'bg-white/20'}`} />
                          <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${editingProduct.is_recommended ? 'translate-x-6' : 'translate-x-0'}`} />
                       </div>
                       <span className="text-xs uppercase font-black tracking-widest text-white/80 group-hover:text-white transition-colors">Mark as Recommended Matrix</span>
                    </label>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
