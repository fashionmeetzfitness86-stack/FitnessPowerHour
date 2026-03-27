import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Save, Globe, Lock, Shield, 
  ToggleRight, ToggleLeft, Activity, Database,
  Eye, Monitor, DollarSign, Bell, Mail, Smartphone
} from 'lucide-react';

interface SettingsManagerProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SettingsManager = ({ showToast }: SettingsManagerProps) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    platformName: 'Fashion Meetz Fitness',
    contactEmail: 'Fashionmeetzfitness86@gmail.com',
    maintenanceMode: false,
    publicSignUp: true,
    stripeLiveMode: false,
    retreatDeposits: true,
    autoApproveCommunities: false,
    globalAlert: 'New Summer Collective Launching Soon!',
    displayAlert: true
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    showToast('Platform core updated', 'success');
  };

  const tabs = [
    { id: 'general', label: 'Ecosystem', icon: Globe },
    { id: 'billing', label: 'Stripe Nexus', icon: DollarSign },
    { id: 'security', label: 'Encryption', icon: Shield },
    { id: 'notifications', label: 'Comm. Hub', icon: Bell }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-12 fade-in">
      {/* 1. LEFT TABS */}
      <aside className="lg:w-64 flex-shrink-0 space-y-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black transition-all ${
              activeTab === t.id ? 'bg-brand-teal text-black shadow-glow-teal scale-[1.05]' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </aside>

      {/* 2. CONTENT AREA */}
      <div className="flex-1 card-gradient p-12 border border-white/5 rounded-[3rem] space-y-12">
        <AnimatePresence mode="wait">
          {activeTab === 'general' && (
            <motion.div 
              key="general"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-10"
            >
              <div className="flex justify-between items-center bg-brand-teal/5 p-6 rounded-3xl border border-brand-teal/20">
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter text-brand-teal">Ecosystem Status</h3>
                   <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 mt-1">Platform ID: FMF-X-305</p>
                 </div>
                 <div className="flex items-center gap-4 px-6 py-3 bg-brand-teal/10 rounded-2xl border border-brand-teal/20">
                    <Activity size={18} className="text-brand-teal animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-teal">Phase 1 Operational</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black">Platform Designation</label>
                  <input 
                    type="text" 
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-brand-teal/50"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black">Main Comm Hub Email</label>
                  <input 
                    type="text" 
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-brand-teal/50"
                  />
                </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black border-b border-white/5 pb-4">Global Matrix Controls</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      onClick={() => handleToggle('maintenanceMode')}
                      className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                        settings.maintenanceMode ? 'bg-brand-coral/10 border-brand-coral/30 text-brand-coral shadow-glow-coral' : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Monitor size={18} />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black">Maintenance Mode</span>
                      </div>
                      {settings.maintenanceMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button 
                      onClick={() => handleToggle('publicSignUp')}
                      className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                        settings.publicSignUp ? 'bg-brand-teal/10 border-brand-teal/30 text-brand-teal shadow-glow-teal' : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <UserPlus size={18} />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black">Public Registration</span>
                      </div>
                      {settings.publicSignUp ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                 </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full py-5 bg-brand-teal text-black rounded-2xl text-[11px] uppercase tracking-[0.5em] font-black shadow-glow-teal hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
              >
                Overwrite System Identity <Save size={18} />
              </button>
            </motion.div>
          )}

          {activeTab === 'billing' && (
             <motion.div 
              key="billing"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-8"
            >
               <div className="w-24 h-24 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal border border-brand-teal/20 animate-pulse">
                  <DollarSign size={48} />
               </div>
               <div className="space-y-4">
                 <h3 className="text-3xl font-black uppercase tracking-tighter">Stripe Nexus Protocol</h3>
                 <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold max-w-sm mx-auto leading-relaxed italic italic-glow-brand-teal">
                    Accessing financial layer. High-level authorization required to modify Stripe connection parameters.
                 </p>
               </div>
               <button className="px-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] uppercase tracking-[0.6em] font-black text-white/40 hover:text-white hover:bg-white/10 transition-all">Connect Stripe Account</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const UserPlus = ({ size }: { size: number }) => <Activity size={size} />;
