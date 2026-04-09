import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, UserCircle, Activity, AlertCircle, Shield, Key, Mail, Trash2, Eye, EyeOff, X, Phone, User as UserIcon, Send, ArrowRight } from 'lucide-react';
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
      await updateProfile(formData);
      showToast('Neural matrix synchronized successfully.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error updating profile', 'error');
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
      {/* HEADER WITH SAVE BUTTON */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 relative z-10">
        <div>
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
            Profile <span className="text-brand-teal">Settings</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold max-w-md">
            Execute structural updates to your athlete profile.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <button 
                onClick={() => setTrainingRequest(prev => ({ ...prev, showModal: true }))}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 border border-brand-teal text-brand-teal text-[10px] uppercase tracking-widest font-black rounded-xl hover:bg-brand-teal hover:text-black transition-all"
            >
                <UserIcon size={14} /> Request 1-on-1
            </button>
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-xl shadow-glow-teal transition-all disabled:opacity-50"
            >
                {isSaving ? 'Synching...' : <><Save size={14} /> Save Changes</>}
            </button>
        </div>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-8">
          <div className="card-gradient p-8 space-y-8 rounded-[3rem]">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <UserCircle size={20} className="text-brand-teal" />
              <h3 className="text-sm font-black uppercase tracking-widest">Identify Protocol</h3>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Profile Imagery (Min 1 / Max 10)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {(formData.profile_images || []).map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                        <img src={img} alt={`Profile ${idx}`} className="w-full h-full object-cover" />
                        <button 
                        type="button"
                        onClick={() => handleRemoveImage(img)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-brand-coral opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                        <Trash2 size={12} />
                        </button>
                        {formData.profile_image === img && (
                        <div className="absolute inset-x-0 bottom-0 py-1 bg-brand-teal text-black text-[8px] font-black uppercase tracking-widest text-center shadow-lg">
                            Main
                        </div>
                        )}
                        {formData.profile_image !== img && (
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, profile_image: img})}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                        >
                            <span className="text-[8px] font-black uppercase tracking-widest bg-white text-black px-2 py-1 rounded">Set</span>
                        </button>
                        )}
                    </div>
                    ))}
                    {(formData.profile_images?.length || 0) < 10 && (
                        <div className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-brand-teal/50 transition-colors">
                            <MediaCapture 
                                bucket="avatars"
                                folder={`profiles/${user.id}`}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-bold ml-2">Full Name</label>
                  <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-brand-teal transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-bold ml-2">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm opacity-40 cursor-not-allowed outline-none" disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-bold ml-2">Secure Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-brand-teal transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-bold ml-2">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-brand-teal transition-all outline-none [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-bold ml-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-brand-teal transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-bold ml-2">Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-brand-teal transition-all outline-none" />
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
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-bold ml-2">Height</label>
                  <input type="text" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 5'10" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-center focus:border-brand-coral transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-bold ml-2">Weight</label>
                  <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 175 lbs" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-center focus:border-brand-coral transition-all outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/40 font-bold ml-2">Fitness Level</label>
                    <div className="relative">
                        <select name="fitness_level" value={formData.fitness_level} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-brand-coral transition-all outline-none appearance-none cursor-pointer">
                            <option value="Beginner" className="bg-brand-black">Beginner</option>
                            <option value="Intermediate" className="bg-brand-black">Intermediate</option>
                            <option value="Advanced" className="bg-brand-black">Advanced</option>
                        </select>
                        <ArrowRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/40 font-bold ml-2">Workout Focus</label>
                    <input type="text" name="workout_style" value={formData.workout_style} onChange={handleChange} placeholder="Strength, HIIT, etc" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-brand-coral transition-all outline-none" />
                </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-widest text-white/40 font-bold ml-2">Primary Intent</label>
              <textarea name="training_goals" value={formData.training_goals} onChange={handleChange} rows={1} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-brand-coral transition-all outline-none resize-none" placeholder="Target objectives..." />
            </div>

            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-widest text-brand-coral flex items-center gap-2 font-black ml-2">
                <AlertCircle size={10} /> Limitations / Physical Restrictions
              </label>
              <textarea name="limitations_or_injuries" value={formData.limitations_or_injuries} onChange={handleChange} rows={2} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-brand-coral transition-all outline-none resize-none" placeholder="Describe any current injuries..." />
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
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-brand-teal transition-all outline-none pr-12" 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
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
                                className={`w-full bg-black/40 border rounded-2xl px-6 py-5 text-sm focus:border-brand-teal transition-all outline-none ${
                                    securityData.confirmPassword && securityData.newPassword !== securityData.confirmPassword ? 'border-brand-coral' : 'border-white/10'
                                }`} 
                            />
                        </div>
                    </div>

                    <button 
                        type="button"
                        disabled={!securityData.newPassword || securityData.newPassword !== securityData.confirmPassword}
                        onClick={handleUpdatePassword}
                        className="w-full md:w-auto px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-teal hover:scale-105 transition-all disabled:opacity-30"
                    >
                        Reset Password
                    </button>
                </div>
            </div>
        </div>
      </form>

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
