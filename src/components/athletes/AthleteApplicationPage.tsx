import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import {
  User, Mail, Phone, Instagram, Youtube, Globe,
  Dumbbell, Heart, Zap, CheckCircle, ArrowRight,
  ArrowLeft, Camera, Send
} from 'lucide-react';

interface ApplicationForm {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  specialty: string;
  years_experience: string;
  certifications: string;
  short_bio: string;
  training_philosophy: string;
  workout_style: string;
  why_fmf: string;
  instagram: string;
  youtube: string;
  website: string;
  profile_photo_url: string;
}

const INITIAL_FORM: ApplicationForm = {
  full_name: '', email: '', phone: '', city: '', country: '',
  specialty: '', years_experience: '', certifications: '',
  short_bio: '', training_philosophy: '', workout_style: '',
  why_fmf: '', instagram: '', youtube: '', website: '',
  profile_photo_url: ''
};

interface Props {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AthleteApplicationPage = ({ showToast }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ApplicationForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 3;

  const update = (field: keyof ApplicationForm, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const canProceedStep1 = form.full_name.trim() && form.email.trim() && form.specialty && form.years_experience;
  const canProceedStep2 = form.short_bio.trim() && form.why_fmf.trim();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('athlete_applications').insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        city: form.city || null,
        country: form.country || null,
        specialty: form.specialty,
        years_experience: parseInt(form.years_experience) || 0,
        certifications: form.certifications || null,
        short_bio: form.short_bio,
        training_philosophy: form.training_philosophy || null,
        workout_style: form.workout_style || null,
        why_fmf: form.why_fmf,
        instagram: form.instagram || null,
        youtube: form.youtube || null,
        website: form.website || null,
        profile_photo_url: form.profile_photo_url || null,
        status: 'pending',
      });

      if (error) throw error;

