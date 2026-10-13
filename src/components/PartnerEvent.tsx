import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Check, Copy, ExternalLink } from 'lucide-react';

// Partner event shown on Home, Run Club and the member profile. Hidden automatically once it has ended.
const PARTNER_EVENT = {
  title: 'RUNWAVE & AFTERWAVE',
  host: 'FITWAVE',
  date: 'Saturday, October 17, 2026',
  time: '5:00 PM - 8:00 PM',
  location: '4835 Collins Ave, Miami Beach, FL 33140',
  price: '$40',
  description: 'A 2-mile run through Miami Beach with a moving DJ, followed by a rooftop HIIT workout and the AFTERWAVE: wellness and biohacking experiences, refreshments, two guest speakers, live painting and an Afro House DJ set at sunset.',
  image: '/events/runwave-afterwave-2026-10-17.webp',
  url: 'https://sweatpals.com/event/runwave-afterwave-by-fitwave/2026-10-17?aff=fasionmeetzfitness',
  promoCode: 'FASHIONMEETZFITNESS',
  promoLabel: '20% off',
  endsAt: '2026-10-17T20:00:00-04:00',
};

const isPartnerEventOver = () => Date.now() > new Date(PARTNER_EVENT.endsAt).getTime();

const [titleMain, titleAccent] = PARTNER_EVENT.title.split(' & ');

const PartnerEventCard = ({ compact = false }: { compact?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(PARTNER_EVENT.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: the code stays visible to copy by hand.
    }
  };

  return (
    <div className={`card-gradient border border-white/10 overflow-hidden grid grid-cols-1 lg:grid-cols-2 ${compact ? 'rounded-[2.5rem]' : 'rounded-[3rem]'}`}>
      <div className="relative aspect-video lg:aspect-auto min-h-[220px] bg-white/5">
        <img src={PARTNER_EVENT.image} alt={PARTNER_EVENT.title} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className={`${compact ? 'p-8' : 'p-8 md:p-12'} space-y-8`}>
        {compact && (
          <div className="space-y-2">
            <span className="text-brand-coral text-[10px] uppercase tracking-[0.4em] font-bold">Upcoming Event</span>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
              {titleMain} <span className="text-brand-coral">& {titleAccent}</span>
            </h3>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">by {PARTNER_EVENT.host}</p>
          </div>
        )}
        <ul className="space-y-4 text-sm text-white/70">
          <li className="flex items-center gap-3"><Calendar size={16} className="text-brand-teal shrink-0" /> {PARTNER_EVENT.date}</li>
          <li className="flex items-center gap-3"><Clock size={16} className="text-brand-teal shrink-0" /> {PARTNER_EVENT.time}</li>
          <li className="flex items-center gap-3"><MapPin size={16} className="text-brand-teal shrink-0" /> {PARTNER_EVENT.location}</li>
        </ul>
        {!compact && <p className="text-white/60 leading-relaxed">{PARTNER_EVENT.description}</p>}
        <div className="border border-dashed border-brand-teal/40 rounded-2xl p-6 space-y-3 bg-brand-teal/5">
          <p className="text-[10px] uppercase tracking-widest text-brand-teal font-bold">Promo code - {PARTNER_EVENT.promoLabel}</p>
          <div className={`flex flex-col gap-4 ${compact ? '' : 'sm:flex-row sm:items-center sm:justify-between'}`}>
            <span className={`font-black text-white ${compact ? 'text-base sm:text-xl tracking-wider' : 'text-base sm:text-xl md:text-2xl tracking-wider sm:tracking-widest'}`}>{PARTNER_EVENT.promoCode}</span>
            <button onClick={copyCode} className={`${compact ? 'self-start' : 'self-start sm:self-auto'} shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/70 hover:text-brand-teal hover:border-brand-teal/40 transition-all`}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <a href={PARTNER_EVENT.url} target="_blank" rel="noopener noreferrer" className="btn-primary px-10 py-4 text-sm uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2">
            Get Tickets <ExternalLink size={16} />
          </a>
          <span className="text-white/40 text-xs uppercase tracking-widest">{PARTNER_EVENT.price} - No refunds</span>
        </div>
      </div>
    </div>
  );
};

// Full-width section for public pages (Home, Run Club).
export const PartnerEventSection = () => {
  if (isPartnerEventOver()) return null;

  return (
    <section className="py-24 px-6 border-b border-white/5">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">Upcoming Event</span>
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white">
            {titleMain} <span className="text-brand-coral">& {titleAccent}</span>
          </h2>
          <p className="text-white/50 text-sm uppercase tracking-widest">by {PARTNER_EVENT.host}</p>
        </div>
        <PartnerEventCard />
      </div>
    </section>
  );
};

// Compact card for the member profile dashboard.
export const PartnerEventProfileCard = () => {
  if (isPartnerEventOver()) return null;
  return <PartnerEventCard compact />;
};
