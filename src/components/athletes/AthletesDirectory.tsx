import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../App';
import { Play, ArrowLeft, Send } from 'lucide-react';
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

        {athletes.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-white/40 uppercase tracking-widest">No athletes are currently accepting clients.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {athletes.map((athlete) => (
              <div key={athlete.id} className="card-gradient rounded-3xl overflow-hidden border border-white/5 hover:border-brand-teal/30 transition-all group flex flex-col">
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={athlete.user?.profile_image || 'https://picsum.photos/400'} 
                    alt={athlete.user?.full_name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-6">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">{athlete.user?.full_name}</h3>
                    <p className="text-[10px] font-bold tracking-widest text-brand-teal uppercase">{athlete.specialty}</p>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <p className="text-sm text-white/50 line-clamp-2">{athlete.short_description}</p>
                  <button 
                    onClick={() => setSelectedAthlete(athlete)}
                    className="w-full py-4 text-[10px] uppercase tracking-widest font-bold border border-white/10 rounded-xl hover:bg-brand-teal hover:text-black hover:border-brand-teal transition-all"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
