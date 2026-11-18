import { Link } from 'react-router-dom';
import { Dumbbell, BicepsFlexed, Users, Apple } from 'lucide-react';

// Line icons the lucide set does not have, drawn to match its 1.5px stroke style.
const RunnerIcon = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="15.5" cy="3.8" r="1.8" />
    <path d="M9 8.5l3.5-2 3 2.5 2.5 2.5 2.5-.5" />
    <path d="M12.5 6.5l-2 6 3.5 3-1 5.5" />
    <path d="M10.5 12.5l-2.5 3.5-4.5.5" />
    <path d="M9 8.5L6 10" />
  </svg>
);

const LotusIcon = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 19c-2.5-2-3.5-4.5-3.5-7.5S10 6 12 4c2 2 3.5 4.5 3.5 7.5S14.5 17 12 19z" />
    <path d="M12 19c-3.5 0-7-2-8.5-6 2.5-.5 4.5 0 5.5 1" />
    <path d="M12 19c3.5 0 7-2 8.5-6-2.5-.5-4.5 0-5.5 1" />
    <path d="M12 19c-5 .5-8.5-1.5-10-4" />
    <path d="M12 19c5 .5 8.5-1.5 10-4" />
  </svg>
);

// Stopwatch with a flexed arm (left logo of the flyer).
const StopwatchLogo = () => (
  <svg viewBox="0 0 120 130" className="w-full h-full" fill="none" stroke="currentColor" aria-hidden="true">
    <rect x="52" y="2" width="16" height="9" rx="2" strokeWidth="5" />
    <path d="M60 11v8" strokeWidth="6" />
    <path d="M94 26l7-7" strokeWidth="6" strokeLinecap="round" />
    <circle cx="60" cy="74" r="52" strokeWidth="5" />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      return (
        <line key={i} x1={60 + Math.sin(a) * 42} y1={74 - Math.cos(a) * 42} x2={60 + Math.sin(a) * 47} y2={74 - Math.cos(a) * 47} strokeWidth="3.5" strokeLinecap="round" />
      );
    })}
    <g transform="translate(26 40) scale(2.85)" fill="currentColor" stroke="none">
      <path d="M2.5 15.5c0-3 1.5-5.5 4-7l1.8-3.8c.4-.9 1.3-1.4 2.3-1.2l1.6.3c.8.2 1.2 1 .9 1.8l-.7 1.6c-.3.7-1 1.1-1.8 1l-.9-.1-.9 2.4c2.4-1.2 5.6-.9 7.6 1 2.3 2.1 2.2 5.6-.2 7.5-2.2 1.8-5.4 1.6-7.6.4-1.3 1-3 1.4-4.6 1-1.4-.4-2.3-1.8-2.3-3.2z" />
    </g>
  </svg>
);

// Circle with a figure in a plank / push-up start (right logo of the flyer).
const PlankLogo = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" stroke="currentColor" aria-hidden="true">
    <circle cx="60" cy="60" r="55" strokeWidth="5" />
    <g fill="currentColor" stroke="none">
      <circle cx="40" cy="46" r="6" />
      <path d="M45 52c6-2 14-1 22 2l14 6c3 1 4 4 2 6l-1 1 10 10c1.5 1.5.5 4-1.6 4H86l-9-9-5 3 2 6h-6l-3-8 0 0-9-3-6 11h-6l5-13-8 4 1 9h-5l-2-12c-.3-1.5.4-3 1.8-3.7L45 52z" />
    </g>
  </svg>
);

const SERVICES = [
  { label: ['Strength', 'Training'], icon: <Dumbbell size={30} strokeWidth={1.5} /> },
  { label: ['Conditioning', '& Athletic'], icon: <RunnerIcon /> },
  { label: ['Muscle', 'Building'], icon: <BicepsFlexed size={30} strokeWidth={1.5} /> },
  { label: ['Small', 'Group'], icon: <Users size={30} strokeWidth={1.5} /> },
  { label: ['Mobility', '& Recovery'], icon: <LotusIcon /> },
  { label: ['Nutrition', '& Lifestyle', 'Coaching'], icon: <Apple size={30} strokeWidth={1.5} /> },
];

interface HomeHeroProps {
  bgImage: string;
  ctaText: string;
  ctaUrl: string;
}

export const HomeHero = ({ bgImage, ctaText, ctaUrl }: HomeHeroProps) => {
  const ctaClass = 'inline-block border border-white/80 px-10 py-3.5 text-xs sm:text-sm uppercase tracking-[0.45em] text-white hover:bg-white hover:text-black transition-colors';
  const isInternal = ctaUrl.startsWith('/');

  return (
    <section className="relative overflow-hidden bg-brand-black text-white" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Photo */}
      <img src={bgImage} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-top" />
      {/* Light veil on top, heavy fade to black at the bottom (like the flyer) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#1a1512] via-[#1a1512]/85 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-14 flex flex-col items-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* Top line */}
        <div className="w-full relative flex flex-col sm:block items-center">
          <p className="text-center text-[11px] sm:text-sm uppercase tracking-[0.45em] text-white/90 font-light">Miami Training Collective</p>
          <p className="mt-4 sm:mt-0 sm:absolute sm:right-0 sm:top-0 text-center sm:text-right text-[10px] sm:text-xs uppercase tracking-[0.22em] leading-relaxed text-white/85 font-light">
            Personal Training<br />Performance Coaching<br />Nutrition &amp; Recovery<br />In Miami
          </p>
        </div>

        {/* Title */}
        <div className="flex-1 flex flex-col items-center justify-center pt-24 sm:pt-40 pb-8">
          <h1 className="font-serif-display italic uppercase text-center leading-[0.92] text-[3.4rem] sm:text-7xl md:text-8xl lg:text-[7.5rem] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)]">
            Train.<br />Build.<br />Recover.
          </h1>
          <p className="mt-7 text-[10px] sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.3em] text-white/85 font-light flex flex-wrap justify-center gap-x-4 sm:gap-x-8 gap-y-1">
            <span>Personal Training</span><span aria-hidden="true">/</span><span>Performance</span><span aria-hidden="true">/</span><span>Lifestyle</span>
          </p>
        </div>

        {/* Services */}
        <ul className="grid grid-cols-3 md:grid-cols-6 gap-x-6 gap-y-8 sm:gap-x-12 w-full max-w-4xl">
          {SERVICES.map(s => (
            <li key={s.label.join(' ')} className="flex flex-col items-center text-center gap-3 text-white/90">
              {s.icon}
              <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.15em] leading-snug font-light">
                {s.label.map((l, i) => <span key={i} className="block">{l}</span>)}
              </span>
            </li>
          ))}
        </ul>

        {/* Logos */}
        <div className="mt-14 flex items-center justify-center gap-8 sm:gap-14 text-white">
          <div className="w-28 h-28 sm:w-40 sm:h-40"><StopwatchLogo /></div>
          <span className="text-3xl sm:text-4xl font-extralight" aria-hidden="true">×</span>
          <div className="w-28 h-28 sm:w-40 sm:h-40"><PlankLogo /></div>
        </div>

        {/* CTA */}
        <div className="mt-14">
          {isInternal
            ? <Link to={ctaUrl} className={ctaClass}>{ctaText}</Link>
            : <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className={ctaClass}>{ctaText}</a>}
        </div>
      </div>
    </section>
  );
};
