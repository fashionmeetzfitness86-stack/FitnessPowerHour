import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../App';
import { Play, ArrowLeft, Send, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AthleteProfile {
  id: string;
  workout_style: string;
  eating_schedule: string;
  preferred_body_type: string;
  fitness_philosophy: string;
  specialty: string;
  short_description: string;
  user: {
    full_name: string;
    profile_image: string;
  };
}

export const AthletesDirectory = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteProfile | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAthletes = async () => {
      const { data, error } = await supabase
        .from('athlete_profiles')
        .select(`
          *,
          user:users ( full_name, profile_image )
        `);
      if (error) {
        console.error('Error fetching athletes:', error);
      } else {
        setAthletes(data as AthleteProfile[]);
      }
    };
    fetchAthletes();
  }, []);

  const handleRequestTrainer = async () => {
    if (!user) {
      showToast('You must be logged in to request a trainer.', 'error');
      return;
    }
    if (!selectedAthlete) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from('trainer_requests')
      .insert({
        user_id: user.id,
        athlete_id: selectedAthlete.id,
        message: requestMessage
      });

    if (error) {
      console.error(error);
      showToast('Failed to send request. Please try again.', 'error');
    } else {
      showToast('Trainer request sent successfully!', 'success');
      setRequestMessage('');
      setSelectedAthlete(null);
    }
    setIsSubmitting(false);
  };

  if (selectedAthlete) {
    return (
      <div className="pt-40 pb-32 px-6 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-12">
          <button 
            onClick={() => setSelectedAthlete(null)} 
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold"
          >
            <ArrowLeft size={16} /> Back to Directory
          </button>

          <header className="flex flex-col md:flex-row gap-8 items-start md:items-center bg-white/5 p-8 rounded-3xl border border-white/10">
            <img 
              src={selectedAthlete.user?.profile_image || 'https://picsum.photos/400'} 
              alt={selectedAthlete.user?.full_name} 
              className="w-32 h-32 rounded-full object-cover border-2 border-brand-teal shadow-[0_0_20px_rgba(45,212,191,0.2)]"
            />
            <div className="space-y-2">
              <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">FMF Athlete</span>
              <h1 className="text-4xl font-bold uppercase tracking-tighter">{selectedAthlete.user?.full_name}</h1>
              <p className="text-white/60 font-light max-w-lg">{selectedAthlete.short_description}</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="card-gradient p-8 space-y-4 rounded-3xl">
                <h3 className="text-xl font-black uppercase tracking-widest text-brand-teal">Basic Info & Style</h3>
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-widest block">Workout Style</label>
                    <p className="text-sm">{selectedAthlete.workout_style || 'Functional Hypertrophy & Kinetic Mastery'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-widest block">Preferred Body Type / Goal</label>
                    <p className="text-sm">{selectedAthlete.preferred_body_type || 'Lean, Athletic, Durable'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-widest block">Specialty</label>
                    <p className="text-sm">{selectedAthlete.specialty || 'High-Intensity Output'}</p>
                  </div>
                </div>
              </div>

              <div className="card-gradient p-8 space-y-4 rounded-3xl">
                <h3 className="text-xl font-black uppercase tracking-widest text-brand-coral">Philosophy & Fuel</h3>
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-widest block">Eating Schedule</label>
                    <p className="text-sm whitespace-pre-wrap">{selectedAthlete.eating_schedule || 'Intermittent Fasting & Whole Foods'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-widest block">Mindset / Philosophy</label>
                    <p className="text-sm text-white/70 italic">"{selectedAthlete.fitness_philosophy || 'Discipline over motivation. Every single day.'}"</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-brand-teal/10 border border-brand-teal/20 p-8 rounded-3xl">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Request <span className="text-brand-teal">Trainer</span></h2>
                <p className="text-white/60 text-sm mb-6">Send a direct request to coordinate a training cycle.</p>
                <textarea 
                  className="w-full bg-black/50 border border-brand-teal/30 rounded-xl p-4 text-sm text-white min-h-[120px] focus:outline-none focus:border-brand-teal placeholder:text-white/20"
                  placeholder="Optional: Introduce yourself and mention any specific goals..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                ></textarea>
                <button 
                  onClick={handleRequestTrainer}
                  disabled={isSubmitting}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                >
                  <Send size={16} /> {isSubmitting ? 'Sending Request...' : 'Send Request'}
                </button>
              </div>

              {/* Optional Content Area */}
              <div className="card-gradient p-8 space-y-4 rounded-3xl">
                 <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/40">Featured Workout</h3>
                 <div className="aspect-video bg-white/5 rounded-xl overflow-hidden relative group/video cursor-pointer">
                    <img src={`https://picsum.photos/seed/${selectedAthlete.id}-w1/600/400`} className="w-full h-full object-cover opacity-50 group-hover/video:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                    <Play size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-black/50 p-4 rounded-full" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-6">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Global Roster</span>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">FMF <span className="text-brand-teal">Athletes</span></h1>
          <p className="text-white/40 uppercase tracking-widest text-xs max-w-xl leading-relaxed">
            Browse our global network of elite trainers. Review their philosophies, capabilities, and request direct mentorship.
          </p>
        </header>

        <div className="text-center py-32 bg-white/5 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-teal/5 opacity-20 blur-3xl"></div>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-brand-teal/10 rounded-full flex items-center justify-center border border-brand-teal/20 mb-4 animate-pulse">
              <Users size={32} className="text-brand-teal" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Coming <span className="text-brand-teal">Soon</span></h2>
            <p className="text-white/40 uppercase tracking-widest text-xs max-w-md mx-auto leading-relaxed">
              We are finalizing our initial roster of elite FMF Athletes. The global directory will open shortly.
            </p>
            <Link to="/" className="mt-8 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
