import React from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, ShieldAlert, CreditCard, CalendarX, PackageX, MonitorPlay, AlertTriangle, AlertCircle, FileWarning, StopCircle, RefreshCw, Box, Mail, MapPin } from 'lucide-react';

export const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 selection:bg-brand-coral/30">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-coral/10 blur-[100px] rounded-full pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-brand-coral/10 flex items-center justify-center border border-brand-coral/20 text-brand-coral">
              <RefreshCcw size={28} />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4"
          >
            Refund <span className="text-brand-coral">Policy</span>
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
          <div className="p-6 bg-brand-coral/5 border border-brand-coral/10 rounded-2xl">
            <p className="text-white/80 text-sm leading-relaxed">
              This Refund Policy applies to all purchases made through Fashion Meetz Fitness (FMF), operated by TheMainKeys Group.
            </p>
          </div>

          <PolicySection title="1. Membership Subscriptions" icon={<CreditCard size={20} />}>
            <div className="space-y-8">
              <PolicySubSection title="a. No Refund Policy">
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl mb-4">
                  <p className="text-red-400 text-sm font-black uppercase tracking-widest text-center">
                    All membership payments (including the Basic Tier subscription) are non-refundable.
                  </p>
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-3">By subscribing, you agree that:</p>
                <BulletList items={[
                  "Payments are final once processed",
                  "No refunds will be issued for partial billing periods",
                  "No refunds will be issued for unused time"
                ]} />
              </PolicySubSection>

              <PolicySubSection title="b. Cancellation">
                <p className="text-white/70 text-sm leading-relaxed mb-3">You may cancel your membership at any time via the Stripe Portal.</p>
                <BulletList items={[
                  "Cancellation stops future billing",
                  "You will retain access until the end of your current billing cycle"
                ]} color="text-brand-teal" />
              </PolicySubSection>
            </div>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="2. Services & Training Sessions" icon={<CalendarX size={20} />}>
             <p className="text-white/70 text-sm leading-relaxed mb-6 italic">
                For any services requested (e.g., personal training, sessions, bookings):
             </p>
             <div className="grid md:grid-cols-2 gap-8">
                <PolicySubSection title="a. Confirmed Appointments">
                  <BulletList items={[
                    "Once a booking is confirmed, it is considered final",
                    "Missed sessions or no-shows are non-refundable"
                  ]} color="text-red-400/80" />
                </PolicySubSection>
                <PolicySubSection title="b. Rescheduling">
                  <BulletList items={[
                    "Rescheduling may be allowed depending on availability",
                    "Requests must be made in advance and are subject to approval"
                  ]} />
                </PolicySubSection>
             </div>
             <div className="mt-8">
                <PolicySubSection title="c. Cancellations">
                  <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <StopCircle size={18} className="text-brand-coral mt-0.5 shrink-0" />
                    <p className="text-white/70 text-sm">Late cancellations may not be eligible for rescheduling or credit.</p>
                  </div>
                </PolicySubSection>
             </div>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="3. Product Purchases" icon={<Box size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-6 italic">
              For physical or digital products sold through FMF:
            </p>
            <div className="space-y-8">
              <PolicySubSection title="a. All Sales Final">
                <p className="text-white/70 text-sm leading-relaxed">
                   All purchases are considered final sale unless otherwise stated.
                </p>
              </PolicySubSection>

              <PolicySubSection title="b. Damaged or Incorrect Items">
                <p className="text-white/70 text-sm leading-relaxed mb-3">If you receive a damaged item or an incorrect product:</p>
                <div className="flex items-start gap-4 p-4 bg-brand-coral/5 border border-brand-coral/10 rounded-xl mb-4">
                  <AlertCircle size={18} className="text-brand-coral mt-0.5 shrink-0" />
                  <p className="text-brand-coral text-sm font-black uppercase tracking-widest">
                    You must contact us within 7 days of delivery.
                  </p>
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-3">If approved, we may offer:</p>
                <BulletList items={[
                  "a replacement",
                  "or store credit"
                ]} />
              </PolicySubSection>
            </div>
          </PolicySection>

          <PolicyLine />

          <div className="grid md:grid-cols-2 gap-12 border-b border-white/5 pb-12">
            <PolicySection title="4. Digital Content" icon={<MonitorPlay size={20} />}>
              <p className="text-white/70 text-sm leading-relaxed mb-4">All digital products, including:</p>
              <BulletList items={[
                "workout programs",
                "video content",
                "downloadable materials"
              ]} />
              <div className="mt-6 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                 <p className="text-red-400 text-[10px] uppercase tracking-widest font-black leading-relaxed">
                    ARE NON-REFUNDABLE ONCE ACCESSED OR DELIVERED.
                 </p>
              </div>
            </PolicySection>

            <PolicySection title="5. Billing Errors" icon={<RefreshCw size={20} />}>
              <p className="text-white/70 text-sm leading-relaxed mb-4">If you believe you were charged incorrectly:</p>
              <div className="space-y-3">
                 <div className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full bg-brand-coral/20 flex items-center justify-center text-brand-coral text-[10px] font-black shrink-0">1</div>
                   <p className="text-white/70 text-sm">Contact us immediately</p>
                 </div>
                 <div className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal text-[10px] font-black shrink-0">2</div>
                   <p className="text-white/70 text-sm">We will review the issue and correct verified billing errors if applicable</p>
                 </div>
              </div>
            </PolicySection>
          </div>

          <div className="pt-8">
            <PolicySection title="6. Exceptions" icon={<ShieldAlert size={20} />}>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Refunds may only be issued at the sole discretion of FMF in rare cases, including:
              </p>
              <BulletList items={[
                "verified technical errors",
                "duplicate charges",
                "platform malfunction preventing access"
              ]} />
            </PolicySection>
          </div>

          <PolicyLine />

          <PolicySection title="7. Chargebacks" icon={<FileWarning size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-4">Initiating a chargeback without contacting us first may result in:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {[
                "Account Suspension",
                "Permanent Ban From The Platform"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span className="text-white/80 text-sm font-bold uppercase tracking-widest text-[10px]">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest italic mt-2">We strongly encourage resolving issues directly with us.</p>
          </PolicySection>

          <PolicyLine />

          <PolicySection title="8. Contact Us" icon={<Mail size={20} />}>
            <p className="text-white/70 text-sm leading-relaxed mb-6">For any refund-related questions:</p>
            <div className="flex flex-col md:flex-row gap-6">
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
      {icon && <span className="text-brand-coral">{icon}</span>}
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
        <div className="w-1.5 h-1.5 rounded-full bg-brand-coral mt-2 shrink-0" />
        <span className={`${color} text-sm leading-relaxed`}>{item}</span>
      </li>
    ))}
  </ul>
);
