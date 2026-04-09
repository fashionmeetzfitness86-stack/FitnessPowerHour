import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, LayoutDashboard, LineChart, Calendar, 
  PlaySquare, Video, Shield, CreditCard, 
  Map, ShoppingBag, Settings, Bell, LogOut, Heart, MessageSquare, Users
} from 'lucide-react';
import { supabase } from '../../supabase';

import { Overview } from './Overview';
import { Progress } from './Progress';
import { Calendar as CalendarTab } from './Calendar';
import { MyPrograms } from './MyPrograms';
import { MyVideos } from './MyVideos';
import { MembershipManager } from './MembershipManager';
import { Billing } from './Billing';
import { RetreatsTab } from './RetreatsTab';
import { EditProfile } from './EditProfile';
import { Notifications } from './Notifications';
import { CommunityAccessTab } from './CommunityAccessTab';

import { OnboardingFlow } from './OnboardingFlow';

export const ProfileDashboard = ({ user, logout, updateTier, showToast }: any) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const shouldShow = sessionStorage.getItem('intent_onboarding') === 'true';
    if (shouldShow) sessionStorage.removeItem('intent_onboarding');
    return shouldShow && user && !user.onboarding_completed;
  });
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
      const parts = hash.split('#');
      if (parts.length > 2) {
         return parts[2];
      }
    }
    return 'overview';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('#')) {
         const parts = hash.split('#');
         if (parts.length > 2) {
            setActiveTab(parts[2]);
         }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('payment') === 'success') {
      setIsProcessingPayment(true);
      const isService = searchParams.get('type') === 'service';
      if (isService) {
        setActiveTab('calendar');
      }
      setTimeout(() => {
        setIsProcessingPayment(false);
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 4000);
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    ...(user?.role === 'athlete' ? [{ id: 'athlete', label: 'Athlete Intel', icon: Shield }] : []),
    { id: 'community', label: 'Tribe Community', icon: MessageSquare },
    { id: 'progress', label: 'Progress Tracking', icon: LineChart },
    { id: 'calendar', label: 'Workout Calendar', icon: Calendar },
    { id: 'programs', label: 'My Programs', icon: PlaySquare },
    { id: 'videos-out', label: 'Video Library', icon: Video },
    { id: 'membership', label: 'Membership', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'retreats', label: 'Retreats', icon: Map },
    { id: 'orders', label: 'Order History', icon: ShoppingBag },
    { id: 'settings', label: 'Edit Profile', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const isMember = user?.tier === 'Basic' || user?.role === 'admin' || user?.role === 'super_admin';

  const renderContent = () => {
    const isMemberLocal = isMember;
    const lockedTabs = ['progress', 'calendar', 'community', 'retreats', 'programs'];

    if (!isMemberLocal && lockedTabs.includes(activeTab)) {
      return (
        <div className="flex flex-col items-center justify-center p-16 text-center card-gradient rounded-[3rem] border border-brand-teal/20 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-teal/5 blur-3xl rounded-full" />
          <Shield size={48} className="text-brand-teal animate-pulse relative z-10" />
          <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter relative z-10">Premium <span className="text-brand-teal">Required</span></h2>
          <p className="text-white/50 text-sm max-w-sm relative z-10">This dashboard section requires an active FMF membership to access tracking and scheduling tools.</p>
          <button onClick={() => setActiveTab('membership')} className="mt-4 px-8 py-4 bg-brand-teal text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:scale-105 transition-all relative z-10 shadow-glow-teal">
            Upgrade Membership
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': return <Overview user={user} showToast={showToast} onTabChange={setActiveTab} />;
      case 'progress': return <Progress user={user} showToast={showToast} />;
      case 'calendar': return <CalendarTab user={user} showToast={showToast} />;
      case 'programs': return <MyPrograms user={user} />;
      case 'membership': return <MembershipManager user={user} updateTier={updateTier} showToast={showToast} />;
      case 'billing': return <Billing user={user} showToast={showToast} />;
      case 'retreats': return <RetreatsTab user={user} showToast={showToast} />;
      case 'settings': return <EditProfile user={user} showToast={showToast} />;
      case 'notifications': return <Notifications user={user} showToast={showToast} />;
      case 'community': return <CommunityAccessTab user={user} showToast={showToast} />;
      default: return <Overview user={user} showToast={showToast} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="pt-40 pb-32 px-6 bg-brand-black text-white">
      {showOnboarding && (
        <OnboardingFlow 
          showToast={showToast} 
          onComplete={() => {
            // Guarantee unmount by manually toggling our state
            setShowOnboarding(false);
            if (user) user.onboarding_completed = true;
            setActiveTab('membership');
            window.location.hash = '#/profile#membership';
            // Force re-render or push to refresh from context
            showToast('Onboarding finished. Let\'s get your membership set up!', 'success');
          }} 
        />
      )}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* Sidebar Navigation */}
        <div className="lg:w-72 flex-shrink-0 space-y-8">
          <div className="card-gradient p-8 text-center space-y-4 border-brand-teal/20">
            <div className="w-24 h-24 rounded-full bg-white/5 mx-auto overflow-hidden border-2 border-brand-teal/50 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/20">
                  {user.full_name?.[0] || 'M'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight">{user.full_name || 'Member'}</h2>
              <p className="text-[10px] text-brand-teal uppercase tracking-widest font-bold mt-1 mb-2">{isMember ? 'Basic Tier' : 'General Access'}</p>
              {user.training_goals && user.workout_style && (
                 <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-white/10 text-center">
                    <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Protocol Objective</span>
                    <span className="text-[10px] text-brand-coral uppercase tracking-widest font-black truncate">
                      {String(user.training_goals).replace('_', ' ')} / {user.workout_style}
                    </span>
                 </div>
              )}
            </div>
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Link
                to="/admin/dashboard"
                className="flex items-center justify-center gap-2 w-full py-3 bg-brand-teal text-black text-[10px] uppercase tracking-widest font-black rounded-xl hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all mb-4"
              >
                <Shield size={14} /> Admin Dashboard
              </Link>
            )}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full text-[10px] uppercase tracking-widest text-white/40 hover:text-brand-coral transition-colors"
              >
                <LogOut size={14} /> Sign Out Session
              </button>
            </div>
          </div>

          <nav className="card-gradient p-4 flex-col gap-1 hidden lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                      if (item.id === 'videos-out') {
                          window.location.hash = '#/videos';
                      } else {
                          setActiveTab(item.id);
                      }
                  }}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${
                    activeTab === item.id
                      ? 'bg-brand-teal text-black shadow-lg shadow-brand-teal/20'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} /> {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Tab Scroller */}
          <div className="lg:hidden flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                      if (item.id === 'videos-out') {
                          window.location.hash = '#/videos';
                      } else {
                          setActiveTab(item.id);
                      }
                  }}
                  className={`flex flex-col items-center gap-2 min-w-[80px] p-4 rounded-xl transition-all flex-shrink-0 ${
                    activeTab === item.id
                      ? 'bg-brand-teal text-black shadow-lg shadow-brand-teal/20'
                      : 'bg-white/5 text-white/40 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[8px] uppercase tracking-widest font-bold text-center w-full truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow min-w-0 relative">
          <AnimatePresence mode="wait">
            {isProcessingPayment ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center p-12 card-gradient border border-brand-teal/20 rounded-3xl"
              >
                 <div className="w-20 h-20 rounded-full border-4 border-brand-teal/20 border-t-brand-teal animate-spin mb-8" />
                 <h2 className="text-2xl font-bold uppercase tracking-widest">Validating Payment Matrix</h2>
                 <p className="text-white/40 mt-4 max-w-sm text-center">Synchronizing with central protocol. Your session is being provisioned...</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
