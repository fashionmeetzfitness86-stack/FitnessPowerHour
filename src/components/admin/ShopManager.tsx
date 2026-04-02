import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Plus, Search, Edit2, 
  Trash2, Package, Tag, Layers,
  ChevronRight, AlertCircle, TrendingUp, X, Save
} from 'lucide-react';
import { Product, Brand, ProductCategory } from '../../types';
import { MediaCapture } from '../MediaCapture';

interface ShopManagerProps {
  products: Product[];
  brands: Brand[];
  categories: ProductCategory[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ShopManager = ({ 
  products, brands, categories, 
  searchQuery, setSearchQuery, 
  onAdd, onEdit, onDelete 
}: ShopManagerProps) => {
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || p.category_id === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategory]);

  const stats = {
    totalValue: products.reduce((acc, p) => acc + (p.price * (p.inventory_count || 0)), 0),
    lowStock: products.filter(p => (p.inventory_count || 0) <= 5).length,
    activeItems: products.filter(p => p.status === 'active').length
  };

  return (
    <div className="space-y-12 fade-in">
      {/* Inventory Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-gradient p-8 flex items-center justify-between border border-white/5">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Inventory Value</p>
            <h3 className="text-2xl font-bold tracking-tighter">${stats.totalValue.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-brand-teal/10 rounded-xl text-brand-teal">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="card-gradient p-8 flex items-center justify-between border border-white/5">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold tracking-tighter">{stats.lowStock} <span className="text-[10px] text-brand-coral">Items</span></h3>
          </div>
          <div className="p-3 bg-brand-coral/10 rounded-xl text-brand-coral">
            <AlertCircle size={24} />
          </div>
        </div>
        <div className="card-gradient p-8 flex items-center justify-between border border-white/5">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Active Listings</p>
            <h3 className="text-2xl font-bold tracking-tighter">{stats.activeItems} / {products.length}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <ShoppingBag size={24} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Product <span className="text-brand-coral">Control</span></h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Catalog management, inventory levels, and merchandising.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input
              type="text"
              placeholder="Search catalog..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:border-brand-teal transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-grow lg:flex-none bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer appearance-none hover:bg-white/10 transition-all text-white/60"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button 
            onClick={onAdd}
            className="flex-grow lg:flex-none px-8 py-3 bg-brand-coral text-black font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(251,113,133,0.3)] transition-all"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="card-gradient rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Product</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Inventory & SKU</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Price Point</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Status</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 relative">
                        {p.featured_image ? (
                          <img src={p.featured_image} alt={p.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/10"><Package size={24} /></div>
                        )}
                        {(p.inventory_count || 0) <= 5 && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-brand-coral rounded-full shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight group-hover:text-brand-teal transition-colors line-clamp-1">{p.name}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[8px] uppercase tracking-widest text-brand-teal font-bold bg-brand-teal/10 px-2 py-0.5 rounded">
                            {brands.find(b => b.id === p.brand_id)?.name || 'FMF Collective'}
                          </span>
                          <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold italic">
                            {p.category_id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className={`text-sm font-mono font-bold ${p.inventory_count && p.inventory_count <= 5 ? 'text-brand-coral' : 'text-white'}`}>
                        {p.inventory_count || 0} In Stock
                      </p>
                      <p className="text-[9px] text-white/20 uppercase tracking-widest font-mono">SKU: {p.sku || 'PENDING'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-base font-mono font-bold text-brand-teal">${p.price.toFixed(2)}</p>
                      {p.compare_at_price && p.compare_at_price > p.price && (
                        <p className="text-[9px] text-white/20 line-through font-mono decoration-brand-coral/40">${p.compare_at_price.toFixed(2)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-lg font-black border ${
                      p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      p.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-brand-coral/10 text-brand-coral border-brand-coral/20'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => setEditingProduct(p)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-brand-teal hover:text-black transition-all shadow-xl"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => onDelete(p.id)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-brand-coral hover:text-white transition-all shadow-xl"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button className="p-3 rounded-xl bg-white/5 hover:bg-white/20 transition-all shadow-xl">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="py-24 text-center space-y-4">
            <Package size={48} className="mx-auto text-white/5" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold italic">No matching products found in catalog</p>
          </div>
        )}
      </div>
      
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl overflow-y-auto">
          <div className="card-gradient w-full max-w-2xl p-10 space-y-8 rounded-[3rem] border border-brand-teal/30 relative my-10">
            <button onClick={() => setEditingProduct(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Edit <span className="text-brand-teal">Product Data</span></h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Name</label>
                <input 
                  type="text" 
                  value={editingProduct.name || ''} 
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Price ($)</label>
                  <input 
                    type="number" 
                    value={editingProduct.price || 0} 
                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Inventory Count</label>
                  <input 
                    type="number" 
                    value={editingProduct.inventory_count || 0} 
                    onChange={e => setEditingProduct({ ...editingProduct, inventory_count: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Product Image</label>
                <MediaCapture 
                  bucket="fmf-media" 
                  folder="products" 
                  accept="image/*"
                  onUploadSuccess={(url) => setEditingProduct({ ...editingProduct, featured_image: url })}
                />
                {editingProduct.featured_image && <p className="text-[8px] text-brand-teal uppercase font-bold tracking-widest mt-2 px-2">Image Sync Initialized</p>}
              </div>

              <button 
                onClick={() => {
                  onEdit(editingProduct as Product);
                  setEditingProduct(null);
                }}
                className="w-full py-4 mt-6 bg-brand-teal text-black text-[10px] uppercase tracking-[0.3em] font-black rounded-xl hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} /> Update Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
