import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, AlertCircle, HeartPulse, Activity, FileWarning, ShieldAlert, Dumbbell, Map, Shield, Scale, Mail, MapPin } from 'lucide-react';

export const LiabilityWaiver = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 selection:bg-brand-coral/30">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
              <AlertTriangle size={28} />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4"
          >
            Liability <span className="text-red-500">Waiver</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm uppercase tracking-widest font-bold"
          >
            Last Updated: April 2026
          </motion.p>
        </div>

        {/* Introduction */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10 space-y-12"
        >
          <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
            <p className="text-white/80 text-sm leading-relaxed mb-3">
              This Liability Waiver applies to all users of Fashion Meetz Fitness (FMF), operated by TheMainKeys Group.
            </p>
            <p className="text-red-400 text-xs font-black uppercase tracking-widest italic">
              By using this platform, participating in workouts, or engaging in any training services, you agree to the following:
            </p>
          </div>

          <PolicySection title="1. Acknowledgment of Risk" icon={<AlertCircle size={20} />} color="text-red-500">
            <p className="text-white/70 text-sm leading-relaxed mb-4">You understand that:</p>
            <div className="space-y-4 mb-4">
               <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                 <AlertTriangle size={18} className="text-brand-coral mt-0.5 shrink-0" />
                 <p className="text-white/70 text-sm">Fitness training, workouts, and physical activity involve inherent risks.</p>
               </div>
            </div>
            
            <p className="text-white/70 text-sm leading-relaxed mb-3 mt-6">These risks include, but are not limited to:</p>
            <BulletList items={[
              "muscle injuries",
              "joint injuries",
              "cardiovascular events",
              "falls or accidents",
              "other physical harm"
            ]} color="text-white/60" iconColor="bg-red-500" />
            
            <p className="text-white/50 text-[10px] uppercase font-black tracking-widest mt-6 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
               By participating, you voluntarily assume all risks associated with these activities.
            </p>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="2. Health & Medical Responsibility" icon={<HeartPulse size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">You confirm that:</p>
            <BulletList items={[
              "You are in sufficient physical condition to participate in fitness activities",
              "You have consulted (or will consult) a medical professional if needed",
              "You will stop immediately if you experience pain, discomfort, or health issues"
            ]} />
            <p className="text-brand-coral/80 text-xs italic font-bold tracking-widest mt-6 pl-4 border-l-2 border-brand-coral">
              FMF does not provide medical advice.
            </p>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="3. No Medical or Professional Advice" icon={<Activity size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">All content provided by FMF:</p>
            <BulletList items={[
              "is for informational and general fitness purposes only",
              "does not replace professional medical guidance"
            ]} />
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl max-w-lg">
               <p className="text-brand-teal text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                  You agree not to rely solely on the platform for medical or health decisions.
               </p>
            </div>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="4. Release of Liability" icon={<FileWarning size={20} />} color="text-red-500">
            <p className="text-white/70 text-sm leading-relaxed mb-4 italic">
              To the maximum extent permitted by law, you agree to:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {['Release', 'Waive', 'Discharge'].map((item) => (
                <div key={item} className="bg-red-500/5 border border-red-500/20 p-4 text-center rounded-xl">
                   <h3 className="text-red-500 text-[10px] uppercase font-black tracking-widest">{item}</h3>
                </div>
              ))}
            </div>

            <p className="text-white text-sm font-black uppercase tracking-widest mb-6">
              Fashion Meetz Fitness, TheMainKeys Group, its owners, trainers, affiliates, and partners
            </p>

            <p className="text-white/70 text-sm leading-relaxed mb-4 italic">
              from any and all liability related to:
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-6">
               {['injuries', 'health complications', 'damages', 'losses'].map((txt, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 px-3 bg-white/5 rounded-lg text-white/60 text-xs font-bold uppercase tracking-widest">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                     {txt}
                  </div>
               ))}
            </div>

            <p className="text-white/70 text-sm leading-relaxed mb-4 italic">
              resulting from:
            </p>
            <BulletList items={[
              "workouts",
              "training sessions",
              "use of the platform",
              "participation in services"
            ]} />
          </PolicySection>

          <PolicyLine />

          <PolicySection title="5. Personal Responsibility" icon={<ShieldAlert size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">You accept full responsibility for:</p>
            <BulletList items={[
              "your actions",
              "your physical activity",
              "your participation decisions"
            ]} />
            <div className="mt-6">
               <p className="text-white/80 text-sm italic border-l-4 border-brand-teal pl-4 py-1">
                 You agree that you are solely responsible for your safety.
               </p>
            </div>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="6. Training Services & Sessions" icon={<Dumbbell size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">For any 1-on-1 or group training:</p>
            <BulletList items={[
              "Participation is voluntary",
              "Results are not guaranteed",
              "You assume all risks during sessions"
            ]} />
            <div className="mt-6 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
               <p className="text-red-400 text-xs font-black uppercase tracking-widest leading-relaxed">
                  Missed instructions, improper execution, or overexertion are your responsibility.
               </p>
            </div>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="7. Equipment & Environment" icon={<Map size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">You acknowledge that:</p>
            <BulletList items={[
              "You may use your own equipment or train in various environments"
            ]} />
            <p className="text-white/70 text-sm leading-relaxed mt-6 mb-3">FMF is not responsible for:</p>
            <BulletList items={[
              "unsafe environments",
              "defective equipment",
              "third-party locations"
            ]} color="text-red-400/80" iconColor="bg-red-500/50" />
          </PolicySection>

          <PolicyLine />

          <div className="grid md:grid-cols-2 gap-12 border-b border-white/5 pb-12 pt-4">
             <PolicySection title="8. Content & Community" icon={<Shield size={20} />}>
               <p className="text-white/70 text-sm leading-relaxed mb-4">If you upload content (photos, videos, comments):</p>
               <BulletList items={[
                 "You do so voluntarily",
                 "You accept any risks related to sharing or participation"
               ]} />
             </PolicySection>

             <PolicySection title="9. Indemnification" icon={<AlertTriangle size={20} />}>
               <p className="text-white/70 text-sm leading-relaxed mb-4">You agree to indemnify and hold harmless:</p>
               <p className="text-brand-coral font-black uppercase tracking-widest text-xs mb-4 p-3 bg-brand-coral/5 border border-brand-coral/20 rounded-xl">
                  Fashion Meetz Fitness and TheMainKeys Group
               </p>
               <p className="text-white/50 text-xs leading-relaxed italic">
                  from any claims, damages, or legal actions arising from your use of the platform or participation in activities.
               </p>
             </PolicySection>
          </div>

          <div className="pt-8">
             <PolicySection title="10. Agreement & Acceptance">
               <p className="text-white/70 text-sm leading-relaxed mb-4">By using the platform, you confirm that:</p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {[
                   "You have read this waiver",
                   "You understand the risks",
                   "You accept full responsibility",
                   "You agree to all terms stated above"
                 ].map((t, i) => (
                    <div key={i} className="py-3 px-4 border border-brand-teal/20 bg-brand-teal/5 text-brand-teal/80 text-[10px] font-black uppercase tracking-widest rounded-xl text-center">
                       {t}
                    </div>
                 ))}
               </div>
             </PolicySection>
          </div>

          <PolicyLine />

          <div className="grid md:grid-cols-2 gap-12 border-b border-white/5 pb-12">
            <PolicySection title="11. Governing Law" icon={<Scale size={20} />}>
              <p className="text-white/70 text-sm leading-relaxed mb-2">This waiver is governed by the laws of:</p>
              <div className="inline-block p-4 bg-brand-teal/5 border border-brand-teal/20 rounded-xl">
                <span className="text-brand-teal font-black uppercase tracking-widest text-[11px]">👉 Florida, United States</span>
              </div>
            </PolicySection>

            <PolicySection title="12. Contact" icon={<Mail size={20} />}>
              <p className="text-white/70 text-sm leading-relaxed mb-4">For questions regarding this waiver:</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex-1">
                  <div className="w-10 h-10 rounded-full bg-brand-coral/10 flex items-center justify-center text-brand-coral shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Email</p>
                    <a href="mailto:fitnesspowerhour@gmail.com" className="text-sm font-black hover:text-brand-coral transition-colors">fitnesspowerhour@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex-1">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Location</p>
                    <p className="text-sm font-black uppercase tracking-widest text-white">Miami Beach, Florida</p>
                  </div>
                </div>
              </div>
            </PolicySection>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

const PolicyLine = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
)

const PolicySection = ({ title, children, icon, color = "text-brand-teal" }: { title: string, children: React.ReactNode, icon?: React.ReactNode, color?: string }) => (
  <div>
    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-6 flex items-center gap-3">
      {icon && <span className={color}>{icon}</span>}
      {title}
    </h2>
    <div className="pl-0 md:pl-8">
      {children}
    </div>
  </div>
);

const PolicySubSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div>
    <h3 className="text-sm font-black uppercase tracking-widest text-white/80 mb-4">{title}</h3>
    {children}
  </div>
);

const BulletList = ({ items, color = "text-white/70", iconColor = "bg-brand-teal" }: { items: string[], color?: string, iconColor?: string }) => (
  <ul className="space-y-3">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${iconColor} mt-2 shrink-0`} />
        <span className={`${color} text-sm leading-relaxed`}>{item}</span>
      </li>
    ))}
  </ul>
);
