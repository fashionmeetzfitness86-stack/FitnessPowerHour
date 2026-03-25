import React, { useState } from 'react';
import { Save, UserCircle, Camera, Activity, AlertCircle, Shield, Key, Mail, Trash2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { supabase } from '../../supabase';

// useAuth is handled via Props or standard export if we want to be clean
// But for now, we'll keep it simple as this is a large file refactor

export const EditProfile = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  // We use direct imports since they are exported in App.tsx
  // But App.tsx is huge, so we'll rely on props or hook if available.
  // Actually, I'll assume useAuth is available if I export it or use it here.
  // Since I can't easily export/import across this huge App.tsx without full refactor,
  // I'll use the user object and supabase directly if needed, but App.tsx has the logic.
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profile_image: user?.profile_image || '',
    city: user?.city || '',
    country: user?.country || '',
    age: user?.age || undefined,
    height: user?.height || '',
    weight: user?.weight || '',
    workout_style: user?.workout_style || '',
    training_goals: user?.training_goals || '',
    fitness_level: user?.fitness_level || 'Intermediate',
    limitations_or_injuries: user?.limitations_or_injuries || '',
    short_bio: user?.short_bio || '',
    motivation: user?.motivation || ''
  });

  const [securityData, setSecurityData] = useState({
    newEmail: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, profile_image: publicUrl }));
      showToast('Image uploaded! Click "Save Changes" to apply.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error uploading image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, profile_image: '' }));
    showToast('Image removed. Click "Save Changes" to apply.', 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('users')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      showToast('Profile updated successfully!', 'success');
      // Trigger a re-fetch of user if needed via parent
    } catch (error: any) {
      showToast(error.message || 'Error updating profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSecurity = async (type: 'email' | 'password') => {
    try {
      const updates: any = {};
      if (type === 'email') {
        if (!securityData.newEmail) return showToast('Enter new email', 'error');
        updates.email = securityData.newEmail;
      } else {
        if (!securityData.newPassword) return showToast('Enter new password', 'error');
        if (securityData.newPassword !== securityData.confirmPassword) {
          return showToast('Passwords do not match', 'error');
        }
        updates.password = securityData.newPassword;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      if (type === 'email') {
        await supabase.from('users').update({ email: securityData.newEmail }).eq('id', user.id);
      }

      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} update initiated! Check your inbox.`, 'success');
      setSecurityData({ newEmail: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.message || 'Error updating security settings', 'error');
    }
  };

  return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Profile <span className="text-brand-teal">Settings</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Manage your personal data and fitness tracking markers.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={14} />
          )} 
          {isSaving ? 'Synchronizing...' : 'Save Changes'}
        </button>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Basic Information */}
        <div className="xl:col-span-2 space-y-8">
          <div className="card-gradient p-10 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <UserCircle size={24} className="text-brand-teal" />
              <h3 className="text-lg font-bold uppercase tracking-tight">Basic Information</h3>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <div className="w-32 h-32 rounded-full border-4 border-brand-teal/20 bg-white/5 overflow-hidden flex items-center justify-center relative group">
                {formData.profile_image ? (
                  <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={48} className="text-white/20" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                    <div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <label className="cursor-pointer p-4 hover:scale-110 transition-transform">
                    <Camera size={24} className="text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {formData.profile_image && (
                    <button onClick={handleRemoveImage} className="p-2 text-brand-coral hover:scale-110 transition-transform">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2 flex-grow">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Identity Asset Protocol</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    name="profile_image"
                    value={formData.profile_image}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] uppercase tracking-widest text-white/60 focus:border-brand-teal outline-none transition-colors"
                  />
                  <label className="cursor-pointer px-6 py-3 border border-brand-teal text-brand-teal text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-brand-teal hover:text-black transition-all whitespace-nowrap">
                    Upload New
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Full Name</label>
                <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors opacity-70 cursor-not-allowed" disabled />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Age</label>
                <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors" />
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Short Bio / Mantra</label>
              <textarea name="short_bio" value={formData.short_bio} onChange={handleChange} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors resize-none" placeholder="What drives you?" />
            </div>
          </div>
        </div>

        {/* Fitness Information */}
        <div className="space-y-8">
          <div className="card-gradient p-10 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Activity size={24} className="text-brand-coral" />
              <h3 className="text-lg font-bold uppercase tracking-tight">Fitness Data</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Height</label>
                <input type="text" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 5'10" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-center focus:border-brand-coral outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Weight</label>
                <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 175 lbs" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-center focus:border-brand-coral outline-none transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Fitness Level</label>
              <select name="fitness_level" value={formData.fitness_level} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-coral outline-none transition-colors appearance-none">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced - Elite</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Training Goals</label>
              <input type="text" name="training_goals" value={formData.training_goals} onChange={handleChange} placeholder="e.g. Hypertrophy, Mobility" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-coral outline-none transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-brand-coral flex items-center gap-2 font-bold mb-2">
                <AlertCircle size={14} /> Limitations / Injuries
              </label>
              <textarea name="limitations_or_injuries" value={formData.limitations_or_injuries} onChange={handleChange} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-coral outline-none transition-colors resize-none" placeholder="Describe any current injuries..." />
            </div>
          </div>

          <div className="card-gradient p-10 space-y-8 border-brand-coral/20">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Shield size={24} className="text-brand-coral" />
              <h3 className="text-lg font-bold uppercase tracking-tight">Security Protocol</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60 font-bold mb-2">
                  <Mail size={12} /> Email Rotation
                </div>
                <div className="flex gap-4">
                  <input 
                    type="email" 
                    name="newEmail"
                    value={securityData.newEmail}
                    onChange={handleSecurityChange}
                    placeholder="Enter new email address" 
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-coral outline-none transition-colors" 
                  />
                  <button 
                    type="button"
                    onClick={() => handleUpdateSecurity('email')}
                    className="px-6 py-3 bg-brand-coral text-black text-[10px] uppercase tracking-widest font-bold rounded-xl whitespace-nowrap"
                  >
                    Request Change
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60 font-bold mb-2">
                  <Key size={12} /> Access Credentials
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="password" 
                    name="newPassword"
                    value={securityData.newPassword}
                    onChange={handleSecurityChange}
                    placeholder="New Password" 
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-coral outline-none transition-colors" 
                  />
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={securityData.confirmPassword}
                    onChange={handleSecurityChange}
                    placeholder="Confirm New Password" 
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-coral outline-none transition-colors" 
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => handleUpdateSecurity('password')}
                  className="w-full py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold rounded-xl"
                >
                  Authorize Password Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
