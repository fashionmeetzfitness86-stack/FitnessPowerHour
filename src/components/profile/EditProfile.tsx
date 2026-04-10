import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, UserCircle, Activity, AlertCircle, Shield, Key, Mail, Trash2, Eye, EyeOff, X, Phone, User as UserIcon, Send, ArrowRight, Edit, Flame, Dumbbell, Target, HeartPulse, Clock, Zap, CreditCard, Crown, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../supabase';
import { UserProfile } from '../../types';
import { MediaCapture } from '../MediaCapture';
import { useAuth } from '../../App';

export const EditProfile = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  const { updateProfile, updateSecurity } = useAuth();
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profile_image: user?.profile_image || '',
    city: user?.city || '',
    country: user?.country || '',
    date_of_birth: user?.date_of_birth || '',
    age: user?.age || undefined,
    height: user?.height || '',
    weight: user?.weight || '',
    workout_style: user?.workout_style || '',
    training_goals: user?.training_goals || '',
    fitness_level: user?.fitness_level || 'Intermediate',
    limitations_or_injuries: user?.limitations_or_injuries || '',
    short_bio: user?.short_bio || '',
    motivation: user?.motivation || '',
    profile_images: user?.profile_images || []
  });

  const [securityData, setSecurityData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [trainingRequest, setTrainingRequest] = useState({
    message: '',
    phone: user?.phone || '',
    isSubmitting: false,
    showModal: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics'>('overview');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRemoveImage = (url: string) => {
    setFormData(prev => ({ 
      ...prev, 
      profile_images: prev.profile_images?.filter(u => u !== url),
      profile_image: prev.profile_image === url ? (prev.profile_images?.find(u => u !== url) || '') : prev.profile_image
    }));
    showToast('Image removed.', 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      
      const payloadToSave = { ...formData };
      
      // Prevent PostgreSQL error: invalid input syntax for type date: ""
      if (!payloadToSave.date_of_birth || payloadToSave.date_of_birth === '') {
         payloadToSave.date_of_birth = null as any;
      }

      await updateProfile(payloadToSave);
      
      showToast('Neural matrix synchronized successfully.', 'success');
      setIsEditing(false);
    } catch (error: any) {
      showToast(error.message || 'Synchronization failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!securityData.newPassword) return showToast('Enter new password', 'error');
    if (securityData.newPassword !== securityData.confirmPassword) {
      return showToast('Passwords do not match', 'error');
    }

    try {
      await updateSecurity(undefined, securityData.newPassword);
      showToast('Security credentials updated.', 'success');
      setSecurityData({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.message || 'Error updating security settings', 'error');
    }
  };

  const handleTrainingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrainingRequest(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Simulate/Trigger Email-based request
      // In a real system, this would be a Netlify function call to SendGrid/Postmark
      const { error } = await supabase.from('service_requests').insert({
          user_id: user.id,
          service_type: 'personal_training',
          service_subtype: 'training_session',
          requested_date: new Date().toISOString().split('T')[0],
          requested_time: '12:00:00',
          notes: `Name: ${user.full_name || 'Unknown'} | Email: ${user.email} | Phone: ${trainingRequest.phone} | Msg: ${trainingRequest.message} (VIP Intake)`,
          status: 'pending'
      });

      if (error) throw error;

      showToast('1-on-1 Protocol requested. Admin will contact you.', 'success');
      setTrainingRequest({ message: '', phone: user?.phone || '', isSubmitting: false, showModal: false });
    } catch (error: any) {
      showToast(error.message || 'Request failed.', 'error');
      setTrainingRequest(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 relative z-10">
        <div>
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter flex items-center gap-4">
            {isEditing ? 'Profile Settings' : <><Shield className="text-brand-teal" size={36} /> Intel <span className="text-brand-coral">Profile</span></>}
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold max-w-md">
            {isEditing ? 'Execute structural updates to your athlete profile.' : 'Live telemetry and structural profile data.'}
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            {!isEditing && (
              <button 
                  onClick={() => setIsEditing(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 hover:border-brand-teal text-white hover:text-brand-teal text-[10px] uppercase tracking-widest font-black rounded-[2rem] transition-all"
              >
                  <Edit size={14} /> Edit Profile
              </button>
            )}
            <button 
                onClick={(e) => { e.preventDefault(); setTrainingRequest(prev => ({ ...prev, showModal: true })); }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 border border-brand-teal text-brand-teal text-[10px] uppercase tracking-widest font-black rounded-[2rem] hover:bg-brand-teal hover:text-black transition-all"
            >
                <UserIcon size={14} /> Request 1-on-1
            </button>
        </div>
      </header>

      {!isEditing ? (
        <div className="space-y-8 pb-32">
          {/* Hero Row */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 card-gradient border border-white/5 p-8 rounded-[3rem]">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-brand-teal/5 border border-brand-teal/20 rounded-3xl flex items-center justify-center text-5xl font-black text-brand-teal shrink-0 relative overflow-hidden shadow-[0_0_50px_rgba(45,212,191,0.1)]">
              {user.profile_image
                ? <img src={user.profile_image} alt="Avatar" className="w-full h-full object-cover" />
                : (user.full_name || user.email || 'U')[0].toUpperCase()}
              {user.country && (
                <div className="absolute bottom-2 right-2 bg-black/80 px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-widest font-black text-white border border-white/10">
                  {user.country}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-center md:text-left pt-4 md:pt-0">
              <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tight truncate text-white mb-2">
                {user.full_name || 'Ghost Athlete'}
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 mb-6">
                <p className="text-xs text-white/60 font-mono flex items-center gap-2">
                  <Mail size={14} className="text-brand-teal" /> {user.email}
                </p>
                {user.phone && (
                  <p className="text-xs text-white/60 font-mono flex items-center gap-2 md:border-l md:border-white/10 md:pl-4">
                    <Phone size={14} className="text-brand-teal" /> {user.phone}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  <CheckCircle size={12} /> {user.status || 'Active'}
                </span>
                {(user.age || user.city) && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-white/5 border-white/10 text-white/60">
                    {user.age ? `${user.age} Y/O` : 'AGE N/A'}
                    {user.city ? ` / ${user.city}` : ''}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-brand-coral/10 border-brand-coral/20 text-brand-coral">
                  <Flame size={12} /> {(user as any).streak_count || 0} Day Streak
                </span>
              </div>
              {user.short_bio && (
                <div className="mt-6 p-5 bg-black/40 border border-white/5 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-2 flex items-center gap-2 justify-center md:justify-start"><Target size={12}/> Motivation / Goal</p>
                  <p className="text-sm text-white/80 italic leading-relaxed">"{user.short_bio}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 relative z-10 gap-8 px-4 overflow-x-auto">
            {['overview', 'metrics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-brand-teal' : 'text-white/30 hover:text-white/60'}`}
              >
                {tab === 'overview' ? 'Account Base' : 'Athletic Intel'}
                {activeTab === tab && (
                  <motion.div layoutId="activetab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal rounded-t-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="relative z-10 pt-4">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Platform Role', value: user.role || 'user', icon: Crown },
                  { label: 'Access Tier', value: user.tier || 'Free', icon: Zap },
                  { label: 'Membership', value: (user as any).membership_status || '—', icon: CreditCard },
                  { label: 'Joined', value: user.signup_date ? new Date(user.signup_date).toLocaleDateString() : '—', icon: Clock },
                  { label: 'Stripe Sub ID', value: user.stripe_subscription_id || 'N/A', icon: CreditCard },
                  { label: 'Last Check-In', value: user.last_checkin || 'Never', icon: Activity },
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white/[0.02] rounded-3xl border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-4 flex items-center gap-2">
                      <item.icon size={12} className="text-white/30" /> {item.label}
                    </p>
                    <p className="text-lg font-black text-white truncate capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                  <p className="text-[10px] uppercase tracking-widest text-brand-teal font-black mb-6 flex items-center gap-3">
                    <Target size={14} /> Physicals
                  </p>
                  <div className="space-y-4 border-l-2 border-white/5 pl-4">
                    <div><span className="text-[10px] uppercase text-white/40 font-bold block mb-1">Height</span><span className="text-sm font-black">{user.height || '—'}</span></div>
                    <div><span className="text-[10px] uppercase text-white/40 font-bold block mb-1">Weight</span><span className="text-sm font-black">{user.weight || '—'}</span></div>
                  </div>
                </div>
                <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                  <p className="text-[10px] uppercase tracking-widest text-brand-teal font-black mb-6 flex items-center gap-3">
                    <Dumbbell size={14} /> Training Model
                  </p>
                  <div className="space-y-4 border-l-2 border-white/5 pl-4">
                    <div><span className="text-[10px] uppercase text-white/40 font-bold block mb-1">Level</span><span className="text-sm font-black text-brand-coral uppercase tracking-widest">{user.fitness_level || '—'}</span></div>
                    <div><span className="text-[10px] uppercase text-white/40 font-bold block mb-1">Focus</span><span className="text-sm font-black">{user.workout_style || '—'}</span></div>
                  </div>
                </div>
                <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/[0.05] md:col-span-2 lg:col-span-1">
                  <p className="text-[10px] uppercase tracking-widest text-brand-teal font-black mb-6 flex items-center gap-3">
                    <HeartPulse size={14} /> Limitations & Goals
                  </p>
                  <div className="space-y-4 border-l-2 border-white/5 pl-4">
                    <div><span className="text-[10px] uppercase text-white/40 font-bold block mb-1">Injuries / Alerts</span><span className="text-sm font-black text-red-400">{user.limitations_or_injuries || 'None Disclosed'}</span></div>
                    <div><span className="text-[10px] uppercase text-white/40 font-bold block mb-1">Core Goal</span><span className="text-sm font-black">{user.training_goals || '—'}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
        {/* Sticky Global Save Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-6 lg:p-8 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent z-50 pointer-events-none flex items-center justify-center gap-4 lg:pl-80">
          <button 
            type="button" 
            onClick={() => setIsEditing(false)}
            className="pointer-events-auto px-12 py-5 bg-white/5 border border-white/10 text-white text-xs uppercase tracking-[0.2em] font-black rounded-full hover:bg-white/10 transition-all backdrop-blur-md"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSaving}
            className="pointer-events-auto flex items-center justify-center gap-3 px-12 py-5 bg-brand-teal text-black text-xs uppercase tracking-[0.2em] font-black rounded-full shadow-[0_20px_40px_rgba(45,212,191,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? 'Synching Neural Matrix...' : <><Save size={18} /> Save Matrix Updates</>}
          </button>
        </div>
        {/* Basic Information */}
        <div className="space-y-8">
          <div className="card-gradient p-8 space-y-8 rounded-[3rem]">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <UserCircle size={20} className="text-brand-teal" />
              <h3 className="text-sm font-black uppercase tracking-widest">Identify Protocol</h3>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold border-b border-white/5 pb-2">Profile Imagery (Min 1 / Max 10)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {(formData.profile_images || []).map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/10 group shadow-lg">
                        <img src={img} alt={`Profile ${idx}`} className="w-full h-full object-cover" />
                        <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); handleRemoveImage(img); }}
                        className="absolute top-3 right-3 p-2 bg-black/80 rounded-full text-brand-coral opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                        >
                        <Trash2 size={14} />
                        </button>
                        {formData.profile_image === img ? (
                        <div className="absolute inset-x-0 bottom-0 py-2 bg-brand-teal/90 backdrop-blur-md text-black text-[9px] font-black uppercase tracking-widest text-center shadow-lg">
                            Primary Hub
                        </div>
                        ) : (
                        <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); setFormData({...formData, profile_image: img}); }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white text-black px-4 py-2 rounded-full hover:scale-105 transition-transform">Set Default</span>
                        </button>
                        )}
                    </div>
                    ))}
                    {(formData.profile_images?.length || 0) < 10 && (
                        <div className="col-span-2 md:col-span-2 xl:col-span-2 aspect-video min-h-[160px] border border-dashed border-white/20 rounded-[2rem] p-4 flex flex-col items-center justify-center hover:border-brand-teal/50 transition-colors bg-white/[0.02]">
                            <MediaCapture 
                                bucket="fmf-media"
                                folder={`avatars/profiles/${user.id}`}
                                isAvatar={false}
                                onUploadSuccess={(url) => {
                                    setFormData(prev => ({ 
                                        ...prev, 
                                        profile_images: [...(prev.profile_images || []), url],
                                        profile_image: prev.profile_image || url
                                    }));
                                    showToast('Visual credential added.', 'success');
                                }}
                                onUploadError={(err) => showToast(err.message, 'error')}
                            />
                        </div>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Full Name <span className="text-brand-coral">*</span></label>
                  <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-teal transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Email Address <span className="text-brand-coral">*</span></label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm opacity-40 cursor-not-allowed outline-none font-mono" disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Secure Phone <span className="text-brand-coral">*</span></label>
                  <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-teal transition-all outline-none font-mono tracking-widest" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-teal transition-all outline-none [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">City <span className="text-brand-coral">*</span></label>
                  <input type="text" name="city" value={formData.city || ''} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-teal transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Country</label>
                  <input type="text" name="country" value={formData.country || ''} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-teal transition-all outline-none" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Physical Address <span className="text-brand-coral">*</span></label>
                  <input type="text" name="address" value={formData.address || ''} onChange={handleChange} placeholder="Street address, apartment, suite, etc." className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-teal transition-all outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fitness Data */}
        <div className="space-y-8">
          <div className="card-gradient p-8 space-y-8 rounded-[3rem]">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Activity size={20} className="text-brand-coral" />
              <h3 className="text-sm font-black uppercase tracking-widest">Kinetic Markers</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Height <span className="text-brand-coral">*</span></label>
                  <input type="text" name="height" value={formData.height || ''} onChange={handleChange} placeholder="e.g. 5'10" className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm text-center focus:border-brand-coral focus:bg-white/5 transition-all outline-none font-mono tracking-widest" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Weight <span className="text-brand-coral">*</span></label>
                  <input type="text" name="weight" value={formData.weight || ''} onChange={handleChange} placeholder="e.g. 175 lbs" className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm text-center focus:border-brand-coral focus:bg-white/5 transition-all outline-none font-mono tracking-widest" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Fitness Level</label>
                    <div className="relative">
                        <select name="fitness_level" value={formData.fitness_level} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-coral focus:bg-white/5 transition-all outline-none appearance-none cursor-pointer">
                            <option value="Beginner" className="bg-brand-black">Beginner</option>
                            <option value="Intermediate" className="bg-brand-black">Intermediate</option>
                            <option value="Advanced" className="bg-brand-black">Advanced</option>
                        </select>
                        <ArrowRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Workout Focus</label>
                    <input type="text" name="workout_style" value={formData.workout_style} onChange={handleChange} placeholder="Strength, HIIT, etc" className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-coral focus:bg-white/5 transition-all outline-none" />
                </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Athletic Intel / Motivation <span className="text-brand-coral">*</span></label>
              <textarea name="short_bio" value={formData.short_bio || ''} onChange={handleChange} rows={2} className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-coral focus:bg-white/5 transition-all outline-none resize-none" placeholder="What is your fitness goal and motivation?..." />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-2">Primary Intent</label>
              <textarea name="training_goals" value={formData.training_goals || ''} onChange={handleChange} rows={2} className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-coral focus:bg-white/5 transition-all outline-none resize-none" placeholder="Target objectives..." />
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-[9px] uppercase tracking-widest text-brand-coral flex items-center gap-2 font-black ml-2 mb-3">
                <AlertCircle size={12} /> Limitations / Physical Restrictions
              </label>
              <textarea name="limitations_or_injuries" value={formData.limitations_or_injuries} onChange={handleChange} rows={3} className="w-full bg-brand-coral/5 border border-brand-coral/20 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-coral focus:bg-brand-coral/10 transition-all outline-none resize-none" placeholder="Describe any current injuries..." />
            </div>
          </div>
        </div>

        {/* ACCOUNT SECURITY - MOVED TO BOTTOM / SIMPLIFIED */}
        <div className="lg:col-span-2 mt-8">
            <div className="card-gradient p-8 rounded-[3rem] border border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2 md:w-1/3">
                        <div className="flex items-center gap-4 text-brand-teal">
                            <Shield size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">Security Buffer</h3>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Synchronize your authorization credentials.</p>
                    </div>

                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="newPassword"
                                value={securityData.newPassword}
                                onChange={handleSecurityChange}
                                placeholder="New Password" 
                                className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-teal focus:bg-white/5 transition-all outline-none pr-12 font-mono tracking-widest placeholder:tracking-normal" 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="confirmPassword"
                                value={securityData.confirmPassword}
                                onChange={handleSecurityChange}
                                placeholder="Confirm Update" 
                                className={`w-full bg-black/20 border rounded-[1.5rem] px-5 py-4 text-sm focus:border-brand-teal focus:bg-white/5 transition-all outline-none font-mono tracking-widest placeholder:tracking-normal ${
                                    securityData.confirmPassword && securityData.newPassword !== securityData.confirmPassword ? 'border-brand-coral bg-brand-coral/5' : 'border-white/10'
                                }`} 
                            />
                        </div>
                    </div>

                    <button 
                        type="button"
                        disabled={!securityData.newPassword || securityData.newPassword !== securityData.confirmPassword}
                        onClick={handleUpdatePassword}
                        className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-brand-teal hover:border-brand-teal hover:text-black hover:scale-105 transition-all disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:scale-100 disabled:hover:text-white disabled:hover:border-white/10"
                    >
                        Reset Password
                    </button>
                </div>
            </div>
        </div>
      </form>
      )}

      {/* 1-ON-1 TRAINING REQUEST MODAL */}
      <AnimatePresence>
        {trainingRequest.showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-gradient w-full max-w-xl p-10 space-y-8 rounded-[4rem] border border-brand-teal/20 relative shadow-[0_0_100px_rgba(45,212,191,0.1)]"
            >
                <div className="flex justify-between items-center">
                    <div className="w-16 h-16 bg-brand-teal/20 rounded-2xl flex items-center justify-center text-brand-teal">
                        <Send size={32} />
                    </div>
                    <button onClick={() => setTrainingRequest(prev => ({ ...prev, showModal: false }))} className="p-2 text-white/20 hover:text-white transition-colors">
                        <X size={32} />
                    </button>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-4xl font-black uppercase tracking-tighter">Request <span className="text-brand-teal">1-on-1 Protocol</span></h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold italic">Miami Beach HQ • Direct Elite Training Access</p>
                </div>

                <form onSubmit={handleTrainingRequest} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-4">Full Name</label>
                            <input disabled value={user.full_name} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm opacity-50 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-4">Authorized Email</label>
                            <input disabled value={user.email} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm opacity-50 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-4">Secure Phone Contact</label>
                            <input 
                                required 
                                type="tel" 
                                value={trainingRequest.phone} 
                                onChange={(e) => setTrainingRequest(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="Enter secure line..."
                                className="w-full bg-black/40 border border-brand-teal/30 focus:border-brand-teal rounded-2xl px-6 py-4 text-sm outline-none transition-all" 
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[8px] uppercase tracking-widest text-white/40 font-black ml-4">Motivation / Objective</label>
                            <textarea 
                                required 
                                value={trainingRequest.message}
                                onChange={(e) => setTrainingRequest(prev => ({ ...prev, message: e.target.value }))}
                                rows={4}
                                placeholder="Why do you require elite 1-on-1 training?"
                                className="w-full bg-black/40 border border-brand-teal/30 focus:border-brand-teal rounded-2xl px-6 py-4 text-sm outline-none transition-all resize-none" 
                            />
                        </div>
                    </div>

                    <button 
                        disabled={trainingRequest.isSubmitting}
                        className="w-full py-6 bg-brand-teal text-black text-[12px] uppercase tracking-[0.5em] font-black rounded-3xl shadow-glow-teal hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                        {trainingRequest.isSubmitting ? 'Transmitting...' : 'Dispatch Request'}
                    </button>
                    <p className="text-[8px] uppercase text-center text-white/20 tracking-widest font-bold">Admin response typically requires 24-48 hours lead time.</p>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
