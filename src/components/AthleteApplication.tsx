import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, MapPin, 
  Award, Send, Check, ArrowRight,
  Shield, Globe, MessageSquare 
} from 'lucide-react';
import { supabase } from '../supabase';

export const AthleteApplication = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    fitness_background: '',
    coaching_experience: '',
    social_links: '',
    message: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('athlete_applications').insert({
        ...formData,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      setIsSuccess(true);
      showToast('Application submitted successfully! Our team will review it shortly.', 'success');
    } catch (err: any) {
      console.error('Application error:', err);
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-40 pb-32 px-6 flex items-center justify-center min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8 card-gradient p-12"
        >
          <div className="w-20 h-20 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto text-brand-teal">
            <Check size={40} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold uppercase tracking-tighter">Application <span className="text-brand-teal">Received</span></h2>
            <p className="text-white/40 uppercase tracking-widest text-[10px] leading-relaxed">
              Thank you for your interest in joining the FMF Elite. Our administrative team will review your credentials and contact you via email for the next steps of the verification process.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '#/'}
            className="btn-primary w-full"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 space-y-6 text-center">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Join the Elite</span>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Athlete <span className="text-brand-coral">Application</span></h1>
          <p className="text-white/40 uppercase tracking-widest text-xs max-w-xl mx-auto leading-relaxed">
            Become an FMF Athlete and lead the movement. We are looking for dedicated professionals to join our inner circle and guide the collective.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Requirements Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="card-gradient p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-teal">Requirements</h3>
              <ul className="space-y-4">
                {[
                  'Proven fitness background',
                  'Coaching certification preferred',
                  'Strong community presence',
                  'Alignment with FMF values',
                  'Commitment to excellence'
                ].map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Shield size={14} className="text-brand-coral mt-0.5" />
                    <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-gradient p-8 space-y-4">
              <div className="flex items-center gap-3 text-brand-teal">
                <Globe size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Global Reach</h3>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 leading-relaxed font-bold">
                FMF Athletes represent the brand globally. Join a network of elite performers from Miami to Tokyo.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="card-gradient p-10 md:p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all"
                      placeholder="ALEX RIVERA"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      required
                      type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all"
                      placeholder="ALEX@EMAIL.COM"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      required
                      type="tel"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Current City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all"
                      placeholder="MIAMI BEACH, FL"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Fitness Background</label>
                <div className="relative">
                  <Award className="absolute left-4 top-6 text-white/20" size={16} />
                  <textarea 
                    required
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all resize-none"
                    placeholder="Describe your training history and primary disciplines..."
                    value={formData.fitness_background}
                    onChange={e => setFormData({...formData, fitness_background: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Coaching / Athlete Experience</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-6 text-white/20" size={16} />
                  <textarea 
                    required
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all resize-none"
                    placeholder="Detail any certifications or professional achievements..."
                    value={formData.coaching_experience}
                    onChange={e => setFormData({...formData, coaching_experience: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Social Media Links</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-6 text-white/20" size={16} />
                  <textarea 
                    required
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all resize-none"
                    placeholder="Instagram, LinkedIn, Personal Website..."
                    value={formData.social_links}
                    onChange={e => setFormData({...formData, social_links: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Why do you want to join FMF?</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-6 text-white/20" size={16} />
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-teal transition-all resize-none"
                    placeholder="Tell us about your motivation and vision..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-brand-teal text-black rounded-2xl text-xs uppercase tracking-[0.3em] font-bold hover:bg-white transition-all shadow-[0_20px_40px_rgba(45,212,191,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>Processing Application...</>
                ) : (
                  <>
                    Submit Application <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
