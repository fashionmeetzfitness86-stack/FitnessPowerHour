import React from 'react';
import { motion } from 'motion/react';
import { FileText, CheckCircle, ShieldAlert, CreditCard, User, AlertTriangle, MonitorPlay, Lock, FileWarning, RotateCcw, Box, UserCheck, Eye, Shield, Scale, Mail, MapPin } from 'lucide-react';

export const TermsOfService = () => {
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
              <FileText size={28} />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4"
          >
            Terms & <span className="text-brand-teal">Conditions</span>
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
          <div className="p-6 bg-brand-teal/5 border border-brand-teal/10 rounded-2xl">
            <p className="text-white/80 text-sm leading-relaxed">
              Welcome to Fashion Meetz Fitness (FMF), operated by TheMainKeys Group. By accessing or using our platform, you agree to the following Terms & Conditions.
            </p>
          </div>

          <PolicySection title="1. Acceptance of Terms" icon={<CheckCircle size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">By using FMF, you confirm that:</p>
            <BulletList items={[
              "You are at least 18 years old",
              "You agree to these Terms & Conditions",
              "You will use the platform responsibly and legally"
            ]} />
            <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-white/60 text-xs italic font-black uppercase tracking-widest">If you do not agree, do not use the platform.</p>
            </div>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="2. Services Provided" icon={<MonitorPlay size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">FMF provides:</p>
            <BulletList items={[
              "Fitness content (videos, programs, training guidance)",
              "Progress tracking tools",
              "Service requests (e.g., personal training, sessions)",
              "Digital community features (when available)",
              "Product purchases (if applicable)"
            ]} />
            <p className="text-white/50 text-xs italic mt-4">We reserve the right to modify or discontinue any service at any time.</p>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="3. Membership & Billing" icon={<CreditCard size={20} />}>
            <div className="space-y-8">
              <PolicySubSection title="a. Subscription">
                <BulletList items={[
                  "FMF offers a paid membership (“Basic Tier”)",
                  "Membership grants access to premium features and content"
                ]} />
              </PolicySubSection>

              <PolicySubSection title="b. Billing">
                <p className="text-white/70 text-sm leading-relaxed mb-3">Payments are processed via Stripe.</p>
                <p className="text-white/70 text-sm leading-relaxed mb-3">By subscribing, you agree:</p>
                <BulletList items={[
                  "To automatic recurring billing",
                  "To be charged on your billing cycle",
                  "To keep your payment method valid"
                ]} />
              </PolicySubSection>

              <div className="grid md:grid-cols-2 gap-6">
                <PolicySubSection title="c. Cancellation">
                  <BulletList items={[
                    "You may cancel at any time via the Stripe Customer Portal",
                    "Cancellation stops future billing",
                    "Access may continue until the end of the billing period"
                  ]} />
                </PolicySubSection>
                <PolicySubSection title="d. Refunds">
                  <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl h-full flex items-center">
                    <p className="text-red-400 text-sm font-black uppercase tracking-widest">All payments are non-refundable, unless otherwise stated.</p>
                  </div>
                </PolicySubSection>
              </div>
            </div>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="4. User Accounts" icon={<User size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">You are responsible for:</p>
            <BulletList items={[
              "Keeping your login credentials secure",
              "All activity under your account",
              "Providing accurate information"
            ]} />
            <div className="mt-6 p-4 bg-brand-coral/5 border border-brand-coral/10 rounded-xl">
              <p className="text-brand-coral text-[10px] uppercase font-black tracking-widest mb-2">We reserve the right to suspend or terminate accounts that:</p>
              <BulletList items={[
                "violate these Terms",
                "engage in abuse, fraud, or misuse"
              ]} color="text-brand-coral/70" />
            </div>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="5. Platform Usage Rules" icon={<ShieldAlert size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">You agree NOT to:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {[
                "Share your account with others",
                "Upload harmful, illegal, or offensive content",
                "Attempt to hack, exploit, or disrupt the platform",
                "Copy, redistribute, or resell platform content"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span className="text-white/70 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-red-400 text-xs uppercase tracking-widest font-black italic">Violation may result in immediate account termination.</p>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="6. Fitness Disclaimer" icon={<AlertTriangle size={20} />}>
            <div className="p-6 bg-brand-teal/5 border border-brand-teal/10 rounded-2xl mb-6">
              <p className="text-brand-teal text-sm font-black uppercase tracking-widest text-center">FMF provides general fitness guidance only.</p>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">By using the platform, you agree:</p>
            <BulletList items={[
              "You are responsible for your health and physical condition",
              "You will consult a medical professional if needed",
              "You assume all risks associated with physical activity"
            ]} />
            <p className="text-white/50 text-xs italic mt-4 uppercase font-bold tracking-widest">FMF and its operators are not liable for injuries or health issues.</p>
          </PolicySection>

          <PolicyLine />

          <div className="grid md:grid-cols-2 gap-12 border-b border-white/5 pb-12">
            <PolicySection title="7. Service Requests & Bookings" icon={<UserCheck size={20} />}>
              <p className="text-white/70 text-sm leading-relaxed mb-3">When requesting services:</p>
              <BulletList items={[
                "Requests are subject to approval",
                "Availability is not guaranteed",
                "Admins may modify or confirm bookings"
              ]} />
              <p className="text-white/70 text-sm leading-relaxed mt-5 mb-3">Once confirmed:</p>
              <BulletList items={[
                "You agree to the terms of the scheduled service"
              ]} />
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-black mt-4">Missed or cancelled sessions may not be refundable.</p>
            </PolicySection>

            <PolicySection title="8. Orders & Purchases" icon={<Box size={20} />}>
              <p className="text-white/70 text-sm leading-relaxed mb-3">For products purchased on the platform:</p>
              <BulletList items={[
                "Orders may be subject to availability",
                "Shipping and processing times may vary",
                "Order status is managed through your account"
              ]} />
              <p className="text-white/70 text-sm leading-relaxed mt-5 mb-3">We reserve the right to:</p>
              <BulletList items={[
                "cancel or refuse orders",
                "correct pricing errors"
              ]} />
            </PolicySection>
          </div>

          <div className="grid md:grid-cols-2 gap-12 border-b border-white/5 pb-12 pt-12">
            <PolicySection title="9. Content Ownership" icon={<Eye size={20} />}>
              <p className="text-white/70 text-sm leading-relaxed mb-4 italic">
                All platform content (videos, branding, materials) is owned by FMF.
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="text-brand-teal text-[10px] uppercase tracking-widest font-black mb-2 flex items-center gap-2"><CheckCircle size={10} /> You may:</h4>
                  <BulletList items={["view and use content for personal use only"]} />
                </div>
                <div>
                  <h4 className="text-brand-coral text-[10px] uppercase tracking-widest font-black mb-2 flex items-center gap-2"><ShieldAlert size={10} /> You may NOT:</h4>
                  <BulletList items={["copy, distribute, or resell content", "use content for commercial purposes"]} />
                </div>
              </div>
            </PolicySection>

            <PolicySection title="10. User-Generated Content">
              <p className="text-white/70 text-sm leading-relaxed mb-4">If you upload content (photos, comments, etc.):</p>
              <BulletList items={[
                "You retain ownership",
                "You grant FMF the right to use, display, and store it"
              ]} />
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-black mt-4">We may remove content that violates guidelines.</p>
            </PolicySection>
          </div>

          <PolicySection title="11. Privacy" icon={<Lock size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed">
              Your use of the platform is also governed by our Privacy Policy.
            </p>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="12. Limitation of Liability" icon={<FileWarning size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">To the maximum extent permitted by law, FMF is not liable for:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Injuries or Health Issues" },
                { label: "Loss of Data" },
                { label: "Service Interruptions" },
                { label: "Indirect Damages" }
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                  <span className="text-white/60 text-[9px] uppercase font-black tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-white/50 text-xs italic uppercase tracking-widest font-black">Use the platform at your own risk.</p>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="13. Termination" icon={<RotateCcw size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">We may suspend or terminate your account if you:</p>
            <BulletList items={[
              "violate these Terms",
              "misuse the platform",
              "engage in fraudulent or harmful activity"
            ]} />
            <p className="text-brand-coral/70 text-[10px] font-black uppercase tracking-widest mt-4">No refunds will be issued upon termination for violations.</p>
          </PolicySection>

          <PolicyLine />

          <div className="grid md:grid-cols-2 gap-12 border-b border-white/5 pb-12">
            <PolicySection title="14. Changes to Terms">
              <p className="text-white/70 text-sm leading-relaxed">
                We may update these Terms at any time. Continued use of the platform means you accept the updated Terms.
              </p>
            </PolicySection>

            <PolicySection title="15. Governing Law" icon={<Scale size={20} />}>
              <p className="text-white/70 text-sm leading-relaxed mb-2">These Terms are governed by the laws of:</p>
              <div className="inline-block p-4 bg-brand-teal/5 border border-brand-teal/20 rounded-xl">
                <span className="text-brand-teal font-black uppercase tracking-widest text-[11px]">👉 Florida, United States</span>
              </div>
            </PolicySection>
          </div>

          <PolicySection title="16. Contact" icon={<Mail size={20} />}>
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
