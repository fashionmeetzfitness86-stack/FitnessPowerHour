import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, MapPin, Mail, CreditCard, Activity, Database, Check } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 selection:bg-brand-teal/30">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-teal/10 blur-[100px] rounded-full pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20 text-brand-teal">
              <Shield size={28} />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4"
          >
            Privacy <span className="text-brand-teal">Policy</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm uppercase tracking-widest font-bold"
          >
            Fashion Meetz Fitness — Transparent Data Security
          </motion.p>
        </div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10 space-y-12"
        >

          <PolicySection title="1. Information We Collect" icon={<Database size={20} />}>
            <div className="space-y-6">
              <PolicySubSection title="a. Personal Information">
                <p className="text-white/70 text-sm leading-relaxed mb-3">When you create an account or use our services, we may collect:</p>
                <BulletList items={[
                  "Full name",
                  "Username",
                  "Email address",
                  "Phone number",
                  "Profile information (fitness level, preferences, goals)",
                  "Photos or content you upload"
                ]} />
              </PolicySubSection>

              <PolicySubSection title="b. Payment Information">
                <p className="text-white/70 text-sm leading-relaxed mb-3">Payments are processed securely through Stripe.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl">
                    <h4 className="text-red-400 text-[10px] uppercase tracking-widest font-black mb-3">We Do Not Store:</h4>
                    <BulletList items={["Full credit card numbers", "Full payment details"]} color="text-white/60" />
                  </div>
                  <div className="bg-brand-teal/5 border border-brand-teal/10 p-5 rounded-2xl">
                    <h4 className="text-brand-teal text-[10px] uppercase tracking-widest font-black mb-3">We May Store:</h4>
                    <BulletList items={["Payment method type (e.g., Visa)", "Last 4 digits of card", "Subscription status", "Billing history"]} color="text-white/60" />
                  </div>
                </div>
              </PolicySubSection>

              <div className="grid md:grid-cols-2 gap-6">
                <PolicySubSection title="c. Usage Data">
                  <p className="text-white/70 text-sm leading-relaxed mb-3">We automatically collect:</p>
                  <BulletList items={[
                    "Login activity",
                    "Workout activity and progress",
                    "Videos watched / liked / bookmarked",
                    "Service requests and bookings",
                    "Device/browser type"
                  ]} />
                </PolicySubSection>
                <PolicySubSection title="d. Location Data">
                  <p className="text-white/70 text-sm leading-relaxed mb-3">We may collect general location (city/region) to:</p>
                  <BulletList items={[
                    "Personalize content",
                    "Enable local services and training requests"
                  ]} />
                </PolicySubSection>
              </div>
            </div>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="2. How We Use Your Information" icon={<Activity size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">We use your data to:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {[
                "Provide and operate the platform",
                "Manage your membership and billing",
                "Personalize your fitness experience",
                "Track your progress and activity",
                "Process service requests and bookings",
                "Send notifications and updates",
                "Improve platform performance and features",
                "Ensure security and prevent abuse"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check size={14} className="text-brand-teal shrink-0" />
                  <span className="text-white/70 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="3. Membership & Payments" icon={<CreditCard size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">When you subscribe:</p>
            <BulletList items={[
              "Your membership status is updated automatically",
              "Billing is handled via Stripe",
              "You can manage your subscription through the Stripe Customer Portal",
              "Auto-renewal is enabled unless canceled"
            ]} />
          </PolicySection>

          <PolicyLine />

          <PolicySection title="4. How We Share Your Information" icon={<Shield size={20} />}>
            <div className="p-4 bg-brand-coral/5 border border-brand-coral/20 rounded-xl inline-block mb-5">
              <span className="text-brand-coral font-black uppercase tracking-widest text-[10px]">We do NOT sell your personal data.</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-3">We may share limited data only when necessary to operate the platform with:</p>
            <BulletList items={[
              "Payment processors (Stripe)",
              "Service providers (hosting, analytics)",
              "Admin users (for service fulfillment and support)"
            ]} />
          </PolicySection>

          <PolicyLine />
          
          <PolicySection title="5. User Content">
            <p className="text-white/70 text-sm leading-relaxed mb-4">When you upload content (photos, comments, activity logs):</p>
            <BulletList items={[
              "You retain ownership",
              "You grant FMF permission to store and display it within the platform",
              "Content may be visible to admins or within community features (if enabled)"
            ]} />
          </PolicySection>

          <PolicyLine />

          <PolicySection title="6. Data Security" icon={<Lock size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">We implement industry-standard security measures:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Secure Auth", icon: Lock },
                { label: "Encrypted HTTPS", icon: Shield },
                { label: "Protected DB", icon: Database },
                { label: "Role Control", icon: Shield }
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3">
                  <item.icon size={20} className="text-brand-teal/50" />
                  <span className="text-white/60 text-[9px] uppercase font-black tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-white/50 text-xs italic">However, no system is 100% secure. Use the platform responsibly.</p>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="7. Your Rights">
            <p className="text-white/70 text-sm leading-relaxed mb-4">You can:</p>
            <BulletList items={[
              "Access your data",
              "Update your profile",
              "Delete your account (upon request)",
              "Cancel your membership at any time"
            ]} />
            <p className="text-white/50 text-xs italic mt-4">For account deletion or data requests, contact us directly.</p>
          </PolicySection>

          <PolicyLine />

          <div className="grid md:grid-cols-2 gap-12 border-b border-white/5 pb-12">
            <PolicySection title="8. Data Retention">
              <p className="text-white/70 text-sm leading-relaxed mb-4">We keep your data only as long as necessary to:</p>
              <BulletList items={[
                "provide services",
                "comply with legal obligations",
                "resolve disputes"
              ]} />
            </PolicySection>

            <PolicySection title="9. Cookies & Tracking">
              <p className="text-white/70 text-sm leading-relaxed mb-4">We may use cookies or similar technologies to:</p>
              <BulletList items={[
                "keep you logged in",
                "improve performance",
                "analyze usage"
              ]} />
              <p className="text-white/50 text-xs italic mt-4">You can control cookies through your browser settings.</p>
            </PolicySection>
          </div>

          <div className="grid md:grid-cols-2 gap-12 border-b border-white/5 pb-12">
             <PolicySection title="10. Third-Party Services">
               <p className="text-white/70 text-sm leading-relaxed mb-4">We rely on third-party services including:</p>
               <BulletList items={[
                 "Stripe (payments)",
                 "Hosting and backend infrastructure providers"
               ]} />
               <p className="text-white/50 text-xs italic mt-4">These services have their own privacy policies.</p>
             </PolicySection>

             <PolicySection title="11. Children’s Privacy">
               <p className="text-white/70 text-sm leading-relaxed mb-4">FMF is not intended for individuals under 18.</p>
               <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                 <p className="text-red-400 font-black uppercase text-[10px] tracking-widest">We do not knowingly collect data from minors.</p>
               </div>
             </PolicySection>
          </div>

          <PolicySection title="12. Changes to This Policy">
            <p className="text-white/70 text-sm leading-relaxed">
              We may update this Privacy Policy at any time. If changes are significant, we will notify users through the platform.
            </p>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="13. Contact Us" icon={<Mail size={20} />}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex-1">
                <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Email</p>
                  <a href="mailto:fitnesspowerhour@gmail.com" className="text-sm font-black hover:text-brand-teal transition-colors">fitnesspowerhour@gmail.com</a>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex-1">
                <div className="w-10 h-10 rounded-full bg-brand-coral/10 flex items-center justify-center text-brand-coral shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Location</p>
                  <p className="text-sm font-black uppercase tracking-widest text-white">Miami Beach, Florida</p>
                </div>
              </div>
            </div>
          </PolicySection>

        </motion.div>
      </div>
    </div>
  );
};

const PolicyLine = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
)

const PolicySection = ({ title, children, icon }: { title: string, children: React.ReactNode, icon?: React.ReactNode }) => (
  <div>
    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-6 flex items-center gap-3">
      {icon && <span className="text-brand-teal">{icon}</span>}
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

const BulletList = ({ items, color = "text-white/70" }: { items: string[], color?: string }) => (
  <ul className="space-y-3">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 shrink-0" />
        <span className={`${color} text-sm leading-relaxed`}>{item}</span>
      </li>
    ))}
  </ul>
);
