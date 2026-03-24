import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { UserProfile, CalendarSession } from '../../types';

export const Calendar = ({ user }: { user: UserProfile }) => {
  const [sessions, setSessions] = useState<CalendarSession[]>([
    { id: '1', user_id: user.id || '', title: 'Push Day Mobility', date: new Date().toISOString().split('T')[0], duration: 40, type: 'mobility', status: 'completed', created_at: new Date().toISOString() },
    { id: '2', user_id: user.id || '', title: 'Core Blast', date: new Date().toISOString().split('T')[0], duration: 15, type: 'strength', status: 'scheduled', created_at: new Date().toISOString() }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDuration, setFormDuration] = useState('30');
  const [formTitle, setFormTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    const durationNeeded = parseInt(formDuration);
    if (!durationNeeded || isNaN(durationNeeded) || durationNeeded <= 0) {
      setErrorMsg('Duration must be a positive number');
      return;
    }

    // Verify 1 hour max limit for a specific day
    const daySessions = sessions.filter(s => s.date === formDate);
    const totalScheduledDuration = daySessions.reduce((acc, curr) => acc + curr.duration, 0);

    if (totalScheduledDuration + durationNeeded > 60) {
      setErrorMsg(`Cannot add. Limit is 60 mins/day. You currently have ${totalScheduledDuration} mins scheduled for this date.`);
      return;
    }

    const newSession: CalendarSession = {
      id: `cs_${Date.now()}`,
      user_id: user.id || '',
      title: formTitle || 'Custom Workout',
      date: formDate,
      duration: durationNeeded,
      type: 'custom',
      status: 'scheduled',
      created_at: new Date().toISOString()
    };

    setSessions([...sessions, newSession]);
    setIsAdding(false);
    setFormTitle('');
  };

  const completeSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'completed' } : s));
  };

  return (
    <div className="space-y-8 fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 mb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
            Workout <span className="text-brand-teal">Calendar</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
            Schedule your training block. Maximum 60 minutes limit per day strictly enforced.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:border-brand-teal hover:text-brand-teal text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all"
        >
          {isAdding ? 'Cancel' : <><Plus size={14} /> Schedule Session</>}
        </button>
      </header>

      {isAdding && (
        <div className="card-gradient p-8 border border-brand-teal/30 mb-12">
          <div className="flex items-center gap-2 mb-6 text-brand-teal border-b border-white/5 pb-4">
            <CalendarIcon size={16} />
            <h3 className="text-sm font-bold uppercase tracking-widest">New Appointment</h3>
          </div>
          
          <form onSubmit={handleAddSession} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Date</label>
                <input 
                  type="date" 
                  value={formDate} 
                  required
                  onChange={e => setFormDate(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Workout Title</label>
                <input 
                  type="text" 
                  value={formTitle} 
                  required
                  onChange={e => setFormTitle(e.target.value)} 
                  placeholder="e.g. Upper Body Strength"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Duration (Minutes)</label>
                <select 
                  value={formDuration} 
                  onChange={e => setFormDuration(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors appearance-none"
                >
                  <option value="15">15 mins</option>
                  <option value="30">30 mins</option>
                  <option value="45">45 mins</option>
                  <option value="60">60 mins</option>
                </select>
              </div>
            </div>
            
            {errorMsg && (
              <div className="flex items-center gap-2 text-brand-coral bg-brand-coral/10 p-3 rounded border border-brand-coral/20">
                <AlertTriangle size={14} />
                <span className="text-xs uppercase font-bold tracking-widest">{errorMsg}</span>
              </div>
            )}

            <button type="submit" className="w-full md:w-auto px-8 py-3 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all">
              Save to Calendar
            </button>
          </form>
        </div>
      )}

      {/* Week Visualization (Simplified list matching specific days can be injected) */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold uppercase tracking-tight border-b border-white/10 pb-4">Upcoming Schedule</h3>
        
        {sessions.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(session => (
          <div key={session.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-brand-teal/30 transition-all">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg border border-white/10 ${
                session.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-teal/10 text-brand-teal'
              }`}>
                <span className="text-lg font-bold font-mono">{new Date(session.date).getDate()}</span>
                <span className="text-[8px] uppercase tracking-widest">{new Date(session.date).toLocaleDateString('en-US', { month: 'short'})}</span>
              </div>
              <div>
                <h4 className="font-bold text-lg uppercase tracking-tight">{session.title}</h4>
                <div className="flex items-center gap-4 text-white/40 mt-1">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                    <Clock size={12} /> {session.duration}m block
                  </div>
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                    • <span className={session.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}>{session.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {session.status === 'scheduled' ? (
              <button 
                onClick={() => completeSession(session.id)}
                className="flex items-center gap-2 px-6 py-3 border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 transition-colors text-[10px] uppercase tracking-widest font-bold rounded-xl whitespace-nowrap"
              >
                <CheckCircle size={14} /> Mark Completed
              </button>
            ) : (
              <span className="px-6 py-3 flex items-center gap-2 text-emerald-400 bg-emerald-400/5 text-[10px] uppercase tracking-widest font-bold rounded-xl whitespace-nowrap border border-emerald-400/10">
                <CheckCircle size={14} /> Session Done
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
