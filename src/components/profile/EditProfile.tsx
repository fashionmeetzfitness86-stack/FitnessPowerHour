import { useState } from 'react';
import { Save, UserCircle, Camera, Activity, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types';

export const EditProfile = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: user.full_name || '',
    email: user.email || '',
    phone: user.phone || '',
    profile_image: user.profile_image || '',
    city: user.city || '',
    country: user.country || '',
    age: user.age || undefined,
    height: user.height || '',
    weight: user.weight || '',
    workout_style: user.workout_style || '',
    training_goals: user.training_goals || '',
    fitness_level: user.fitness_level || 'Intermediate',
    limitations_or_injuries: user.limitations_or_injuries || '',
    short_bio: user.short_bio || '',
    motivation: user.motivation || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    showToast('Profile updated successfully!', 'success');
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
          className="flex items-center gap-2 px-8 py-4 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all"
        >
          <Save size={14} /> Save Changes
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
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <div className="space-y-2 flex-grow">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Profile Image URL</label>
                <input 
                  type="text" 
                  name="profile_image"
                  value={formData.profile_image}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                />
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
        </div>
      </form>
    </div>
  );
};
