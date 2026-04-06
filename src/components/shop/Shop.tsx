import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ChevronRight, Star, ExternalLink, Activity, ArrowRight, X } from 'lucide-react';
import { supabase } from '../../supabase';
import { Product, UserProfile } from '../../types';

export const Shop = ({ user }: { user: UserProfile | null }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('is_active', true);
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to sync commerce node:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Wellness Products', 'Apparel', 'Recovery', 'Accessories'];
  const recommended = products.filter(p => p.is_recommended);
  const gridProducts = products.filter(p => filterCategory === 'All' || p.category === filterCategory);



  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
         <div className="w-16 h-16 border-4 border-brand-coral border-t-transparent rounded-full animate-spin" />
         <div className="text-[12px] uppercase tracking-[0.4em] text-white/60 font-black animate-pulse">Establishing Commerce Link...</div>
       </div>
     );
  }

  return (
    <div className="space-y-16 fade-in pb-24">
      {/* HEADER */}
      <header className="relative pt-20 pb-12 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-brand-coral/10 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
            Elevate Your <span className="text-brand-coral">Existence</span>
          </h1>
          <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold leading-relaxed">
            Curated provisions for the tactical athlete. Train with structure. Recover with intention.
          </p>
          

        </div>
      </header>

      <div className="px-6 lg:px-12 max-w-7xl mx-auto space-y-20">

        {/* RECOMMENDED SECTION */}
        {recommended.length > 0 && (
          <section className="space-y-8">
             <div className="flex items-center gap-4">
                <Star className="text-brand-coral" size={24} />
                <h2 className="text-2xl font-black uppercase tracking-tighter">Recommended Matrices</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recommended.map(p => (
                   <div key={p.id} className="card-gradient rounded-[2.5rem] border border-white/5 hover:border-brand-coral/30 transition-all flex flex-col overflow-hidden relative group h-[400px]">
                      <div className="absolute inset-0 bg-black/60 z-10" />
                      {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />}
                      
                      <div className="relative z-20 p-8 flex flex-col h-full justify-between">
                         <div>
                            <span className="text-[10px] bg-brand-coral/20 backdrop-blur-md text-white font-black uppercase tracking-widest px-3 py-1 rounded inline-block mb-3 border border-brand-coral/30">Essential Selection</span>
                            <h3 className="text-3xl font-black uppercase tracking-tight leading-none max-w-xs">{p.name}</h3>
                         </div>
                         
                         <div>
                            <div className="flex items-end gap-3 mb-6">
                               <p className="text-4xl font-black tracking-tighter">${p.price.toFixed(2)}</p>
                            </div>
                            
                            {p.external_link ? (
                               <a href={p.external_link} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-white text-black text-[10px] uppercase font-black tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 hover:bg-brand-coral transition-all">
                                  View Off-Platform Link <ExternalLink size={14} />
                               </a>
                            ) : (
                               <button className="w-full py-4 bg-brand-coral text-black text-[10px] uppercase font-black tracking-[0.2em] rounded-xl shadow-[0_0_20px_rgba(251,113,133,0.3)] hover:scale-[1.02] transition-all">
                                  Acquire Asset
                               </button>
                            )}
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </section>
        )}

        {/* CLÉ PARIS INTEGRATION */}
        <section className="relative overflow-hidden rounded-[3rem] border border-white/5">
           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
           <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80" alt="Cle Paris" className="absolute inset-0 w-full h-full object-cover" />
           
           <div className="relative z-20 p-12 md:p-16 max-w-2xl">
              <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/60 mb-2 block">Partnership Node</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">CLÉ PARIS <span className="text-white/40">Collection</span></h2>
              <p className="text-xs uppercase tracking-widest text-white/50 leading-relaxed font-bold mb-8">
                 High-fidelity aesthetic enhancement. Seamlessly integrated into the Fashion Meetz Fitness ecosystem.
              </p>
              <a href="https://cle-paris.com" target="_blank" rel="noopener noreferrer" className="inline-flex py-4 px-8 bg-white text-black text-[10px] uppercase font-black tracking-[0.3em] rounded-2xl hover:scale-105 transition-all gap-3 items-center">
                 Access Collection <ExternalLink size={16} />
              </a>
           </div>
        </section>

        {/* FULL GRID */}
        <section className="space-y-12">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Provision Database</h2>
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-4 md:pb-0">
                 <button onClick={() => setFilterCategory('All')} className={`px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] whitespace-nowrap transition-all ${filterCategory === 'All' ? 'bg-white text-black shadow-glow-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>All</button>
                 {categories.map(c => (
                    <button key={c} onClick={() => setFilterCategory(c)} className={`px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] whitespace-nowrap transition-all ${filterCategory === c ? 'bg-white text-black shadow-glow-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>{c}</button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gridProducts.map(p => (
                 <div key={p.id} className="group cursor-pointer">
                    <div className="aspect-[3/4] bg-white/5 rounded-3xl overflow-hidden relative mb-4">
                       {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" /> : <ShoppingBag size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10" />}
                       
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          {p.external_link ? (
                             <a href={p.external_link} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white text-black hover:bg-brand-coral rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Launch Link</a>
                          ) : (
                             <button className="px-6 py-3 bg-brand-coral text-black hover:scale-105 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-glow-coral transition-all">Add to Cart</button>
                          )}
                       </div>
                    </div>
                    
                    <div className="space-y-1">
                       <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/40">{p.category}</p>
                       <h4 className="text-lg font-black uppercase tracking-tight group-hover:text-brand-coral transition-colors">{p.name}</h4>
                       <div className="flex items-center gap-3">
                          <p className="text-sm font-black tracking-tighter">${p.price.toFixed(2)}</p>
                       </div>
                    </div>
                 </div>
              ))}
              {gridProducts.length === 0 && (
                 <div className="col-span-full py-20 text-center border-dashed border border-white/10 rounded-3xl opacity-50">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/40">No provisions actively registered in this matrix.</p>
                 </div>
              )}
           </div>
        </section>
      </div>
    </div>
  );
};