      // Send confirmation email via Netlify function
      try {
        await fetch('/.netlify/functions/athlete-application-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.full_name, email: form.email }),
        });
      } catch (emailErr) {
        // Email is best-effort; don't block the UX
        console.warn('Email send failed:', emailErr);
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to submit application. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── SUCCESS SCREEN ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-lg w-full text-center space-y-8"
        >
          <div className="w-24 h-24 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto border border-brand-teal/30">
            <CheckCircle size={40} className="text-brand-teal" />
          </div>
          <div className="space-y-3">
            <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em] font-bold">Application Received</span>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              Welcome to the <span className="text-brand-teal">Roster</span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
              Your application has been submitted to the FMF team. A confirmation has been sent to{' '}
              <span className="text-white font-bold">{form.email}</span>.  We'll review your profile and be in touch within 3–5 business days.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Return Home
            </button>
            <button
              onClick={() => navigate('/membership')}
              className="px-8 py-4 bg-brand-teal text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-teal/20"
            >
              Join as Member
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── FORM ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white text-xs uppercase tracking-widest font-bold mb-12 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header */}
        <div className="mb-12 space-y-3">
          <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em] font-bold">Elite Affiliation</span>
          <h1 className="text-5xl font-black uppercase tracking-tighter">
            FMF Athlete <span className="text-brand-teal">Application</span>
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest leading-relaxed">
            Join our global network of elite coaches and high-performance individuals.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${i + 1 <= step ? 'bg-brand-teal' : 'bg-white/10'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Identity ─────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Step 1 of 3 — Personal Info</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name *" icon={<User size={14} />}>
                  <input value={form.full_name} onChange={e => update('full_name', e.target.value)}
                    placeholder="e.g. Jordan Blake" className={inputCls} />
                </Field>
                <Field label="Email Address *" icon={<Mail size={14} />}>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="you@example.com" className={inputCls} />
                </Field>
                <Field label="Phone" icon={<Phone size={14} />}>
                  <input value={form.phone} onChange={e => update('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000" className={inputCls} />
                </Field>
                <Field label="City" icon={<Globe size={14} />}>
                  <input value={form.city} onChange={e => update('city', e.target.value)}
                    placeholder="New York" className={inputCls} />
                </Field>
                <Field label="Country" icon={<Globe size={14} />}>
                  <input value={form.country} onChange={e => update('country', e.target.value)}
                    placeholder="United States" className={inputCls} />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Primary Specialty *" icon={<Dumbbell size={14} />}>
                  <select value={form.specialty} onChange={e => update('specialty', e.target.value)} className={selectCls}>
                    <option value="">Select Specialty</option>
                    <option value="Strength">Strength</option>
                    <option value="Conditioning">Conditioning</option>
                    <option value="Mobility">Mobility</option>
                    <option value="Recovery">Recovery</option>
                    <option value="Calisthenics">Calisthenics</option>
                    <option value="Hybrid">Hybrid Athlete</option>
                    <option value="Nutrition">Nutrition Coach</option>
                    <option value="Mindset">Mindset & Performance</option>
                  </select>
                </Field>
                <Field label="Years of Experience *" icon={<Zap size={14} />}>
                  <select value={form.years_experience} onChange={e => update('years_experience', e.target.value)} className={selectCls}>
                    <option value="">Select</option>
                    <option value="1">1 year</option>
                    <option value="2">2 years</option>
                    <option value="3">3 years</option>
                    <option value="5">5 years</option>
                    <option value="7">7 years</option>
                    <option value="10">10+ years</option>
                  </select>
                </Field>
              </div>

              <Field label="Certifications & Credentials" icon={<CheckCircle size={14} />}>
                <input value={form.certifications} onChange={e => update('certifications', e.target.value)}
                  placeholder="e.g. NASM-CPT, CSCS, Precision Nutrition Level 2" className={inputCls} />
              </Field>
            </motion.div>
          )}

          {/* ── STEP 2: Philosophy ────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Step 2 of 3 — Your Philosophy</p>

              <Field label="Short Bio *" icon={<User size={14} />}>
                <textarea rows={4} value={form.short_bio} onChange={e => update('short_bio', e.target.value)}
                  placeholder="Briefly describe who you are as an athlete and coach..."
                  className={textareaCls} />
              </Field>
              <Field label="Training Philosophy *" icon={<Heart size={14} />}>
                <textarea rows={4} value={form.training_philosophy} onChange={e => update('training_philosophy', e.target.value)}
                  placeholder="What principles guide your approach to fitness?"
                  className={textareaCls} />
              </Field>
              <Field label="Workout Style" icon={<Dumbbell size={14} />}>
                <input value={form.workout_style} onChange={e => update('workout_style', e.target.value)}
                  placeholder="e.g. Functional Hypertrophy, HIIT, Calisthenics + Weights" className={inputCls} />
              </Field>
              <Field label="Why FMF? *" icon={<Zap size={14} />}>
                <textarea rows={4} value={form.why_fmf} onChange={e => update('why_fmf', e.target.value)}
                  placeholder="Why do you want to represent Fashion Meetz Fitness?"
                  className={textareaCls} />
              </Field>
            </motion.div>
          )}

          {/* ── STEP 3: Socials ───────────────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Step 3 of 3 — Online Presence</p>

              <Field label="Instagram Handle" icon={<Instagram size={14} />}>
                <input value={form.instagram} onChange={e => update('instagram', e.target.value)}
                  placeholder="@yourhandle" className={inputCls} />
              </Field>
              <Field label="YouTube Channel" icon={<Youtube size={14} />}>
                <input value={form.youtube} onChange={e => update('youtube', e.target.value)}
                  placeholder="https://youtube.com/@yourchannel" className={inputCls} />
              </Field>
              <Field label="Website / Portfolio" icon={<Globe size={14} />}>
                <input value={form.website} onChange={e => update('website', e.target.value)}
                  placeholder="https://yoursite.com" className={inputCls} />
              </Field>
              <Field label="Profile Photo URL" icon={<Camera size={14} />}>
                <input value={form.profile_photo_url} onChange={e => update('profile_photo_url', e.target.value)}
                  placeholder="https://link-to-your-photo.jpg" className={inputCls} />
              </Field>

              {/* Review summary */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 mt-4">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">Review Your Application</p>
                <Row label="Name" value={form.full_name} />
                <Row label="Email" value={form.email} />
                <Row label="Specialty" value={form.specialty} />
                <Row label="Experience" value={`${form.years_experience} year(s)`} />
                {form.instagram && <Row label="Instagram" value={form.instagram} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-4 mt-10">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
          {step < totalSteps ? (
            <button
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              onClick={() => setStep(s => s + 1)}
              className="flex-1 py-4 bg-brand-teal text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-brand-teal/20"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-4 bg-brand-coral text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-brand-coral/20"
            >
              {submitting ? 'Submitting...' : <><Send size={14} /> Submit Application</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-brand-teal transition-colors";
const selectCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-teal appearance-none transition-colors";
const textareaCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-brand-teal resize-none transition-colors";

const Field = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-white/50">
      {icon} {label}
    </label>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
    <span className="text-[10px] uppercase tracking-widest text-white/30">{label}</span>
    <span className="text-xs font-bold text-white">{value}</span>
  </div>
);
