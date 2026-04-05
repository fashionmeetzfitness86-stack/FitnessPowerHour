import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Activity, Flame, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../App';
import { supabase } from '../../supabase';

interface OnboardingFlowProps {
  onComplete: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, showToast }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goals = [
    { id: 'hypertrophy', label: 'Build Muscle', icon: Flame, desc: 'Focus on mass & strength' },
    { id: 'endurance', label: 'Endurance', icon: Activity, desc: 'Metabolic conditioning' },
    { id: 'mobility', label: 'Mobility & Recovery', icon: Target, desc: 'Flexibility & longevity' }
  ];

  const levels = [
    { id: 'beginner', label: 'Beginner', desc: '0-1 years' },
    { id: 'intermediate', label: 'Intermediate', desc: '1-3 years' },
    { id: 'advanced', label: 'Advanced', desc: '3+ years' }
  ];

  const handleComplete = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('profiles').update({
        training_goals: goal,
        workout_style: experience,
        onboarding_completed: true
      }).eq('id', user.id);

      if (error) throw error;
      
      // Dispatch Onboarding Complete Notification
      await supabase.from('notifications').insert({
         user_id: user.id,
         type: 'system',
         title: 'Protocol Initialized',
         message: 'Your kinetic target has been set. Welcome to the FMF Legion.',
         status: 'sent',
         send_at: new Date().toISOString()
      });

      showToast('Profile configured successfully! Welcome to FMF.');
      onComplete(); // Closes the onboarding view
    } catch (error: any) {
      showToast(error.message || 'Failed to save profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-brand-black flex items-center justify-center p-6">
      {/* Background aesthetics */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-teal/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-coral/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
      </div>

      <motion.div 
        key="onboarding"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative w-full max-w-2xl bg-white/5 border border-white/10 rounded-[2rem] p-12 backdrop-blur-xl"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em] font-bold">Step 1 of 2</span>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Define Your <span className="text-brand-teal">Target</span></h2>
                <p className="text-white/40 text-sm max-w-md mx-auto uppercase tracking-widest leading-relaxed">
                  Establish your primary kinetic objective. We'll tailor the protocol to your exact specifications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {goals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`p-6 text-left border rounded-2xl transition-all ${
                      goal === g.id 
                        ? 'border-brand-teal bg-brand-teal/10 shadow-[0_0_30px_rgba(45,212,191,0.2)]' 
                        : 'border-white/10 hover:border-white/30 bg-black/20'
                    }`}
                  >
                    <g.icon size={24} className={`mb-6 ${goal === g.id ? 'text-brand-teal' : 'text-white/40'}`} />
                    <h4 className="font-bold uppercase tracking-widest text-sm mb-2">{g.label}</h4>
                    <p className={`text-[10px] uppercase tracking-widest ${goal === g.id ? 'text-white/80' : 'text-white/40'}`}>
                      {g.desc}
                    </p>
                  </button>
                ))}
              </div>

              <button 
                disabled={!goal}
                onClick={() => setStep(2)}
                className="btn-primary w-full py-6 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Baseline <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em] font-bold">Step 2 of 2</span>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Establish <span className="text-brand-coral">Baseline</span></h2>
                <p className="text-white/40 text-sm max-w-md mx-auto uppercase tracking-widest leading-relaxed">
                  Select your current training foundation.
                </p>
              </div>

              <div className="space-y-4">
                {levels.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setExperience(l.id)}
                    className={`w-full p-6 text-left border flex items-center justify-between rounded-2xl transition-all ${
                      experience === l.id 
                        ? 'border-brand-coral bg-brand-coral/10 shadow-[0_0_30px_rgba(242,107,110,0.2)] text-brand-coral' 
                        : 'border-white/10 hover:border-white/30 bg-black/20 text-white'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold uppercase tracking-widest text-sm">{l.label}</h4>
                      <p className={`text-[10px] uppercase tracking-widest mt-1 ${experience === l.id ? 'text-brand-coral/70' : 'text-white/40'}`}>
                        {l.desc}
                      </p>
                    </div>
                    {experience === l.id && <Check size={20} className="text-brand-coral" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-8 py-6 rounded-2xl border border-white/10 hover:bg-white/5 uppercase tracking-widest text-[10px] font-bold transition-all text-white/60 hover:text-white"
                >
                  Back
                </button>
                <button 
                  disabled={!experience || isSubmitting}
                  onClick={handleComplete}
                  className="flex-1 btn-primary bg-brand-coral py-6 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isSubmitting ? 'Syncing...' : 'Initialize Protocol'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
