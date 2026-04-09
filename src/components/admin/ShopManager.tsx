import React, { useState, useMemo } from 'react';
import { ShoppingBag, Upload, Trash2, X, Save, CheckSquare, Square, AlertTriangle, Eye, Edit2, PlayCircle, Plus } from 'lucide-react';
import { MediaCapture } from '../MediaCapture';

// Extend base product to include local frontend needs
export interface ShopProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    video_url?: string;
    external_link?: string;
    is_recommended: boolean;
    is_active: boolean;
    visibility: 'general' | 'members'; // We assume this exists or standardizes on the UI
}

interface ShopManagerProps {
    products: ShopProduct[];
    onEdit: (product: ShopProduct) => void;
    onDelete: (id: string) => void;
    memberDiscountValue?: number; // e.g. 0.20 for 20%
}

export const ShopManager = ({ products, onEdit, onDelete, memberDiscountValue = 0.20 }: ShopManagerProps) => {
    const [editingProduct, setEditingProduct] = useState<Partial<ShopProduct> | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [quickFilter, setQuickFilter] = useState('ALL');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const categories = ['ALL', 'Apparel', 'Wellness', 'Recovery', 'Accessories', 'Digital'];

    const filteredProducts = useMemo(() => {
        let result = products;
        if (quickFilter !== 'ALL') {
            result = result.filter(p => p.category?.toLowerCase() === quickFilter.toLowerCase());
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
        }
        return result;
    }, [products, quickFilter, searchQuery]);

    const handleSave = () => {
        if (editingProduct) {
            onEdit({
                ...editingProduct,
                images: editingProduct.images || [],
                is_active: editingProduct.is_active === undefined ? true : editingProduct.is_active,
                visibility: editingProduct.visibility || 'general'
            } as ShopProduct);
            setEditingProduct(null);
            setShowAdvanced(false);
        }
    };

    const handleBulkDelete = () => {
        selectedProducts.forEach(id => onDelete(id));
        setSelectedProducts([]);
    };

    return (
        <div className="space-y-6 fade-in h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Shop <span className="text-brand-coral">Control</span></h2>
                    <p className="text-xs uppercase tracking-widest text-white/40 mt-1 font-bold">Manage commerce and products</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full lg:w-64 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-coral text-white"
                    />
                    <button 
                        onClick={() => setEditingProduct({ name: '', price: 0, category: 'Apparel', images: [], is_active: true, is_recommended: false, visibility: 'general' })}
                        className="w-full md:w-auto px-8 py-3 bg-brand-coral text-black font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-md"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
                {categories.map(chip => (
                    <button 
                        key={chip}
                        onClick={() => setQuickFilter(chip)}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-sm border ${
                        quickFilter === chip 
                        ? 'bg-brand-coral text-black border-transparent' 
                        : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                        }`}
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Bulk Bar */}
            {selectedProducts.length > 0 && (
                <div className="bg-brand-coral/10 border border-brand-coral/30 rounded-2xl p-4 flex items-center gap-4 text-brand-coral animate-in slide-in-from-top-4">
                    <CheckSquare size={18} />
                    <span className="text-sm font-black uppercase tracking-widest">{selectedProducts.length} Selected</span>
                    <button onClick={handleBulkDelete} className="ml-auto px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-xs font-bold uppercase hover:bg-red-500/30">Delete Selected</button>
                </div>
            )}

            {/* Grid */}
            {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-white/10 rounded-[2rem] bg-black/20">
                    <ShoppingBag size={48} className="text-white/20 mb-6" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">No products found</h3>
                    <button 
                        onClick={() => setEditingProduct({ name: '', price: 0, category: 'Apparel', images: [], is_active: true })}
                        className="mt-6 px-8 py-4 bg-white/5 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                        Add First Product
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                        const isSelected = selectedProducts.includes(product.id);
                        return (
                            <div key={product.id} className={`relative overflow-hidden rounded-[2rem] border transition-all flex flex-col group bg-[#111] ${isSelected ? 'border-brand-coral shadow-[0_0_20px_rgba(232,116,97,0.2)]' : 'border-white/10 hover:border-white/30'}`}>
                                <div className="absolute top-3 left-3 z-20">
                                    <button onClick={() => setSelectedProducts(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id])} className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/50 text-white/40 border border-white/10 hover:text-white">
                                        {isSelected ? <CheckSquare size={16} className="text-brand-coral" /> : <Square size={16} />}
                                    </button>
                                </div>
                                <div className="absolute top-3 right-3 z-20 flex gap-1">
                                    <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-md ${product.is_active ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>{product.is_active ? 'Active' : 'Hidden'}</span>
                                    {product.visibility === 'members' && <span className="px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-md bg-brand-teal text-black">Members</span>}
                                </div>

                                {deletingId === product.id && (
                                    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                                        <AlertTriangle size={32} className="text-red-500 mb-4" />
                                        <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Confirm Delete?</h4>
                                        <div className="flex gap-4 w-full">
                                            <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-white/10 text-white text-xs font-bold uppercase rounded-xl">Cancel</button>
                                            <button onClick={() => { onDelete(product.id); setDeletingId(null); }} className="flex-1 py-3 bg-red-500 text-white text-xs font-black uppercase rounded-xl">Delete</button>
                                        </div>
                                    </div>
                                )}

                                <div className="aspect-square bg-white/5 relative">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-white/10"><ShoppingBag size={48} /></div>
                                    )}
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-black text-lg uppercase tracking-tight line-clamp-1 mb-1">{product.name}</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-brand-coral font-bold">${product.price}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-white/40">{product.category}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-auto border-t border-white/5 pt-4">
                                        <button onClick={() => setEditingProduct(product)} className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white text-white/60 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            <Edit2 size={14} /> Edit
                                        </button>
                                        <button onClick={() => setDeletingId(product.id)} className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* SIDE PANEL EDITOR */}
            {editingProduct && (
                <>
                    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setEditingProduct(null)} />
                    <div className="fixed inset-y-0 right-0 z-[210] w-full max-w-lg bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h3 className="text-xl font-black uppercase tracking-tighter">{editingProduct.id ? 'Edit' : 'Add'} Product</h3>
                            <button onClick={() => setEditingProduct(null)} className="p-2 text-white/40 hover:text-white bg-white/5 rounded-full"><X size={18} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            
                            {/* PRIMARY FIELDS */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-brand-coral font-bold">Product Title</label>
                                <input type="text" value={editingProduct.name || ''} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full bg-transparent border-b-2 border-white/10 px-0 py-3 text-2xl font-black uppercase tracking-tight outline-none focus:border-brand-coral text-white placeholder:text-white/20" placeholder="e.g. FMF Recovery Hoodie" />
                            </div>

                            {/* Dynamic Pricing Engine */}
                            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Base Price ($)</label>
                                    <input type="number" value={editingProduct.price || 0} onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-coral text-white font-bold" />
                                </div>
                                <div className="space-y-2 opacity-70 border-l border-white/10 pl-4">
                                    <label className="text-[10px] uppercase tracking-widest text-brand-teal font-bold">Member Price</label>
                                    <div className="px-4 py-3 text-sm text-brand-teal font-black flex items-center gap-2">
                                        ~ ${((editingProduct.price || 0) * (1 - memberDiscountValue)).toFixed(2)}
                                    </div>
                                    <p className="text-[9px] uppercase tracking-widest text-white/30">Auto-{memberDiscountValue * 100}% Discount</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Description</label>
                                <textarea rows={3} value={editingProduct.description || ''} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-coral text-white resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Category</label>
                                    <select value={editingProduct.category || 'Apparel'} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-brand-coral text-white/80 appearance-none uppercase tracking-widest font-bold">
                                        {categories.filter(c => c!=='ALL').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Status</label>
                                    <select value={editingProduct.is_active ? 'true' : 'false'} onChange={e => setEditingProduct({ ...editingProduct, is_active: e.target.value === 'true' })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-emerald-500 text-white/80 appearance-none uppercase tracking-widest font-bold">
                                        <option value="true">Live (Active)</option>
                                        <option value="false">Hidden (Draft)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Primary Image</label>
                                {editingProduct.images?.[0] ? (
                                    <div className="relative aspect-square w-32 rounded-xl overflow-hidden border border-white/10 group">
                                        <img src={editingProduct.images[0]} alt="preview" className="w-full h-full object-cover" />
                                        <button onClick={() => setEditingProduct({ ...editingProduct, images: [] })} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <MediaCapture bucket="fmf-media" folder="shop" accept="image/*" onUploadSuccess={(url) => setEditingProduct({ ...editingProduct, images: [url] })} />
                                    </div>
                                )}
                            </div>

                            {/* ADVANCED OVERLAY */}
                            <div className="pt-4 border-t border-white/10">
                                <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs uppercase tracking-widest font-bold text-white/40 hover:text-white transition-all flex items-center gap-2">
                                {showAdvanced ? 'Hide Additional Options' : 'More Options'}
                                </button>
                                
                                {showAdvanced && (
                                    <div className="pt-6 space-y-6 animate-in fade-in">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Audience</label>
                                            <select value={editingProduct.visibility || 'general'} onChange={e => setEditingProduct({ ...editingProduct, visibility: e.target.value as 'general'|'members' })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-brand-coral text-white/80 uppercase">
                                                <option value="general">Everyone</option>
                                                <option value="members">Members Only</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Product Video URL (Optional)</label>
                                            <input type="url" value={editingProduct.video_url || ''} onChange={e => setEditingProduct({ ...editingProduct, video_url: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-coral text-white" />
                                        </div>
                                        <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
                                            <input type="checkbox" checked={editingProduct.is_recommended || false} onChange={e => setEditingProduct({ ...editingProduct, is_recommended: e.target.checked })} className="w-5 h-5 accent-brand-coral" />
                                            <span className="text-xs uppercase tracking-widest font-bold text-white/80">Feature / Recommend</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-[#050505]">
                            <button onClick={handleSave} disabled={!editingProduct.name || !editingProduct.price} className="w-full py-5 bg-brand-coral text-black text-xs uppercase tracking-[0.2em] font-black rounded-2xl hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                <Save size={18} /> Publish Product
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
