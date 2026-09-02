import React, { useState, useEffect } from 'react';
import { Sliders, Save, Image as ImageIcon, Link as LinkIcon, Type, Calendar, RefreshCw } from 'lucide-react';
import { useSiteContent } from '../../hooks/useSiteContent';

interface SiteContentManagerProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SiteContentManager = ({ showToast }: SiteContentManagerProps) => {
  const { get, updateMultiple, loading } = useSiteContent();

  const [form, setForm] = useState({
    home_hero_bg_image: '/images/rooftop-movement-social.jpg',
    home_hero_title: '',
    home_hero_subtitle: '',
    home_hero_btn_text: 'REGISTER FOR THE NEXT EVENT',
    home_hero_btn_url: 'https://events.sweatpals.com/dd913e23',
    home_hero_secondary_btn_text: 'JOIN FOR FREE',
    home_hero_secondary_btn_url: '/membership'
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm({
      home_hero_bg_image: get('home_hero_bg_image', '/images/rooftop-movement-social.jpg'),
      home_hero_title: get('home_hero_title', ''),
      home_hero_subtitle: get('home_hero_subtitle', ''),
      home_hero_btn_text: get('home_hero_btn_text', 'REGISTER FOR THE NEXT EVENT'),
      home_hero_btn_url: get('home_hero_btn_url', 'https://events.sweatpals.com/dd913e23'),
      home_hero_secondary_btn_text: get('home_hero_secondary_btn_text', 'JOIN FOR FREE'),
      home_hero_secondary_btn_url: get('home_hero_secondary_btn_url', '/membership')
    });
  }, [loading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateMultiple(form);
      showToast('Hero section & Back Office settings updated successfully! ✅', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setForm({
      home_hero_bg_image: '/images/rooftop-movement-social.jpg',
      home_hero_title: '',
      home_hero_subtitle: '',
      home_hero_btn_text: 'REGISTER FOR THE NEXT EVENT',
      home_hero_btn_url: 'https://events.sweatpals.com/dd913e23',
      home_hero_secondary_btn_text: 'JOIN FOR FREE',
      home_hero_secondary_btn_url: '/membership'
    });
    showToast('Form reset to Rooftop Movement Social defaults', 'info');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-black p-8 rounded-3xl border border-white/10 card-gradient">
        <div>
          <div className="flex items-center gap-2 text-brand-teal text-xs font-bold uppercase tracking-widest mb-1">
            <Sliders size={16} /> Back Office Content Control
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Homepage Hero & Event Settings</h2>
          <p className="text-xs text-white/50 font-light mt-1">
            Modify the homepage hero graphic, event registration link, titles, and button selection settings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs uppercase font-bold tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <RefreshCw size={14} /> Reset Defaults
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Hero Graphic / Image */}
        <div className="bg-brand-black p-8 rounded-3xl border border-white/10 space-y-6 card-gradient">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <ImageIcon className="text-brand-coral" size={20} />
            <div>
              <h3 className="text-base font-bold uppercase tracking-wide text-white">Hero Background Graphic / Banner</h3>
              <p className="text-xs text-white/40 font-light">Set the primary hero banner image URL (e.g. uploaded event flyer)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-white/70">Image URL / Path</label>
              <input
                type="text"
                value={form.home_hero_bg_image}
                onChange={(e) => setForm({ ...form, home_hero_bg_image: e.target.value })}
                placeholder="/images/rooftop-movement-social.jpg or https://..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-teal transition-all text-white"
              />
            </div>

            {/* Preview Box */}
            {form.home_hero_bg_image && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Current Banner Preview</span>
                <div className="relative h-48 rounded-2xl overflow-hidden border border-white/10 group">
                  <img
                    src={form.home_hero_bg_image}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-brand-black/40 flex items-end p-4">
                    <span className="text-[10px] uppercase tracking-widest text-brand-teal font-bold bg-brand-black/80 px-3 py-1 rounded-full border border-brand-teal/30">
                      Active Banner Preview
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Event Registration & Button Links */}
        <div className="bg-brand-black p-8 rounded-3xl border border-white/10 space-y-6 card-gradient">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Calendar className="text-brand-teal" size={20} />
            <div>
              <h3 className="text-base font-bold uppercase tracking-wide text-white">Event Registration & Button Selection Settings</h3>
              <p className="text-xs text-white/40 font-light">Configure the main call-to-action button and SweatPals / registration link</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-brand-teal">Primary Button Label</label>
              <input
                type="text"
                value={form.home_hero_btn_text}
                onChange={(e) => setForm({ ...form, home_hero_btn_text: e.target.value })}
                placeholder="REGISTER FOR THE NEXT EVENT"
                className="w-full bg-white/5 border border-brand-teal/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-teal transition-all text-white font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-brand-coral flex items-center justify-between">
                <span>Event Registration Link (SweatPals URL)</span>
                <LinkIcon size={12} />
              </label>
              <input
                type="text"
                value={form.home_hero_btn_url}
                onChange={(e) => setForm({ ...form, home_hero_btn_url: e.target.value })}
                placeholder="https://events.sweatpals.com/dd913e23"
                className="w-full bg-white/5 border border-brand-coral/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-coral transition-all text-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-white/70">Secondary Button Label</label>
              <input
                type="text"
                value={form.home_hero_secondary_btn_text}
                onChange={(e) => setForm({ ...form, home_hero_secondary_btn_text: e.target.value })}
                placeholder="JOIN FOR FREE"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-teal transition-all text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-white/70">Secondary Button Path</label>
              <input
                type="text"
                value={form.home_hero_secondary_btn_url}
                onChange={(e) => setForm({ ...form, home_hero_secondary_btn_url: e.target.value })}
                placeholder="/membership"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-teal transition-all text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Optional Overlay Titles */}
        <div className="bg-brand-black p-8 rounded-3xl border border-white/10 space-y-6 card-gradient">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Type className="text-amber-400" size={20} />
            <div>
              <h3 className="text-base font-bold uppercase tracking-wide text-white">Optional Text Overlays</h3>
              <p className="text-xs text-white/40 font-light">Leave blank if the flyer graphic already contains title artwork</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-white/70">Overlay Title (Optional)</label>
              <input
                type="text"
                value={form.home_hero_title}
                onChange={(e) => setForm({ ...form, home_hero_title: e.target.value })}
                placeholder="Leave empty for clean flyer graphic or enter text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-teal transition-all text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-white/70">Overlay Subtitle (Optional)</label>
              <input
                type="text"
                value={form.home_hero_subtitle}
                onChange={(e) => setForm({ ...form, home_hero_subtitle: e.target.value })}
                placeholder="e.g. A Morning Wellness Experience on the Rooftop"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-teal transition-all text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-10 py-4 bg-brand-teal text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-brand-teal/90 shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all flex items-center gap-2"
          >
            {isSaving ? 'Saving Back Office Settings...' : 'Save Back Office Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
