/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Menu, X, Instagram, Twitter, Facebook, ArrowRight, 
  Play, Calendar, ShoppingBag, Info, ChevronRight, ChevronLeft,
  Dumbbell, Zap, Heart, MapPin, Clock, Star, AlertCircle,
  Filter, Search, User, Quote, Plus, Upload, Link2, Send, Bell, Trash2,
  Youtube, ExternalLink, Share2, Trophy, Check, Users
} from 'lucide-react';
import React, { useState, useEffect, useMemo, useRef, FormEvent, createContext, useContext, ReactNode, Component } from 'react';
import { Video, Product, TrainingSession, Retreat, CollaborationBrand, UserProfile, Post, Comment, WorkoutLog, PersonalBest, Notification } from './types';

import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  getDocFromServer,
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    const state = this['state'] as any;
    if (state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(state.error.message);
        if (parsed.error) errorMessage = `Error: ${parsed.error}`;
      } catch (e) {
        errorMessage = state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-black p-6 text-center">
          <div className="card-gradient p-12 max-w-md space-y-6">
            <div className="w-16 h-16 bg-brand-coral/20 rounded-full flex items-center justify-center mx-auto text-brand-coral">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tighter">System Error</h2>
            <p className="text-white/40 text-sm leading-relaxed">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary w-full"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this['props'] as any).children;
  }
}

// --- Mock Data ---

const VIDEOS: Video[] = [
  { id: 'v1', title: 'Morning Activation', category: 'Mobility & Recovery', duration: '15 min', level: 'Beginner', thumbnail: 'https://picsum.photos/seed/fmf1/800/450', description: 'Wake up your joints and nervous system.', benefits: ['Improved mobility', 'Mental clarity', 'Joint health'], sourceType: 'youtube', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isPremium: false },
  { id: 'v2', title: 'Full Body Power', category: 'Full Body Workouts', duration: '45 min', level: 'Advanced', thumbnail: 'https://picsum.photos/seed/fmf2/800/450', description: 'High-intensity calisthenics for total strength.', benefits: ['Strength gains', 'Fat loss', 'Endurance'], sourceType: 'youtube', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isPremium: true },
  { id: 'v3', title: 'Core Strength Series', category: 'Core Strength', duration: '20 min', level: 'Intermediate', thumbnail: 'https://picsum.photos/seed/fmf3/800/450', description: 'Build a rock-solid foundation.', benefits: ['Postural support', 'Core stability', 'Power transfer'], sourceType: 'youtube', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isPremium: true },
  { id: 'v4', title: 'Mobility Flow', category: 'Mobility & Recovery', duration: '30 min', level: 'Beginner', thumbnail: 'https://picsum.photos/seed/fmf4/800/450', description: 'Fluid movements to restore range of motion.', benefits: ['Injury prevention', 'Flexibility', 'Recovery'], sourceType: 'youtube', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isPremium: false },
  { id: 'v5', title: 'Handstand Foundations', category: 'Advanced Training', duration: '40 min', level: 'Advanced', thumbnail: 'https://picsum.photos/seed/fmf5/800/450', description: 'Master the art of balance.', benefits: ['Shoulder strength', 'Balance', 'Focus'], sourceType: 'youtube', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isPremium: true },
  { id: 'v6', title: 'Pull-up Progression', category: 'Intermediate Training', duration: '25 min', level: 'Intermediate', thumbnail: 'https://picsum.photos/seed/fmf6/800/450', description: 'From zero to muscle-up.', benefits: ['Back strength', 'Grip strength', 'Pulling power'], sourceType: 'youtube', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isPremium: true },
];

const PRODUCTS: Product[] = [
  { id: 'p1', title: 'FMF Training Shirt', price: 45, category: 'Apparel', collection: 'FMF Training Collection', image: 'https://picsum.photos/seed/fmfp1/600/800' },
  { id: 'p2', title: 'Performance Shorts', price: 55, category: 'Apparel', collection: 'FMF Training Collection', image: 'https://picsum.photos/seed/fmfp2/600/800' },
  { id: 'p3', title: 'FMF Signature Hoodie', price: 85, category: 'Apparel', collection: 'FMF Lifestyle Collection', image: 'https://picsum.photos/seed/fmfp3/600/800' },
  { id: 'p4', title: 'Pro Workout Mat', price: 120, category: 'Gear', collection: 'FMF Training Collection', image: 'https://picsum.photos/seed/fmfp4/600/800' },
  { id: 'p5', title: 'Resistance Band Set', price: 35, category: 'Gear', collection: 'FMF Training Collection', image: 'https://picsum.photos/seed/fmfp5/600/800' },
  { id: 'p6', title: 'FMF Training Cap', price: 30, category: 'Accessories', collection: 'FMF Lifestyle Collection', image: 'https://picsum.photos/seed/fmfp6/600/800' },
  { id: 'p7', title: 'Sorority Training Set', price: 95, category: 'Apparel', collection: 'FMF x Sorority Collection', image: 'https://picsum.photos/seed/sor1/600/800' },
  { id: 'p8', title: 'Sorority Performance Top', price: 48, category: 'Apparel', collection: 'FMF x Sorority Collection', image: 'https://picsum.photos/seed/sor2/600/800' },
  { id: 'p9', title: 'Pier St Barth Swim Trunks', price: 110, category: 'Apparel', collection: 'Pier St Barth Collection', image: 'https://picsum.photos/seed/psb1/600/800' },
  { id: 'p10', title: 'Pier St Barth Resort Shirt', price: 145, category: 'Apparel', collection: 'Pier St Barth Collection', image: 'https://picsum.photos/seed/psb2/600/800' },
  { id: 'p11', title: 'CLÉ Paris Signature Scent', price: 185, category: 'Fragrance', collection: 'CLÉ Paris Collection', image: 'https://picsum.photos/seed/cle1/600/800' },
  { id: 'p12', title: 'CLÉ Paris Lifestyle Candle', price: 75, category: 'Lifestyle', collection: 'CLÉ Paris Collection', image: 'https://picsum.photos/seed/cle2/600/800' },
];

const COLLABORATIONS: CollaborationBrand[] = [
  { 
    id: 'c1', 
    name: 'SORORITY', 
    category: 'Women’s Fitness Lifestyle', 
    description: 'Exclusive women-focused brand dedicated to empowerment through fitness, confidence, and community. Strength, femininity, and performance.',
    image: 'https://picsum.photos/seed/sorority/800/600',
    link: '/store',
    buttonText: 'View Collection'
  },
  { 
    id: 'c2', 
    name: 'FLEX MOB 305', 
    category: 'Recovery & Mobility', 
    description: 'Specializing in professional assisted stretching and muscle recovery designed to support athletes and optimize performance.',
    image: 'https://picsum.photos/seed/flexmob/800/600',
    link: '/recovery',
    buttonText: 'Learn More'
  },
  { 
    id: 'c3', 
    name: 'PIER ST BARTH', 
    category: 'Luxury Resort Fitness', 
    description: 'Luxury resort-inspired fitness and swimwear brand blending beach aesthetics with fitness culture and premium performance.',
    image: 'https://picsum.photos/seed/pierstbarth/800/600',
    link: '/store',
    buttonText: 'View Collection'
  },
  { 
    id: 'c4', 
    name: 'CLÉ PARIS', 
    category: 'Luxury Fragrance & Lifestyle', 
    description: 'Represents the elegance and sophistication of the FMF lifestyle. Luxury, confidence, and personal presence for the refined athlete.',
    image: 'https://picsum.photos/seed/cleparis/800/600',
    link: '/store',
    buttonText: 'Explore Brand'
  }
];

const SESSIONS: TrainingSession[] = [
  { id: 's1', title: 'Sunrise Calisthenics', time: '06:00 AM', trainer: 'Alex Rivera', spots: 5, type: 'Beach Training' },
  { id: 's2', title: 'Power Hour Intensity', time: '09:00 AM', trainer: 'Sarah Chen', spots: 2, type: 'Strength' },
  { id: 's3', title: 'Mobility & Flow', time: '11:00 AM', trainer: 'Marcus Thorne', spots: 10, type: 'Recovery' },
  { id: 's4', title: 'Sunset Core Blast', time: '05:30 PM', trainer: 'Alex Rivera', spots: 8, type: 'Mindset & Core' },
];

const RETREATS: Retreat[] = [
  { 
    id: 'r1', 
    title: 'Miami Beach Immersion', 
    location: 'Miami Beach, FL', 
    date: 'June 15-20, 2026', 
    price: '$2,499', 
    image: 'https://picsum.photos/seed/fmfr1/1200/600', 
    description: 'Our exclusive flagship experience. Miami Beach is currently our only retreat location, focusing on high-intensity calisthenics, mindset workshops, and luxury wellness on the Florida coast.' 
  },
];

// --- Auth Context ---

interface AuthContextType {
  user: UserProfile | null;
  notifications: Notification[];
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, tier: string) => Promise<void>;
  logout: () => void;
  updateTier: (tier: string) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  toggleFavorite: (videoId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          } else {
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        });

        // Listen for notifications
        const notifsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', firebaseUser.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const unsubNotifs = onSnapshot(notifsQuery, (snap) => {
          const notifs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
          setNotifications(notifs);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'notifications');
        });

        return () => {
          unsubDoc();
          unsubNotifs();
        };
      } else {
        setUser(null);
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, tier: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, 'temporaryPassword123!'); // In a real app, user provides password
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, { displayName: name });

      const newUser: UserProfile = {
        id: firebaseUser.uid,
        name,
        email,
        tier,
        joinedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateTier = async (tier: string) => {
    if (user && auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { tier });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  const addNotification = async (notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      // Don't notify yourself
      if (notif.userId === auth.currentUser?.uid) return;

      await addDoc(collection(db, 'notifications'), {
        ...notif,
        createdAt: new Date().toISOString(),
        isRead: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const clearNotifications = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', auth.currentUser.uid), where('isRead', '==', false));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications');
    }
  };

  const toggleFavorite = async (videoId: string) => {
    if (!user || !auth.currentUser) return;
    try {
      const currentFavorites = user.favorites || [];
      const isFavorited = currentFavorites.includes(videoId);
      const newFavorites = isFavorited 
        ? currentFavorites.filter(id => id !== videoId)
        : [...currentFavorites, videoId];
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { favorites: newFavorites });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black">
        <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      notifications, 
      login, 
      signup, 
      logout, 
      updateTier, 
      addNotification, 
      markAsRead, 
      clearNotifications,
      toggleFavorite
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Components ---

interface Athlete {
  id: string;
  name: string;
  role: string;
  philosophy: string;
  image: string;
  social: {
    instagram: string;
    twitter: string;
  };
}

const ATHLETES: Athlete[] = [
  {
    id: 'a1',
    name: 'Michael Leggett',
    role: 'Head Trainer / Founder',
    philosophy: 'Master your body, master your mind. Discipline is the only shortcut.',
    image: 'https://picsum.photos/seed/trainer-ml/800/1000',
    social: { instagram: '@michael_fmf', twitter: '@mleggett' }
  },
  {
    id: 'a2',
    name: 'Sarah "Zen" Chen',
    role: 'Mobility & Flow Specialist',
    philosophy: 'Strength without mobility is a cage. True power is fluid.',
    image: 'https://picsum.photos/seed/athlete-sarah/800/1000',
    social: { instagram: '@sarah_zen', twitter: '@sarahchen' }
  },
  {
    id: 'a3',
    name: 'Marcus Thorne',
    role: 'Elite Calisthenics Athlete',
    philosophy: 'Gravity is just a suggestion. Your will is the only law.',
    image: 'https://picsum.photos/seed/athlete-marcus/800/1000',
    social: { instagram: '@marcus_cali', twitter: '@mthorne' }
  }
];

const NotificationBell = () => {
  const { notifications, markAsRead, clearNotifications } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-teal"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand-coral text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-brand-black">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 card-gradient border border-white/10 z-50 overflow-hidden shadow-2xl shadow-black/50"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => clearNotifications()}
                    className="text-[8px] uppercase tracking-widest text-brand-teal hover:text-white transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Bell size={24} className="mx-auto text-white/10" />
                    <p className="text-[10px] uppercase tracking-widest text-white/20">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        // In a real app, navigate to the post
                      }}
                      className={`p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${!notif.isRead ? 'bg-brand-teal/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${notif.type === 'like' ? 'bg-brand-coral/20 text-brand-coral' : 'bg-brand-teal/20 text-brand-teal'}`}>
                          {notif.fromUserName.charAt(0)}
                        </div>
                        <div className="flex-grow space-y-1">
                          <p className="text-[11px] text-white/80 leading-tight">
                            <span className="font-bold text-white">{notif.fromUserName}</span> {notif.type === 'like' ? 'liked' : 'commented on'} your post:
                          </p>
                          <p className="text-[10px] text-white/40 italic truncate max-w-[180px]">"{notif.postContent}"</p>
                          <p className="text-[8px] text-white/20 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Program', path: '/program' },
    { name: 'Videos', path: '/videos' },
    { name: 'Athletes', path: '/athletes' },
    { name: 'Membership', path: '/membership' },
    { name: 'Community', path: '/community' },
    { name: 'Store', path: '/store' },
    { name: 'Retreats', path: '/retreats' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <span className="text-xl font-bold tracking-tighter text-brand-teal uppercase">Fitness Power Hour</span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">by Fashion meetz Fitness</span>
        </Link>

        <div className="hidden lg:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs uppercase tracking-widest transition-colors ${
                location.pathname === link.path ? 'text-brand-coral' : 'text-white/60 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-6">
          {user ? (
            <div className="hidden lg:flex items-center space-x-4">
              <NotificationBell />
              <Link to="/profile" className="flex flex-col items-end group">
                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-teal group-hover:text-white transition-colors">{user.name}</span>
                <span className="text-[8px] uppercase tracking-widest text-white/40">{user.tier}</span>
              </Link>
              <button 
                onClick={logout}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-coral"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <Link to="/membership?mode=login" className="hidden lg:flex items-center space-x-2 text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors">
              <User size={16} />
              <span>Login</span>
            </Link>
          )}
          
          <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-brand-black border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-lg uppercase tracking-widest text-white/70 hover:text-brand-coral transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-white/5">
                {user ? (
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Link 
                          to="/profile" 
                          onClick={() => setIsOpen(false)}
                          className="flex flex-col"
                        >
                          <span className="text-sm font-bold text-brand-teal uppercase tracking-widest">{user.name}</span>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">{user.tier}</span>
                        </Link>
                      </div>
                      <button 
                        onClick={() => { logout(); setIsOpen(false); }}
                        className="text-brand-coral text-xs uppercase tracking-widest"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link 
                    to="/membership?mode=login" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-brand-teal text-lg uppercase tracking-widest"
                  >
                    <User size={20} />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-brand-black border-t border-white/10 pt-24 pb-12 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
      <div className="space-y-6">
        <div className="flex flex-col leading-none">
          <span className="text-xl font-bold tracking-tighter text-brand-teal uppercase">Fitness Power Hour</span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">by Fashion meetz Fitness</span>
        </div>
        <p className="text-white/40 text-sm leading-relaxed">
          A premium calisthenics training program designed to build strength, discipline, and energy. Based in Miami, FL.
        </p>
        <div className="flex space-x-6 text-white/40">
          <Instagram size={20} className="hover:text-brand-coral cursor-pointer transition-colors" />
          <Twitter size={20} className="hover:text-brand-teal cursor-pointer transition-colors" />
          <Facebook size={20} className="hover:text-brand-ocean cursor-pointer transition-colors" />
        </div>
      </div>
      
      <div>
        <h3 className="text-white text-xs uppercase tracking-widest mb-8">Platform</h3>
        <ul className="space-y-4 text-sm text-white/40">
          <li><Link to="/program" className="hover:text-white">The Program</Link></li>
          <li><Link to="/videos" className="hover:text-white">Video Library</Link></li>
          <li><Link to="/schedule" className="hover:text-white">Class Schedule</Link></li>
          <li><Link to="/retreats" className="hover:text-white">FMF Retreats</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="text-white text-xs uppercase tracking-widest mb-8">Support</h3>
        <ul className="space-y-4 text-sm text-white/40">
          <li><Link to="/about" className="hover:text-white">Our Story</Link></li>
          <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
          <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-white">Terms of Service</a></li>
        </ul>
      </div>

      <div>
        <h3 className="text-white text-xs uppercase tracking-widest mb-8">Join the Community</h3>
        <p className="text-white/40 text-sm mb-6">Subscribe for training tips and exclusive drops.</p>
        <div className="flex border-b border-white/20 pb-2">
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            className="bg-transparent border-none text-xs tracking-widest text-white focus:outline-none w-full"
          />
          <ArrowRight size={16} className="text-brand-teal" />
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-[10px] uppercase tracking-[0.3em] text-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
      <span>© 2026 Fitness Power Hour. All Rights Reserved.</span>
      <span>Miami Beach</span>
    </div>
  </footer>
);

// --- Pages ---

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const philosophyRef = useRef(null);
  const retreatRef = useRef(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const { scrollYProgress: philosophyScroll } = useScroll({
    target: philosophyRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: retreatScroll } = useScroll({
    target: retreatRef,
    offset: ["start end", "end start"]
  });

  const heroBgY = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const heroTextY = useTransform(heroScroll, [0, 1], ["0%", "50%"]);
  const philosophyImgY = useTransform(philosophyScroll, [0, 1], ["-10%", "10%"]);
  const retreatImgY = useTransform(retreatScroll, [0, 1], ["-20%", "20%"]);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section ref={heroRef} className="relative h-[90vh] flex items-center overflow-hidden">
        <motion.div 
          style={{ y: heroBgY }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://picsum.photos/seed/fmf-hero/1920/1080"
            alt="Hero"
            className="w-full h-full object-cover opacity-50 scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/40 to-transparent" />
        </motion.div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            style={{ y: heroTextY }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-3 py-1 bg-brand-teal/20 text-brand-teal text-[10px] uppercase tracking-[0.3em] rounded-full mb-6">
              Miami Calisthenics
            </span>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter leading-none uppercase">
              Fitness <br /> <span className="text-brand-coral">Power Hour</span>
            </h1>
            <p className="text-xl text-white/60 mb-10 font-light leading-relaxed">
              Train Your Body. Train Your Mind. A premium calisthenics training program designed to build strength, discipline, and energy.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/program')} className="btn-primary">Start Training</button>
              <button onClick={() => navigate('/videos')} className="btn-outline">Explore Program</button>
              <button onClick={() => navigate('/store')} className="btn-secondary">Shop Collection</button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 right-10 hidden lg:flex flex-col items-end gap-2">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/20 rotate-90 origin-right translate-y-20">Scroll to explore</span>
          <div className="w-px h-24 bg-gradient-to-b from-brand-teal to-transparent" />
        </div>
      </section>

      {/* Philosophy Preview */}
      <section ref={philosophyRef} className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">
              The FMF <span className="text-brand-teal italic">Philosophy</span>
            </h2>
            <p className="text-white/50 text-lg font-light leading-relaxed">
              Fitness Power Hour is not just a workout program — it is a lifestyle built around discipline, movement, and personal strength. We focus on four core pillars that define the FMF way of life.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Dumbbell className="text-brand-coral" size={32} />
                <h4 className="font-bold uppercase text-sm">Discipline</h4>
                <p className="text-xs text-white/40">Consistency builds strength. Training is a daily ritual.</p>
              </div>
              <div className="space-y-2">
                <Zap className="text-brand-teal" size={32} />
                <h4 className="font-bold uppercase text-sm">Movement</h4>
                <p className="text-xs text-white/40">The body was designed to move freely and powerfully.</p>
              </div>
            </div>
          </motion.div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-brand-teal/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <motion.div
              style={{ y: philosophyImgY }}
              className="relative overflow-hidden rounded-2xl"
            >
              <img
                src="https://picsum.photos/seed/fmf-training/800/1000"
                alt="Training"
                className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-110"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Retreat Showcase */}
      <section ref={retreatRef} className="py-32 px-6 bg-brand-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 relative">
              <motion.div
                style={{ y: retreatImgY }}
                className="relative z-10 rounded-3xl overflow-hidden aspect-[4/5]"
              >
                <img 
                  src="https://picsum.photos/seed/fmf-retreat-home/800/1000" 
                  alt="Retreat Experience" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-coral/10 blur-3xl rounded-full" />
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 space-y-8"
            >
              <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">Exclusive Experiences</span>
              <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none">
                The <span className="text-brand-teal italic">Retreat</span> <br /> Immersion
              </h2>
              <p className="text-white/50 text-lg font-light leading-relaxed">
                Step away from the noise and immerse yourself in a high-performance environment. Miami Beach is currently our exclusive retreat location, designed to reset your physical and mental state through intensive training and luxury wellness.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-white/80">
                  <div className="w-8 h-8 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal">
                    <MapPin size={16} />
                  </div>
                  <span className="text-sm uppercase tracking-widest">Miami Beach</span>
                </div>
                <div className="flex items-center gap-4 text-white/80">
                  <div className="w-8 h-8 rounded-full bg-brand-coral/20 flex items-center justify-center text-brand-coral">
                    <Star size={16} />
                  </div>
                  <span className="text-sm uppercase tracking-widest">Luxury Wellness & Training</span>
                </div>
              </div>
              <button onClick={() => navigate('/retreats')} className="btn-primary">Explore Retreats</button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Preview */}
      <section className="py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-bold uppercase tracking-tighter mb-4">Training Library</h2>
              <p className="text-white/40 uppercase tracking-widest text-xs">Guided Sessions for every level</p>
            </div>
            <Link to="/videos" className="text-brand-teal flex items-center gap-2 text-xs uppercase tracking-widest hover:gap-4 transition-all">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {VIDEOS.slice(0, 3).map((video) => (
              <motion.div
                key={video.id}
                whileHover={{ y: -10 }}
                className="card-gradient overflow-hidden group cursor-pointer"
              >
                <div className="relative aspect-video">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-brand-teal rounded-full flex items-center justify-center shadow-2xl">
                      <Play fill="white" size={24} className="translate-x-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-widest rounded">{video.duration}</span>
                    <span className="px-2 py-1 bg-brand-coral/80 backdrop-blur-md text-[10px] uppercase tracking-widest rounded">{video.level}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold uppercase mb-2 group-hover:text-brand-teal transition-colors">{video.title}</h3>
                  <p className="text-white/40 text-sm line-clamp-2">{video.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FMF Ecosystem */}
      <section className="py-32 px-6 bg-brand-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">The Network</span>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">The FMF <span className="text-brand-coral">Ecosystem</span></h2>
            <p className="text-white/40 max-w-2xl mx-auto text-sm uppercase tracking-widest">A synergy of training, recovery, and luxury lifestyle.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {COLLABORATIONS.map((collab) => (
              <motion.div
                key={collab.id}
                whileHover={{ y: -10 }}
                className="card-gradient p-8 space-y-6 group cursor-pointer"
                onClick={() => navigate(collab.link)}
              >
                <div className="aspect-video overflow-hidden rounded-xl">
                  <img src={collab.image} alt={collab.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-widest text-brand-teal">{collab.category}</span>
                  <h3 className="text-2xl font-bold uppercase tracking-tighter">{collab.name}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{collab.description}</p>
                  <button className="text-brand-coral text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                    {collab.buttonText} <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-32 px-6 bg-brand-black border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <Quote className="text-brand-teal mx-auto opacity-20" size={64} />
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-light italic leading-tight text-white/80"
          >
            "Discipline is the bridge between goals and accomplishment. Fitness Power Hour is where that bridge is built."
          </motion.h2>
          <div className="space-y-2">
            <div className="text-brand-coral font-bold uppercase tracking-[0.3em] text-sm">Alex Rivera</div>
            <div className="text-white/20 text-[10px] uppercase tracking-[0.5em]">Founder, FMF</div>
          </div>
        </div>
      </section>

      {/* FMF Ecosystem / Collaborations */}
      <section className="py-32 px-6 bg-brand-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-6">
            <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">The Brand Ecosystem</span>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">The FMF <span className="text-brand-teal">Ecosystem</span></h2>
            <p className="text-white/40 uppercase tracking-[0.3em] text-xs max-w-2xl mx-auto leading-relaxed">
              Fashion meetz Fitness brings together brands that represent strength, recovery, lifestyle, and elegance. Together they form a complete ecosystem designed for people who live with discipline, movement, and intention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {COLLABORATIONS.map((brand) => (
              <motion.div
                key={brand.id}
                whileHover={{ y: -10 }}
                className="card-gradient overflow-hidden group flex flex-col h-full"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={brand.image} 
                    alt={brand.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-brand-black/60 backdrop-blur-md text-[9px] uppercase tracking-widest px-2 py-1 rounded">{brand.category}</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow space-y-4">
                  <h3 className="text-2xl font-bold uppercase tracking-tighter group-hover:text-brand-teal transition-colors">{brand.name}</h3>
                  <p className="text-white/40 text-[11px] leading-relaxed flex-grow">{brand.description}</p>
                  <button 
                    onClick={() => navigate(brand.link)}
                    className="w-full py-4 border border-white/10 text-[10px] uppercase tracking-widest hover:bg-white hover:text-brand-black transition-all"
                  >
                    {brand.buttonText}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const PhilosophySection = () => {
  const pillars = [
    { title: 'Discipline', desc: 'Consistency builds strength.', icon: <Dumbbell size={24} /> },
    { title: 'Movement', desc: 'The body was designed to move freely.', icon: <Zap size={24} /> },
    { title: 'Energy', desc: 'Training fuels the mind and body.', icon: <Heart size={24} /> },
    { title: 'Lifestyle', desc: 'Fitness becomes part of how you live.', icon: <Star size={24} /> },
  ];

  return (
    <section className="py-32 px-6 bg-brand-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">The Manifesto</span>
            <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none">
              The FMF <br /> <span className="text-brand-teal italic">Philosophy</span>
            </h2>
            <div className="space-y-6 text-white/60 text-lg font-light leading-relaxed">
              <p>
                Fitness Power Hour is not just a workout program — it is a lifestyle built around discipline, movement, and personal strength.
              </p>
              <p>
                We believe that training is a daily ritual that strengthens both the body and the mind. It is the ultimate expression of self-respect and the foundation of a high-performance life.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
              {pillars.map((pillar, i) => (
                <div key={i} className="space-y-4 p-6 border border-white/5 bg-white/5 rounded-2xl hover:border-brand-teal/30 transition-colors group">
                  <div className="text-brand-teal group-hover:scale-110 transition-transform duration-300">
                    {pillar.icon}
                  </div>
                  <h4 className="text-xl font-bold uppercase tracking-tighter">{pillar.title}</h4>
                  <p className="text-sm text-white/40 leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative z-10 rounded-3xl overflow-hidden aspect-[4/5]"
            >
              <img 
                src="https://picsum.photos/seed/fmf-philosophy/800/1000" 
                alt="FMF Philosophy" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-teal/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-brand-coral/10 blur-3xl rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

const TrainerSection = () => {
  return (
    <section className="py-32 px-6 bg-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 relative">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative z-10 rounded-3xl overflow-hidden aspect-[4/5]"
            >
              <img 
                src="https://picsum.photos/seed/michael-leggett/800/1000" 
                alt="Michael Leggett" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 border-2 border-brand-teal/20 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-40 h-40 border border-brand-coral/20 rounded-full" />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 space-y-8"
          >
            <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">The Architect</span>
            <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none">
              Meet the <br /> <span className="text-brand-coral italic">Trainer</span>
            </h2>
            <div className="space-y-6 text-white/60 text-lg font-light leading-relaxed">
              <p className="text-white font-medium">Michael Leggett</p>
              <p>
                With over 20 years of training experience, Michael Leggett is the architect of the Fitness Power Hour program. His journey began as a street athlete, mastering the raw strength of calisthenics in urban environments.
              </p>
              <p>
                Today, he is a global authority in functional training and bodyweight mastery. Fitness Power Hour was created after years of studying how the body develops strength through movement, focusing on the intersection of physical capability and mental discipline.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 border-l border-brand-teal/30">
                <p className="text-2xl font-bold text-white">20+</p>
                <p className="text-[10px] uppercase tracking-widest text-white/40">Years Experience</p>
              </div>
              <div className="p-4 border-l border-brand-teal/30">
                <p className="text-2xl font-bold text-white">Global</p>
                <p className="text-[10px] uppercase tracking-widest text-white/40">Authority</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <Quote className="text-brand-coral mb-4 opacity-40" size={32} />
              <p className="text-2xl italic font-light text-white/80 leading-tight">
                “Your body is the first tool you were given. Learning how to control it changes everything.”
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/40">— Michael Leggett</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SystemSection = () => {
  const phases = [
    {
      title: 'Foundation',
      weeks: 'Weeks 1–4',
      focus: ['Mobility', 'Core Stability', 'Body Control'],
      exercises: ['Push-ups', 'Squats', 'Planks', 'Lunges'],
      goal: 'Prepare the body for more advanced training.',
      color: 'brand-teal'
    },
    {
      title: 'Power',
      weeks: 'Weeks 5–8',
      focus: ['Explosive Strength', 'Endurance', 'Conditioning'],
      exercises: ['Jump Squats', 'Pull-ups', 'Burpees', 'Core Circuits'],
      goal: 'Build athletic performance.',
      color: 'brand-coral'
    },
    {
      title: 'Mastery',
      weeks: 'Weeks 9–12',
      focus: ['Full-body Strength', 'Advanced Calisthenics', 'Mental Discipline'],
      exercises: ['Muscle-ups', 'Pistol Squats', 'Handstand Work', 'Advanced Core Training'],
      goal: 'Develop total body strength and control.',
      color: 'brand-ocean'
    }
  ];

  return (
    <section className="py-32 px-6 bg-brand-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-6">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">The Framework</span>
          <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none">
            The Fitness <br /> <span className="text-brand-teal italic">Power Hour System</span>
          </h2>
          <p className="text-white/40 text-lg font-light max-w-2xl mx-auto leading-relaxed">
            A structured 12-week training framework designed to develop strength, endurance, mobility, and discipline.
          </p>
        </div>

        {/* Visual Progression Line */}
        <div className="relative mb-32 hidden lg:block">
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2" />
          <div className="flex justify-between relative z-10">
            {phases.map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full border-4 border-brand-black bg-brand-teal shadow-[0_0_20px_rgba(45,212,191,0.5)]`} />
                <span className="mt-4 text-[10px] uppercase tracking-widest text-white/20">Milestone 0{i + 1}</span>
              </div>
            ))}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full border-4 border-brand-black bg-brand-coral" />
              <span className="mt-4 text-[10px] uppercase tracking-widest text-white/20">Transformation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {phases.map((phase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative group"
            >
              <div className="h-full p-10 border border-white/10 bg-white/5 rounded-3xl hover:border-white/20 transition-all duration-500 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className={`text-[10px] uppercase tracking-[0.3em] mb-2 text-${phase.color}`}>{phase.weeks}</p>
                    <h3 className="text-3xl font-bold uppercase tracking-tighter">Phase {i + 1}</h3>
                    <h4 className="text-lg font-light italic text-white/60">{phase.title}</h4>
                  </div>
                  <div className={`w-12 h-12 rounded-full border border-${phase.color}/30 flex items-center justify-center text-${phase.color}`}>
                    0{i + 1}
                  </div>
                </div>

                <div className="space-y-8 flex-grow">
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-white/30">Focus</p>
                    <ul className="space-y-2">
                      {phase.focus.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-white/70">
                          <div className={`w-1 h-1 rounded-full bg-${phase.color}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-white/30">Example Exercises</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.exercises.map((e, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-white/50">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">The Goal</p>
                  <p className="text-sm text-white/80 font-light italic">{phase.goal}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 p-12 rounded-3xl border border-white/5 bg-gradient-to-r from-brand-teal/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold uppercase tracking-tighter">Session Structure</h3>
            <p className="text-white/40 text-sm uppercase tracking-widest">45–60 Minutes of Focused Discipline</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['Warm-up', 'Strength', 'Conditioning', 'Cool Down'].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-brand-teal font-bold">0{i + 1}</span>
                <span className="text-xs uppercase tracking-widest text-white/60">{step}</span>
                {i < 3 && <div className="w-8 h-px bg-white/10 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Program = () => (
  <div className="pt-20">
    <header className="py-32 px-6 bg-brand-black border-b border-white/5">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em] mb-4 block">Elite Performance</span>
          <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-none">
            The <span className="text-brand-teal">Program</span>
          </h1>
          <p className="mt-8 text-xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto">
            A structured calisthenics journey designed to transform your physical capability and mental discipline.
          </p>
        </motion.div>
      </div>
    </header>

    <PhilosophySection />
    <TrainerSection />
    <SystemSection />

    <section className="py-32 px-6 bg-brand-black text-center">
      <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="text-4xl font-bold uppercase tracking-tighter">Ready to Begin?</h2>
        <p className="text-white/40 text-lg font-light">
          Join the movement and start your 12-week transformation today.
        </p>
        <div className="flex justify-center gap-4">
          <button className="btn-primary">Get Started</button>
          <Link to="/videos" className="btn-outline inline-block">View Library</Link>
        </div>
      </div>
    </section>
  </div>
);

const VideoPlayer = ({ video, onClose }: { video: Video; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-brand-black/95 backdrop-blur-xl"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
      >
        <X size={32} />
      </button>

      <div className="w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative">
        {video.sourceType === 'youtube' ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.videoUrl?.split('v=')[1]}?autoplay=1`}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : video.sourceType === 'upload' ? (
          <div className="w-full h-full flex items-center justify-center bg-brand-teal/5">
            <div className="text-center space-y-4">
              <Upload size={48} className="text-brand-teal mx-auto" />
              <p className="text-white/60 uppercase tracking-widest text-sm">Simulated Video Playback</p>
              <p className="text-white/20 text-xs">File: {video.videoUrl}</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-coral/5">
            <div className="text-center space-y-4">
              <Link2 size={48} className="text-brand-coral mx-auto" />
              <p className="text-white/60 uppercase tracking-widest text-sm">External Link Redirect</p>
              <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">Open External Link</a>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const VideoUploadModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (v: Video) => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Full Body Workouts',
    duration: '',
    level: 'Beginner' as const,
    description: '',
    sourceType: 'youtube' as const,
    videoUrl: ''
  });
  const [benefitsInput, setBenefitsInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newVideo: Video = {
      ...formData,
      id: `v-${Date.now()}`,
      thumbnail: `https://picsum.photos/seed/${Date.now()}/800/450`,
      benefits: benefitsInput ? benefitsInput.split(',').map(b => b.trim()) : ['Community Training', 'Performance', 'Discipline']
    };
    onAdd(newVideo);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-black/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-brand-black border border-white/10 p-8 rounded-3xl w-full max-w-xl space-y-8"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold uppercase tracking-tighter">Add <span className="text-brand-teal">Training Video</span></h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Video Title</label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Category</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {['Beginner Training', 'Intermediate Training', 'Advanced Training', 'Mobility & Recovery', 'Core Strength', 'Full Body Workouts'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Level</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                value={formData.level}
                onChange={e => setFormData({...formData, level: e.target.value as any})}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Duration (e.g. 20 min)</label>
              <input 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                placeholder="20 min"
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Benefits (comma separated)</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                placeholder="Strength, Mobility, Core"
                onChange={e => setBenefitsInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Description</label>
            <textarea 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors h-24 resize-none"
              placeholder="Describe the workout..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Source Type</label>
            <div className="flex gap-4">
              {['youtube', 'upload', 'link'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, sourceType: type as any})}
                  className={`flex-1 py-3 rounded-xl border text-[10px] uppercase tracking-widest transition-all ${
                    formData.sourceType === type ? 'bg-brand-teal border-brand-teal text-white' : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">
              {formData.sourceType === 'youtube' ? 'YouTube URL' : formData.sourceType === 'upload' ? 'File Name' : 'External Link'}
            </label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
              placeholder={formData.sourceType === 'youtube' ? 'https://youtube.com/watch?v=...' : ''}
              value={formData.videoUrl}
              onChange={e => setFormData({...formData, videoUrl: e.target.value})}
            />
          </div>

          <button type="submit" className="btn-primary w-full py-4">Add to Library</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const VideoLibrary = () => {
  const { user, toggleFavorite } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState('All');
  const [activeDuration, setActiveDuration] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [localVideos, setLocalVideos] = useState<Video[]>(VIDEOS);

  const categories = ['All', 'Beginner Training', 'Intermediate Training', 'Advanced Training', 'Mobility & Recovery', 'Core Strength', 'Full Body Workouts'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const durations = ['All', '< 20 min', '20-40 min', '> 40 min'];

  const isFiltered = activeCategory !== 'All' || activeLevel !== 'All' || activeDuration !== 'All' || searchQuery !== '';

  const clearFilters = () => {
    setActiveCategory('All');
    setActiveLevel('All');
    setActiveDuration('All');
    setSearchQuery('');
  };

  const filteredVideos = useMemo(() => {
    return localVideos.filter(v => {
      const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
      const matchesLevel = activeLevel === 'All' || v.level === activeLevel;
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           v.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesDuration = true;
      if (activeDuration !== 'All') {
        const mins = parseInt(v.duration);
        if (activeDuration === '< 20 min') matchesDuration = mins < 20;
        else if (activeDuration === '20-40 min') matchesDuration = mins >= 20 && mins <= 40;
        else if (activeDuration === '> 40 min') matchesDuration = mins > 40;
      }

      return matchesCategory && matchesLevel && matchesSearch && matchesDuration;
    });
  }, [activeCategory, activeLevel, activeDuration, searchQuery, localVideos]);

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <h1 className="text-5xl font-bold uppercase tracking-tighter mb-4">Video <span className="text-brand-teal">Library</span></h1>
              <p className="text-white/40 uppercase tracking-widest text-xs">Master your movement with guided sessions</p>
            </div>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] transition-all"
            >
              <Plus size={16} className="text-brand-teal" /> Add Video
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text"
                placeholder="SEARCH WORKOUTS..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-brand-teal outline-none transition-colors"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-brand-teal outline-none transition-colors appearance-none"
                value={activeLevel}
                onChange={e => setActiveLevel(e.target.value)}
              >
                {levels.map(l => <option key={l} value={l}>{l === 'All' ? 'ALL LEVELS' : l.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-brand-teal outline-none transition-colors appearance-none"
                value={activeDuration}
                onChange={e => setActiveDuration(e.target.value)}
              >
                {durations.map(d => <option key={d} value={d}>{d === 'All' ? 'ALL DURATIONS' : d}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === cat ? 'bg-brand-teal text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
            {isFiltered && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 text-brand-coral text-[10px] uppercase tracking-widest hover:underline px-4"
              >
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video) => (
              <motion.div
                layout
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`card-gradient overflow-hidden group cursor-pointer ${video.isPremium && (!user || user.tier === 'Free') ? 'opacity-80' : ''}`}
                onClick={() => {
                  if (video.isPremium && (!user || user.tier === 'Free')) {
                    // Redirect to membership or show upgrade message
                    window.location.hash = '#/membership';
                    return;
                  }
                  setSelectedVideo(video);
                }}
              >
                <div className="relative aspect-video">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {video.isPremium && (!user || user.tier === 'Free') ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-brand-black/80 rounded-full flex items-center justify-center shadow-2xl border border-brand-coral/50">
                          <Zap size={20} className="text-brand-coral" />
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-brand-coral font-bold bg-brand-black/80 px-2 py-1 rounded">Unlock with Premium</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-brand-teal/80 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform shadow-2xl">
                        <Play fill="white" size={20} className="translate-x-0.5" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(video.id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-all ${
                        user?.favorites?.includes(video.id) 
                          ? 'bg-brand-coral text-white' 
                          : 'bg-black/60 text-white/60 hover:text-white hover:bg-black/80'
                      }`}
                    >
                      <Heart size={14} className={user?.favorites?.includes(video.id) ? 'fill-white' : ''} />
                    </button>
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase tracking-widest flex items-center gap-2">
                      {video.isPremium && <Zap size={10} className="text-brand-coral" />}
                      {video.sourceType === 'youtube' && <Youtube size={12} className="text-red-500" />}
                      {video.sourceType === 'upload' && <Upload size={12} className="text-brand-teal" />}
                      {video.sourceType === 'link' && <ExternalLink size={12} className="text-brand-coral" />}
                      {video.duration}
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold uppercase leading-tight group-hover:text-brand-teal transition-colors">{video.title}</h3>
                    <span className="text-[10px] text-brand-coral uppercase tracking-widest border border-brand-coral/20 px-2 py-0.5 rounded">{video.level}</span>
                  </div>
                  <p className="text-white/40 text-sm line-clamp-2">{video.description}</p>
                  <div className="pt-4 border-t border-white/5">
                    <h4 className="text-[10px] uppercase tracking-widest text-white/20 mb-2">Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {video.benefits.map((b, i) => (
                        <span key={i} className="text-[9px] text-brand-teal uppercase tracking-widest bg-brand-teal/10 px-2 py-1 rounded-full">{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredVideos.length === 0 && (
          <div className="py-32 text-center space-y-4">
            <Search size={48} className="text-white/10 mx-auto" />
            <p className="text-white/40 uppercase tracking-widest text-sm">No videos found matching your criteria.</p>
            <button onClick={() => { setActiveCategory('All'); setActiveLevel('All'); setActiveDuration('All'); setSearchQuery(''); }} className="text-brand-teal text-xs uppercase tracking-widest hover:underline">Clear all filters</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedVideo && <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
        {isUploadModalOpen && <VideoUploadModal onClose={() => setIsUploadModalOpen(false)} onAdd={(v) => setLocalVideos([v, ...localVideos])} />}
      </AnimatePresence>
    </div>
  );
};

const Schedule = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingSession, setBookingSession] = useState<TrainingSession | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All');
  const [bookedSessionIds, setBookedSessionIds] = useState<string[]>([]);
  const [showMyBookings, setShowMyBookings] = useState(false);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const totalDays = daysInMonth(currentYear, currentMonth);
  const startDay = firstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  const goToToday = () => setSelectedDate(new Date());

  const handleBooking = (session: TrainingSession) => {
    if (bookedSessionIds.includes(session.id)) return;
    setBookingSession(session);
    setIsBooked(false);
    setIsSending(false);
  };

  const confirmBooking = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsSending(true);
    
    // Simulate API call and email sending
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (bookingSession) {
      setBookedSessionIds(prev => [...prev, bookingSession.id]);
      showToast(`Booking confirmed! Email sent to ${userEmail}`);
    }
    
    setIsSending(false);
    setIsBooked(true);
    
    setTimeout(() => {
      setBookingSession(null);
      setIsBooked(false);
    }, 3000);
  };

  const filteredSessions = SESSIONS.filter(s => {
    const matchesCategory = activeFilter === 'All' || s.type.includes(activeFilter) || s.trainer.includes(activeFilter);
    const hour = parseInt(s.time.split(':')[0]);
    const isPM = s.time.includes('PM');
    const actualHour = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
    
    let matchesTime = true;
    if (timeFilter === 'Morning') matchesTime = actualHour < 12;
    if (timeFilter === 'Afternoon') matchesTime = actualHour >= 12 && actualHour < 17;
    if (timeFilter === 'Evening') matchesTime = actualHour >= 17;

    return matchesCategory && matchesTime;
  });

  const bookedSessions = SESSIONS.filter(s => bookedSessionIds.includes(s.id));

  const filterOptions = ['All', 'Strength', 'Recovery', 'Beach Training', 'Mindset'];
  const timeOptions = ['All', 'Morning', 'Afternoon', 'Evening'];

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center space-y-4">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Training Schedule</span>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Reserve Your <span className="text-brand-coral">Spot</span></h1>
          <p className="text-white/40 uppercase tracking-widest text-xs max-w-xl mx-auto leading-relaxed">
            Join the elite collective in Miami. Select a date and book your session in the FMF Power Hour system.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Visual Calendar */}
          <div className="lg:col-span-5 space-y-8">
            <div className="card-gradient p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold uppercase tracking-tighter">
                    {selectedDate.toLocaleString('default', { month: 'long' })} <span className="text-brand-teal">{currentYear}</span>
                  </h2>
                  <button 
                    onClick={goToToday}
                    className="text-[10px] uppercase tracking-widest text-brand-teal hover:text-brand-coral transition-colors"
                  >
                    Go to Today
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                  <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ChevronRight size={20} /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-[10px] font-bold text-white/20 uppercase tracking-widest py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: totalDays }).map((_, i) => {
                  const day = i + 1;
                  const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
                  const isSelected = selectedDate.getDate() === day;
                  // Simulate some days having classes
                  const classCount = day % 2 === 0 ? 3 : (day % 3 === 0 ? 2 : 0);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                      className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all relative group ${
                        isSelected 
                          ? 'bg-brand-teal text-black' 
                          : 'hover:bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      <span>{day}</span>
                      {classCount > 0 && !isSelected && (
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: classCount }).map((_, idx) => (
                            <div key={idx} className="w-1 h-1 bg-brand-teal/40 rounded-full" />
                          ))}
                        </div>
                      )}
                      {isToday && !isSelected && (
                        <div className="absolute top-2 right-2 w-1 h-1 bg-brand-coral rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card-gradient p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-teal">Category</h3>
                  {bookedSessionIds.length > 0 && (
                    <button 
                      onClick={() => setShowMyBookings(!showMyBookings)}
                      className="text-[10px] uppercase tracking-widest text-brand-coral hover:underline"
                    >
                      {showMyBookings ? 'Show All' : `My Bookings (${bookedSessionIds.length})`}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setActiveFilter(option);
                        setShowMyBookings(false);
                      }}
                      className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all ${
                        activeFilter === option && !showMyBookings
                          ? 'bg-brand-teal text-black font-bold' 
                          : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-teal">Time of Day</h3>
                <div className="flex flex-wrap gap-2">
                  {timeOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => setTimeFilter(option)}
                      className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all ${
                        timeFilter === option 
                          ? 'bg-brand-teal text-black font-bold' 
                          : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-gradient p-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-teal">Location Details</h3>
              <div className="flex items-start gap-4">
                <MapPin className="text-brand-coral mt-1" size={18} />
                <div>
                  <p className="text-sm font-bold uppercase tracking-tight">FMF Training Lab Miami</p>
                  <p className="text-xs text-white/40 leading-relaxed">123 Ocean Drive, South Beach, Miami, FL 33139</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold uppercase tracking-tighter">
                {showMyBookings ? 'My' : 'Available'} <span className="text-brand-coral">Sessions</span>
              </h2>
              <span className="text-[10px] uppercase tracking-widest text-white/40">
                {showMyBookings ? 'Your Reserved Spots' : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="space-y-4">
              {(showMyBookings ? bookedSessions : filteredSessions).length > 0 ? (
                (showMyBookings ? bookedSessions : filteredSessions).map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`card-gradient p-6 flex flex-col sm:flex-row justify-between items-center gap-6 group transition-all ${
                      bookedSessionIds.includes(session.id) ? 'border-brand-teal/40 bg-brand-teal/5' : 'hover:border-brand-teal/30'
                    }`}
                  >
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                      <div className="text-center sm:text-left min-w-[80px]">
                        <div className="text-xl font-bold text-brand-teal">{session.time}</div>
                        <div className="text-[9px] uppercase tracking-widest text-white/20">60 Min</div>
                      </div>
                      <div className="h-10 w-px bg-white/10 hidden sm:block" />
                      <div>
                        <h3 className="text-lg font-bold uppercase tracking-tight mb-1">{session.title}</h3>
                        <div className="flex flex-wrap gap-4 text-[10px] text-white/40 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><User size={12} className="text-brand-coral" /> {session.trainer}</span>
                          <span className="flex items-center gap-1.5"><Zap size={12} className="text-brand-teal" /> {session.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right space-y-2">
                        <div className="text-xs font-bold text-brand-coral">
                          {bookedSessionIds.includes(session.id) ? (
                            <span className="flex items-center gap-1 justify-end"><Check size={12} /> Reserved</span>
                          ) : (
                            `${session.spots} spots left`
                          )}
                        </div>
                        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden ml-auto">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((20 - session.spots) / 20) * 100}%` }}
                            className="h-full bg-brand-teal"
                          />
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-white/20">Limited Capacity</div>
                      </div>
                      {!bookedSessionIds.includes(session.id) ? (
                        <button 
                          onClick={() => handleBooking(session)}
                          className="btn-primary py-3 px-6 text-[10px]"
                        >
                          Book Now
                        </button>
                      ) : (
                        <div className="py-3 px-6 text-[10px] uppercase tracking-widest font-bold text-brand-teal border border-brand-teal/20 rounded-xl">
                          Confirmed
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="card-gradient p-12 text-center">
                  <p className="text-white/40 uppercase tracking-widest text-xs">
                    {showMyBookings ? "You haven't booked any sessions yet." : "No sessions found for this filter."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingSession && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingSession(null)}
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card-gradient p-12 max-w-md w-full relative z-10 space-y-8 text-center"
            >
              {isBooked ? (
                <div className="space-y-6 py-8">
                  <div className="w-20 h-20 bg-brand-teal rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(45,212,191,0.3)]">
                    <Check size={40} className="text-black" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold uppercase tracking-tighter">Session <span className="text-brand-teal">Booked</span></h2>
                    <p className="text-white/40 text-sm uppercase tracking-widest">Confirmation email sent to</p>
                    <p className="text-brand-teal text-xs font-bold">{userEmail}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Confirm Booking</span>
                    <h2 className="text-3xl font-bold uppercase tracking-tighter">Reserve Your <span className="text-brand-coral">Spot</span></h2>
                  </div>
                  
                  <div className="bg-white/5 p-6 rounded-2xl space-y-4 text-left">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">Session</span>
                      <span className="text-sm font-bold uppercase">{bookingSession.title}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">Date</span>
                      <span className="text-sm font-bold uppercase">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">Time</span>
                      <span className="text-sm font-bold uppercase text-brand-teal">{bookingSession.time}</span>
                    </div>
                    <div className="pt-2 space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Your Email Address</label>
                      <input 
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="fashionmeetzfitness@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setBookingSession(null)}
                      disabled={isSending}
                      className="flex-1 py-4 border border-white/10 text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all rounded-xl disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmBooking}
                      disabled={isSending}
                      className="flex-1 btn-primary py-4 text-[10px] rounded-xl flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Store = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [activeCollection, setActiveCollection] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const isMember = user && user.tier !== 'Free';
  const discount = 0.3; // 30% discount for members

  const tabs = ['All', 'Apparel', 'Gear', 'Accessories', 'Fragrance', 'Lifestyle'];
  const collections = ['All', 'FMF Training Collection', 'FMF Lifestyle Collection', 'FMF x Sorority Collection', 'Pier St Barth Collection', 'CLÉ Paris Collection'];

  const filteredProducts = useMemo(() => {
    let filtered = PRODUCTS;
    if (activeTab !== 'All') {
      filtered = filtered.filter(p => p.category === activeTab);
    }
    if (activeCollection !== 'All') {
      filtered = filtered.filter(p => p.collection === activeCollection);
    }
    return filtered;
  }, [activeTab, activeCollection]);

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <h1 className="text-5xl font-bold uppercase tracking-tighter mb-4">FMF <span className="text-brand-teal">Store</span></h1>
            <p className="text-white/40 uppercase tracking-widest text-xs">Premium Training Gear & Collaborations</p>
          </div>
          <div className="flex flex-col items-end gap-6 w-full lg:w-auto">
            {!isMember && (
              <Link to="/membership" className="w-full flex items-center justify-between gap-6 p-4 bg-brand-teal/10 border border-brand-teal/20 rounded-xl group hover:bg-brand-teal/20 transition-all mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-teal rounded-full flex items-center justify-center text-black">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">Unlock 30% Member Discount</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/40">Join the Power Hour Collective</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-brand-teal/30 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-black transition-all">
                  <ArrowRight size={14} />
                </div>
              </Link>
            )}
            <div className="flex flex-wrap justify-end gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] uppercase tracking-widest pb-2 border-b-2 transition-all ${
                    activeTab === tab ? 'border-brand-teal text-white' : 'border-transparent text-white/40 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              {collections.map((col) => (
                <button
                  key={col}
                  onClick={() => setActiveCollection(col)}
                  className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest transition-all ${
                    activeCollection === col ? 'bg-brand-teal text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              className="group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-6">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-brand-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white text-brand-black px-8 py-4 rounded-full flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all font-bold text-[10px] uppercase tracking-widest shadow-2xl">
                    <ShoppingBag size={16} />
                    Quick View
                  </button>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-brand-black/60 backdrop-blur-md text-[9px] uppercase tracking-widest px-2 py-1 rounded">{product.collection}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-tight group-hover:text-brand-teal transition-colors">{product.title}</h3>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Retail Price</div>
                    <span className={`text-sm font-bold ${isMember ? 'line-through text-white/20' : 'text-white/60'}`}>${product.price}</span>
                  </div>
                </div>
                
                {isMember && (
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <div className="text-[10px] text-brand-teal uppercase tracking-widest font-bold">Member Price</div>
                    <span className="text-xl font-bold text-brand-teal">${Math.floor(product.price * (1 - discount))}</span>
                  </div>
                )}
                
                <p className="text-[8px] text-white/30 uppercase tracking-wider leading-tight mt-2">
                  Power Hour Members receive preferred pricing across the entire Fashion Meets Fitness ecosystem.
                </p>

                {!isMember && (
                  <Link to="/membership" className="mt-4 w-full py-3 border border-brand-teal/30 text-brand-teal text-[9px] uppercase tracking-widest font-bold text-center hover:bg-brand-teal hover:text-black transition-all">
                    Join Power Hour for Member Pricing
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Product Detail Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="absolute inset-0 bg-brand-black/90 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl card-gradient overflow-hidden flex flex-col md:flex-row"
              >
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-auto">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.title} 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center space-y-8">
                  <div className="space-y-4">
                    <span className="text-brand-teal text-[10px] uppercase tracking-[0.4em] font-bold">{selectedProduct.collection}</span>
                    <h2 className="text-4xl font-bold uppercase tracking-tighter leading-none">{selectedProduct.title}</h2>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{selectedProduct.category}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Retail Price</p>
                        <p className={`text-2xl font-bold ${isMember ? 'line-through text-white/20' : 'text-white'}`}>${selectedProduct.price}</p>
                      </div>
                      {isMember && (
                        <div className="text-right">
                          <p className="text-[10px] text-brand-teal uppercase tracking-widest font-bold mb-1">Member Price</p>
                          <p className="text-4xl font-bold text-brand-teal">${Math.floor(selectedProduct.price * (1 - discount))}</p>
                        </div>
                      )}
                    </div>
                    {!isMember && (
                      <Link to="/membership" className="flex items-center gap-2 text-brand-coral text-[10px] uppercase tracking-widest font-bold hover:underline">
                        <Zap size={12} /> Join Power Hour for 30% off
                      </Link>
                    )}
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <button 
                      onClick={() => {
                        setIsAddingToCart(true);
                        setTimeout(() => {
                          setIsAddingToCart(false);
                          setSelectedProduct(null);
                        }, 1500);
                      }}
                      disabled={isAddingToCart}
                      className="w-full bg-white text-brand-black py-6 rounded-full font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand-teal transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                    >
                      {isAddingToCart ? (
                        <>Adding to Cart...</>
                      ) : (
                        <>
                          <ShoppingBag size={18} />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button className="w-full border border-white/10 py-6 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all">
                      Buy It Now
                    </button>
                  </div>

                  <p className="text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
                    Free shipping on orders over $150. Power Hour Members receive priority fulfillment and exclusive packaging.
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Member Privileges Section */}
        <section className="mt-40 py-24 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Exclusive Access</span>
                <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter leading-none">
                  Power Hour <br /> <span className="text-brand-coral">Member Privileges</span>
                </h2>
                <p className="text-white/40 text-lg font-light leading-relaxed">
                  Power Hour Members receive preferred pricing and exclusive access across the Fashion Meets Fitness platform. We’ve built an inner circle for those dedicated to the lifestyle.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Training Platform', desc: 'Full access to the Fitness Power Hour training platform' },
                  { title: 'Video Library', desc: 'Complete workout video library with 100+ sessions' },
                  { title: 'Structured Programs', desc: 'Expertly designed training programs for all levels' },
                  { title: 'Training Calendar', desc: 'Personalized scheduling and progress tracking' },
                  { title: '30% Store Discount', desc: 'Preferred pricing across the entire FMF store' },
                  { title: 'Early Access', desc: 'First access to new product drops and limited editions' },
                  { title: 'Priority Retreats', desc: 'Priority booking for FMF Retreat experiences' },
                  { title: 'Community', desc: 'Access to the exclusive FMF inner circle' }
                ].map((privilege, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-brand-teal rounded-full" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">{privilege.title}</h4>
                    </div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed pl-3.5">{privilege.desc}</p>
                  </div>
                ))}
              </div>

              {!isMember && (
                <div className="pt-8">
                  <Link to="/membership" className="btn-primary inline-flex items-center gap-3">
                    Join Power Hour <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
            
            <div className="relative aspect-square rounded-[3rem] overflow-hidden">
              <img 
                src="https://picsum.photos/seed/fmf-privileges/1000/1000" 
                alt="Member Lifestyle" 
                className="w-full h-full object-cover grayscale"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent" />
              <div className="absolute bottom-12 left-12 right-12 p-8 card-gradient backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-white text-sm font-light italic leading-relaxed">
                  "Being a Power Hour member isn't just about the workouts; it's about the standard you set for your life. The privileges are just a reflection of that commitment."
                </p>
                <p className="text-brand-teal text-[10px] uppercase tracking-widest mt-4 font-bold">— Michael Power, Founder</p>
              </div>
            </div>
          </div>
        </section>

        {/* Luxury Lifestyle Feature */}
        <div className="mt-32 p-12 md:p-24 rounded-[3rem] bg-gradient-to-br from-brand-black via-brand-black to-brand-teal/10 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
            <img src="https://picsum.photos/seed/cle-lifestyle/800/1200" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
          </div>
          <div className="relative z-10 max-w-xl space-y-8">
            <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">Luxury Lifestyle</span>
            <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none">
              CLÉ <span className="text-brand-teal italic">Paris</span>
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed italic">
              "Train with discipline. Move with strength. Carry yourself with elegance."
            </p>
            <div className="space-y-4 text-sm text-white/40 leading-relaxed">
              <p>
                CLÉ Paris represents the elegance and sophistication of the Fashion meetz Fitness lifestyle. Luxury, confidence, and personal presence for the refined athlete.
              </p>
            </div>
            <button className="btn-primary">Explore CLÉ Paris</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Membership = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const { user, login, signup, logout, updateTier } = useAuth();
  const location = useLocation();
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'login' && !user) {
      setIsLogin(true);
      setIsRegistering(true);
    }
  }, [location.search, user]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Access to basic workouts',
        'Limited training content',
        'Community forum access',
        'Public challenges'
      ],
      button: 'Get Started',
      highlight: false
    },
    {
      name: 'Premium',
      price: '$39',
      period: 'per month',
      features: [
        'Full workout library',
        'Structured training programs',
        'Training calendar',
        'Community features',
        'Progress tracking',
        'Exclusive mobility flows',
        'Monthly live Q&A'
      ],
      button: 'Join Now',
      highlight: true
    },
    {
      name: 'Elite',
      price: '$79',
      period: 'per month',
      features: [
        'Full training system',
        'Retreat priority access',
        'Exclusive content',
        'Special product drops',
        '1-on-1 mindset coaching',
        'Personalized nutrition plan',
        'Direct trainer messaging'
      ],
      button: 'Go Elite',
      highlight: false,
      badge: 'Priority Access'
    }
  ];

  const handleJoin = (tier: any) => {
    if (user) {
      updateTier(tier.name);
      showToast(`Membership updated to ${tier.name}`);
      return;
    }
    setSelectedTier(tier);
    setIsRegistering(true);
    setIsLogin(false);
    setIsSuccess(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        showToast('Logged in successfully');
      } else {
        if (formData.password !== formData.confirmPassword) {
          showToast('Passwords do not match', 'error');
          return;
        }
        await signup(formData.name, formData.email, selectedTier?.name || 'Free');
        showToast(`Welcome to the Collective, ${formData.name}!`);
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsRegistering(false);
        setSelectedTier(null);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      }, 2000);
    } catch (error: any) {
      let msg = 'Action failed';
      if (error.code === 'auth/email-already-in-use') msg = 'Email already in use';
      if (error.code === 'auth/wrong-password') msg = 'Incorrect password';
      if (error.code === 'auth/user-not-found') msg = 'User not found';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-20 space-y-6">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Membership</span>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Choose Your <span className="text-brand-coral">Power</span></h1>
          {user && (
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="px-4 py-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full text-brand-teal text-[10px] uppercase tracking-widest font-bold">
                Current: {user.tier}
              </div>
              <button onClick={() => logout()} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">Logout</button>
            </div>
          )}
          <p className="text-white/40 uppercase tracking-widest text-xs max-w-xl mx-auto leading-relaxed">
            Unlock the full potential of the Fitness Power Hour system. Choose the tier that matches your ambition.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <div 
              key={i} 
              className={`card-gradient p-12 flex flex-col space-y-8 relative overflow-hidden ${
                tier.highlight ? 'border-brand-teal shadow-[0_0_50px_rgba(45,212,191,0.1)]' : ''
              } ${tier.badge ? 'border-brand-coral/30' : ''} ${user?.tier === tier.name ? 'ring-2 ring-brand-teal ring-offset-4 ring-offset-brand-black' : ''}`}
            >
              {tier.highlight && (
                <div className="absolute top-6 right-6 bg-brand-teal text-black text-[8px] font-bold px-2 py-1 uppercase tracking-widest rounded">
                  Most Popular
                </div>
              )}
              {tier.badge && (
                <div className="absolute top-6 right-6 bg-brand-coral text-white text-[8px] font-bold px-2 py-1 uppercase tracking-widest rounded">
                  {tier.badge}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-tighter mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-xs text-white/40 uppercase tracking-widest">{tier.period}</span>
                </div>
              </div>
              <ul className="space-y-4 flex-grow">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-white/60">
                    <Check size={16} className="text-brand-teal" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleJoin(tier)}
                disabled={user?.tier === tier.name}
                className={`w-full py-4 uppercase tracking-widest text-[10px] font-bold transition-all ${
                  user?.tier === tier.name 
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : tier.highlight 
                      ? 'bg-brand-teal text-black hover:bg-white' 
                      : 'bg-white text-black hover:bg-brand-teal'
                }`}
              >
                {user?.tier === tier.name ? 'Current Tier' : tier.button}
              </button>
            </div>
          ))}
        </div>

        {/* Tier Comparison Table */}
        <section className="mt-40 py-24 border-t border-white/5">
          <div className="text-center mb-16 space-y-4">
            <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">The Breakdown</span>
            <h2 className="text-4xl font-bold uppercase tracking-tighter">Tier <span className="text-brand-coral">Comparison</span></h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-6 text-[10px] uppercase tracking-widest text-white/40 font-medium">Feature</th>
                  <th className="py-6 text-[10px] uppercase tracking-widest text-white font-bold text-center">Free</th>
                  <th className="py-6 text-[10px] uppercase tracking-widest text-brand-teal font-bold text-center">Premium</th>
                  <th className="py-6 text-[10px] uppercase tracking-widest text-brand-coral font-bold text-center">Elite</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Basic Workouts', free: true, premium: true, elite: true },
                  { name: 'Full Video Library', free: false, premium: true, elite: true },
                  { name: 'Structured Programs', free: false, premium: true, elite: true },
                  { name: 'Training Calendar', free: false, premium: true, elite: true },
                  { name: '30% Store Discount', free: false, premium: true, elite: true },
                  { name: 'Community Forum', free: true, premium: true, elite: true },
                  { name: 'Exclusive Mobility Flows', free: false, premium: true, elite: true },
                  { name: 'Monthly Live Q&A', free: false, premium: true, elite: true },
                  { name: 'Retreat Priority Access', free: false, premium: false, elite: true },
                  { name: '1-on-1 Mindset Coaching', free: false, premium: false, elite: true },
                  { name: 'Personalized Nutrition', free: false, premium: false, elite: true },
                  { name: 'Direct Trainer Messaging', free: false, premium: false, elite: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 text-white/60 font-light">{row.name}</td>
                    <td className="py-6 text-center">
                      {row.free ? <Check size={18} className="mx-auto text-white/40" /> : <X size={18} className="mx-auto text-white/10" />}
                    </td>
                    <td className="py-6 text-center">
                      {row.premium ? <Check size={18} className="mx-auto text-brand-teal" /> : <X size={18} className="mx-auto text-white/10" />}
                    </td>
                    <td className="py-6 text-center">
                      {row.elite ? <Check size={18} className="mx-auto text-brand-coral" /> : <X size={18} className="mx-auto text-white/10" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Member Privileges Section */}
        <section className="mt-40 py-24 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Exclusive Access</span>
                <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter leading-none">
                  Power Hour <br /> <span className="text-brand-coral">Member Privileges</span>
                </h2>
                <p className="text-white/40 text-lg font-light leading-relaxed">
                  Power Hour Members receive preferred pricing and exclusive access across the Fashion Meets Fitness platform. We’ve built an inner circle for those dedicated to the lifestyle.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Training Platform', desc: 'Full access to the Fitness Power Hour training platform' },
                  { title: 'Video Library', desc: 'Complete workout video library with 100+ sessions' },
                  { title: 'Structured Programs', desc: 'Expertly designed training programs for all levels' },
                  { title: 'Training Calendar', desc: 'Personalized scheduling and progress tracking' },
                  { title: '30% Store Discount', desc: 'Preferred pricing across the entire FMF store' },
                  { title: 'Early Access', desc: 'First access to new product drops and limited editions' },
                  { title: 'Priority Retreats', desc: 'Priority booking for FMF Retreat experiences' },
                  { title: 'Community', desc: 'Access to the exclusive FMF inner circle' }
                ].map((privilege, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-brand-teal rounded-full" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">{privilege.title}</h4>
                    </div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed pl-3.5">{privilege.desc}</p>
                  </div>
                ))}
              </div>

              {(!user || user.tier === 'Free') && (
                <div className="pt-8">
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="btn-primary inline-flex items-center gap-3"
                  >
                    Become a Member <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative aspect-square rounded-[3rem] overflow-hidden">
              <img 
                src="https://picsum.photos/seed/fmf-privileges-2/1000/1000" 
                alt="Member Lifestyle" 
                className="w-full h-full object-cover grayscale"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent" />
              <div className="absolute bottom-12 left-12 right-12 p-8 card-gradient backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-white text-sm font-light italic leading-relaxed">
                  "Being a Power Hour member isn't just about the workouts; it's about the standard you set for your life. The privileges are just a reflection of that commitment."
                </p>
                <p className="text-brand-teal text-[10px] uppercase tracking-widest mt-4 font-bold">— Michael Power, Founder</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isRegistering && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegistering(false)}
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md card-gradient p-12 space-y-8"
            >
              {isSuccess ? (
                <div className="text-center space-y-6 py-12">
                  <div className="w-20 h-20 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto text-brand-teal">
                    <Check size={40} />
                  </div>
                  <h3 className="text-3xl font-bold uppercase tracking-tighter">Welcome to the Collective</h3>
                  <p className="text-white/40 text-sm uppercase tracking-widest">Your power is now unlocked.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold uppercase tracking-tighter">
                      {isLogin ? 'Welcome Back' : 'Join the Collective'}
                    </h3>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest">
                      {isLogin ? 'Enter your credentials to continue' : `Signing up for ${selectedTier?.name}`}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40">Full Name</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-brand-teal transition-colors"
                          placeholder="ALEX RIVERA"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Email Address</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-brand-teal transition-colors"
                        placeholder="ALEX@POWERHOUR.COM"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Password</label>
                      <input
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-brand-teal transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                    {!isLogin && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40">Confirm Password</label>
                        <input
                          required
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-brand-teal transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                    )}

                    <button type="submit" className="btn-primary w-full py-5">
                      {isLogin ? 'Login' : 'Complete Registration'}
                    </button>
                  </form>

                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-[10px] uppercase tracking-widest text-white/40 hover:text-brand-teal transition-colors"
                    >
                      {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    useEffect(() => {
      navigate('/membership?mode=login');
    }, [navigate]);
    return null;
  }

  const perks = {
    Free: [
      'Access to basic workouts',
      'Limited training content',
      'Community forum access',
      'Public challenges'
    ],
    Premium: [
      'Full workout library',
      'Structured training programs',
      'Training calendar',
      'Community features',
      'Progress tracking',
      'Exclusive mobility flows',
      'Monthly live Q&A',
      '30% Store Discount'
    ],
    Elite: [
      'Full training system',
      'Retreat priority access',
      'Exclusive content',
      'Special product drops',
      '1-on-1 mindset coaching',
      'Personalized nutrition plan',
      'Direct trainer messaging',
      '30% Store Discount'
    ]
  };

  const currentPerks = perks[user.tier as keyof typeof perks] || perks.Free;

  const mockOrders = [
    { id: 'ORD-7721', date: '2026-02-15', total: 124.50, items: ['FMF Training Tee', 'Resistance Band Set'], status: 'Delivered' },
    { id: 'ORD-8902', date: '2026-03-01', total: 89.00, items: ['FMF Lifestyle Hoodie'], status: 'Shipped' },
  ];

  const orders = user.orderHistory || mockOrders;

  const mockLogs: WorkoutLog[] = [
    { id: 'log-1', date: '2026-03-05', sessionTitle: 'Upper Body Power', duration: 45, type: 'Strength' },
    { id: 'log-2', date: '2026-03-06', sessionTitle: 'Calisthenics Flow', duration: 30, type: 'Mobility' },
    { id: 'log-3', date: '2026-03-07', sessionTitle: 'High Intensity Blast', duration: 20, type: 'HIIT' },
  ];

  const mockPBs: PersonalBest[] = [
    { exercise: 'Muscle Ups', value: '12 Reps', date: '2026-02-20' },
    { exercise: 'Handstand Hold', value: '45 Seconds', date: '2026-03-01' },
    { exercise: 'Pistol Squats', value: '20 Reps', date: '2026-03-05' },
  ];

  const [activeTab, setActiveTab] = useState<'perks' | 'orders' | 'progress' | 'favorites'>('progress');
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);
  const [isLoggingPB, setIsLoggingPB] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const [logs, setLogs] = useState<WorkoutLog[]>(user.workoutLogs || mockLogs);
  const [pbs, setPbs] = useState<PersonalBest[]>(user.personalBests || mockPBs);
  const streak = user.streak || 5;

  const handleLogWorkout = (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newLog: WorkoutLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      sessionTitle: formData.get('title') as string,
      duration: parseInt(formData.get('duration') as string),
      type: formData.get('type') as any
    };

    setLogs([newLog, ...logs]);
    setIsLoggingWorkout(false);
  };

  const handleLogPB = (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newPB: PersonalBest = {
      exercise: formData.get('exercise') as string,
      value: formData.get('value') as string,
      date: new Date().toISOString().split('T')[0]
    };

    setPbs([newPB, ...pbs]);
    setIsLoggingPB(false);
  };

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-6">
            <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Member Profile</span>
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">
              Welcome, <span className="text-brand-coral">{user.name.split(' ')[0]}</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full text-brand-teal text-[10px] uppercase tracking-widest font-bold">
                {user.tier} Member
              </div>
              <span className="text-white/20 text-[10px] uppercase tracking-widest">Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center px-6 py-4 card-gradient border-brand-coral/30">
              <span className="text-brand-coral text-2xl font-bold">{streak}</span>
              <span className="text-[8px] uppercase tracking-widest text-white/40">Day Streak</span>
            </div>
            <button 
              onClick={logout}
              className="px-8 py-4 border border-white/10 text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Logout Session
            </button>
          </div>
        </header>

        <div className="flex gap-8 mb-12 border-b border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'progress', label: 'Progress Tracking' },
            { id: 'favorites', label: 'Favorite Videos' },
            { id: 'perks', label: 'Member Privileges' },
            { id: 'orders', label: 'Order History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id ? 'border-brand-teal text-white' : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {activeTab === 'progress' && (
            <>
              {/* Stats Overview */}
              <div className="lg:col-span-1 space-y-8">
                <div className="card-gradient p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-coral/20 rounded-full flex items-center justify-center text-brand-coral">
                      <Trophy size={24} />
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-tighter">Personal Bests</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {pbs.map((pb, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{pb.exercise}</p>
                          <p className="text-lg font-bold text-white">{pb.value}</p>
                        </div>
                        <span className="text-[8px] text-white/20 uppercase tracking-widest">{pb.date}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setIsLoggingPB(true)}
                    className="w-full py-4 border border-brand-coral/30 text-brand-coral text-[10px] uppercase tracking-widest font-bold hover:bg-brand-coral hover:text-black transition-all"
                  >
                    Log New Personal Best
                  </button>
                </div>

                <div className="card-gradient p-10 space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Consistency</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`aspect-square rounded-sm ${i < 18 ? 'bg-brand-teal/40' : 'bg-white/5'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-white/20 uppercase tracking-widest text-center">Last 28 days activity</p>
                </div>
              </div>

              {/* Workout History */}
              <div className="lg:col-span-2 space-y-8">
                <div className="card-gradient p-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-teal/20 rounded-full flex items-center justify-center text-brand-teal">
                        <Calendar size={24} />
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-tighter">Recent Sessions</h3>
                    </div>
                    <button 
                      onClick={() => setIsLoggingWorkout(true)}
                      className="btn-primary py-3 px-8 text-[10px]"
                    >
                      Log Workout
                    </button>
                  </div>

                  <div className="space-y-4">
                    {logs.map((log) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={log.id} 
                        className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/[0.05] transition-all group"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-brand-teal transition-colors">
                            <Dumbbell size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold uppercase tracking-tight">{log.sessionTitle}</h4>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">{log.date} • {log.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-mono text-brand-teal">{log.duration}m</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'favorites' && (
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {user.favorites && user.favorites.length > 0 ? (
                  VIDEOS.filter(v => user.favorites?.includes(v.id)).map((video) => (
                    <motion.div
                      layout
                      key={video.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="card-gradient overflow-hidden group cursor-pointer"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="relative aspect-video">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-brand-teal/80 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform shadow-2xl">
                            <Play fill="white" size={20} className="translate-x-0.5" />
                          </div>
                        </div>
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase tracking-widest">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-6 space-y-2">
                        <h3 className="text-sm font-bold uppercase tracking-tight group-hover:text-brand-teal transition-colors">{video.title}</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{video.category}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="lg:col-span-3 py-20 text-center space-y-4">
                    <Heart size={48} className="text-white/10 mx-auto" />
                    <p className="text-white/40 uppercase tracking-widest text-xs">You haven't favorited any videos yet.</p>
                    <Link to="/videos" className="btn-primary inline-block">Browse Library</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'perks' && (
            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1 space-y-8">
                <div className="card-gradient p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-teal/20 rounded-full flex items-center justify-center text-brand-teal">
                      <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-tighter">Your Privileges</h3>
                  </div>
                  
                  <ul className="space-y-4">
                    {currentPerks.map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check size={14} className="text-brand-teal mt-1 flex-shrink-0" />
                        <span className="text-xs text-white/60 leading-relaxed uppercase tracking-wide">{perk}</span>
                      </li>
                    ))}
                  </ul>

                  {user.tier !== 'Elite' && (
                    <div className="pt-6 border-t border-white/5">
                      <Link to="/membership" className="text-brand-coral text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                        Upgrade Membership <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2 card-gradient p-10">
                <h3 className="text-xl font-bold uppercase tracking-tighter mb-8">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-white/20">Email Address</p>
                    <p className="text-sm text-white/60 uppercase tracking-widest">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-white/20">Member ID</p>
                    <p className="text-sm text-white/60 uppercase tracking-widest">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="lg:col-span-3 space-y-8">
              <div className="card-gradient p-10">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-coral/20 rounded-full flex items-center justify-center text-brand-coral">
                      <ShoppingBag size={24} />
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-tighter">Order History</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  {orders.length > 0 ? (
                    orders.map((order: any) => (
                      <div key={order.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between gap-6 hover:bg-white/[0.05] transition-all">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-white">{order.id}</span>
                            <span className="text-[10px] text-white/40 uppercase tracking-widest">{order.date}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[9px] uppercase tracking-widest text-white/60">{item}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col justify-between items-end gap-4">
                          <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                            order.status === 'Delivered' ? 'bg-brand-teal/20 text-brand-teal' : 'bg-brand-coral/20 text-brand-coral'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-lg font-bold text-white">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 space-y-4">
                      <p className="text-white/20 text-xs uppercase tracking-widest">No orders found yet.</p>
                      <Link to="/store" className="text-brand-teal text-[10px] font-bold uppercase tracking-widest hover:underline">Start Shopping</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Workout Modal */}
      <AnimatePresence>
        {isLoggingWorkout && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoggingWorkout(false)}
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg card-gradient p-10 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold uppercase tracking-tighter">Log Workout</h3>
                <button onClick={() => setIsLoggingWorkout(false)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleLogWorkout} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Session Title</label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. Upper Body Power"
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 text-sm focus:outline-none focus:border-brand-teal transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Duration (min)</label>
                    <input
                      name="duration"
                      required
                      type="number"
                      placeholder="45"
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 text-sm focus:outline-none focus:border-brand-teal transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Type</label>
                    <select
                      name="type"
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 text-sm focus:outline-none focus:border-brand-teal transition-colors appearance-none"
                    >
                      <option value="Strength">Strength</option>
                      <option value="Mobility">Mobility</option>
                      <option value="HIIT">HIIT</option>
                      <option value="Yoga">Yoga</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-4">Save Session</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log PB Modal */}
      <AnimatePresence>
        {isLoggingPB && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoggingPB(false)}
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg card-gradient p-10 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold uppercase tracking-tighter">New Personal Best</h3>
                <button onClick={() => setIsLoggingPB(false)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleLogPB} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Exercise</label>
                  <input
                    name="exercise"
                    required
                    type="text"
                    placeholder="e.g. Deadlift"
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 text-sm focus:outline-none focus:border-brand-teal transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Value</label>
                  <input
                    name="value"
                    required
                    type="text"
                    placeholder="e.g. 150kg or 20 Reps"
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 text-sm focus:outline-none focus:border-brand-teal transition-colors"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-4">Record Achievement</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedVideo && <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      </AnimatePresence>
    </div>
  );
};

const Athletes = () => (
  <div className="pt-40 pb-32 px-6">
    <div className="max-w-7xl mx-auto">
      <header className="mb-20 space-y-6">
        <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">The Ambassadors</span>
        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">FMF <span className="text-brand-teal">Athletes</span></h1>
        <p className="text-white/40 uppercase tracking-widest text-xs max-w-xl leading-relaxed">
          The faces of discipline. Our athletes represent the pinnacle of strength, movement, and the FMF lifestyle.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {ATHLETES.map((athlete) => (
          <div key={athlete.id} className="space-y-8 group">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
              <img 
                src={athlete.image} 
                alt={athlete.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8 space-y-2">
                <h3 className="text-2xl font-bold uppercase tracking-tighter">{athlete.name}</h3>
                <span className="text-brand-teal text-[10px] uppercase tracking-widest font-bold">{athlete.role}</span>
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-white/50 italic font-light leading-relaxed">"{athlete.philosophy}"</p>
              
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest text-white/20">Featured Workouts</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-video bg-white/5 rounded-lg overflow-hidden relative group/video cursor-pointer">
                    <img src={`https://picsum.photos/seed/${athlete.id}-w1/300/200`} className="w-full h-full object-cover opacity-40 group-hover/video:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                    <Play size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover/video:opacity-100 transition-opacity" />
                  </div>
                  <div className="aspect-video bg-white/5 rounded-lg overflow-hidden relative group/video cursor-pointer">
                    <img src={`https://picsum.photos/seed/${athlete.id}-w2/300/200`} className="w-full h-full object-cover opacity-40 group-hover/video:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                    <Play size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover/video:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-teal hover:border-brand-teal transition-all">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-coral hover:border-brand-coral transition-all">
                  <Twitter size={18} />
                </a>
              </div>
              <button className="btn-outline w-full">View Training Routine</button>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Wellness Products */}
      <section className="pt-32 border-t border-white/5">
        <div className="text-center mb-20 space-y-6">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Performance Nutrition</span>
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">Recommended <span className="text-brand-coral">Wellness Products</span></h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Training, recovery, and daily energy are connected.
            </p>
            <p className="text-white/40 text-sm font-light leading-relaxed">
              The Fitness Power Hour program occasionally recommends wellness products that support focus, recovery, and internal balance. These products are optional tools designed to complement a disciplined lifestyle.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: 'Morning Energy Support',
              focus: ['Energy', 'Mental Focus', 'Daily Performance'],
              desc: 'A wellness supplement designed to support mental clarity and sustained energy throughout the day. Best used as part of a morning routine before work, training, or daily activity.',
              image: 'https://picsum.photos/seed/wellness1/800/1000',
              link: 'https://example.com/energy'
            },
            {
              title: 'Gut & Mood Support',
              focus: ['Gut Health', 'Daily Balance', 'Long-term Wellness'],
              desc: 'A daily wellness product designed to support digestive balance and overall well-being. Gut health plays an important role in energy levels, recovery, and mental balance.',
              image: 'https://picsum.photos/seed/wellness2/800/1000',
              link: 'https://example.com/gut'
            },
            {
              title: 'Recovery Support',
              focus: ['Recovery', 'Relaxation', 'Physical Restoration'],
              desc: 'Supports recovery after training and helps the body maintain balance after intense physical activity. Best used as part of a recovery or evening routine.',
              image: 'https://picsum.photos/seed/wellness3/800/1000',
              link: 'https://example.com/recovery'
            }
          ].map((product, i) => (
            <div key={i} className="card-gradient p-10 flex flex-col space-y-8 group hover:border-brand-teal/30 transition-all">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-4 flex-grow">
                <h3 className="text-2xl font-bold uppercase tracking-tighter">{product.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-light">{product.desc}</p>
                <div className="pt-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-brand-teal font-bold">Focus</p>
                  <div className="flex flex-wrap gap-2">
                    {product.focus.map((f, idx) => (
                      <span key={idx} className="text-[9px] uppercase tracking-widest text-white/30 border border-white/5 px-2 py-1 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <a 
                href={product.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                View Product <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] uppercase tracking-widest text-white/20 max-w-2xl mx-auto">
          Disclaimer: These products are recommended as part of a wellness lifestyle and are not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </section>
    </div>
  </div>
);

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel" 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
  confirmText?: string; 
  cancelText?: string; 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-black/90 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm card-gradient p-8 space-y-6 text-center"
          >
            <div className="w-16 h-16 bg-brand-coral/20 rounded-full flex items-center justify-center mx-auto text-brand-coral">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold uppercase tracking-tighter">{title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{message}</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-grow py-3 text-[10px] uppercase tracking-widest font-bold border border-white/10 hover:bg-white/5 transition-all"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-grow py-3 text-[10px] uppercase tracking-widest font-bold bg-brand-coral text-white hover:bg-brand-coral/80 transition-all"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Community = () => {
  const { user, addNotification } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'post' | 'comment', postId: string, commentId?: string } | null>(null);

  const leaderboard = [
    { rank: 1, name: 'Alex R.', points: 12450, level: 'Elite' },
    { rank: 2, name: 'Sarah M.', points: 11200, level: 'Power' },
    { rank: 3, name: 'James K.', points: 10850, level: 'Power' },
    { rank: 4, name: 'Elena V.', points: 9400, level: 'Foundation' },
    { rank: 5, name: 'Marcus D.', points: 8900, level: 'Foundation' },
  ];

  const challenges = [
    { title: '30-Day Core Blast', participants: 1240, daysLeft: 12, reward: 'Elite Badge' },
    { title: 'Muscle Up Mastery', participants: 450, daysLeft: 5, reward: 'Store Credit' },
    { title: 'Sunrise Beach Ritual', participants: 890, daysLeft: 20, reward: 'Retreat Discount' },
  ];

  const mockPosts: Post[] = [
    {
      id: 'p1',
      authorId: 'u1',
      authorName: 'Alex Rivera',
      authorTier: 'Elite',
      content: 'Just hit a new PB on muscle ups! 12 reps clean. The Power Hour system really works if you stay consistent. Who else is training today?',
      likes: ['u2', 'u3'],
      comments: [
        { id: 'c1', authorId: 'u2', authorName: 'Sarah', content: 'Insane work Alex! Keep pushing.', createdAt: '2026-03-07T10:00:00Z' }
      ],
      createdAt: '2026-03-07T09:00:00Z',
      tags: ['Progress', 'Calisthenics']
    },
    {
      id: 'p2',
      authorId: 'u4',
      authorName: 'Elena Vance',
      authorTier: 'Premium',
      content: 'Morning mobility flow at the beach. Nothing beats starting the day with movement and the sound of the ocean. #FMF #Lifestyle',
      imageUrl: 'https://picsum.photos/seed/fmf-post-1/800/600',
      likes: ['u1', 'u5', 'u6'],
      comments: [],
      createdAt: '2026-03-08T07:30:00Z',
      tags: ['Lifestyle', 'Mobility']
    }
  ];

  useEffect(() => {
    // In a real app, we'd fetch from Firestore here
    setPosts(mockPosts);
  }, []);

  const handlePostSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;

    const newPost: Post = {
      id: `p-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorTier: user.tier,
      content: newPostContent,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
      tags: ['General']
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsPosting(false);
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(user.id);
        if (!hasLiked) {
          addNotification({
            userId: post.authorId,
            type: 'like',
            fromUserId: user.id,
            fromUserName: user.name,
            postId: post.id,
            postContent: post.content.substring(0, 50) + '...'
          });
        }
        return {
          ...post,
          likes: hasLiked 
            ? post.likes.filter(id => id !== user.id)
            : [...post.likes, user.id]
        };
      }
      return post;
    }));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId)
        };
      }
      return p;
    }));
  };

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center space-y-6">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">The Collective</span>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">FMF <span className="text-brand-coral">Community</span></h1>
          <p className="text-white/40 uppercase tracking-widest text-xs max-w-xl mx-auto leading-relaxed">
            Connect with athletes worldwide. Share your journey, ask questions, and rise with the collective.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Confirmation Modal */}
          <ConfirmationModal 
            isOpen={confirmDelete !== null}
            onClose={() => setConfirmDelete(null)}
            onConfirm={() => {
              if (!confirmDelete) return;
              if (confirmDelete.type === 'post') {
                handleDeletePost(confirmDelete.postId);
              } else if (confirmDelete.type === 'comment' && confirmDelete.commentId) {
                handleDeleteComment(confirmDelete.postId, confirmDelete.commentId);
              }
            }}
            title={`Delete ${confirmDelete?.type === 'post' ? 'Post' : 'Comment'}`}
            message={`Are you sure you want to delete this ${confirmDelete?.type}? This action cannot be undone.`}
          />

          {/* Main Forum Feed */}
          <div className="lg:col-span-2 space-y-8">
            {/* Create Post */}
            {user ? (
              <div className="card-gradient p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <button 
                    onClick={() => setIsPosting(true)}
                    className="flex-grow text-left px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white/40 text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Share your progress, {user.name.split(' ')[0]}...
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-gradient p-8 text-center space-y-4">
                <p className="text-xs text-white/40 uppercase tracking-widest">Join the collective to participate in the forum</p>
                <Link to="/membership" className="btn-primary inline-block">Join Now</Link>
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {['All', 'Progress', 'Training', 'Lifestyle', 'Questions'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all border ${
                    activeFilter === filter ? 'bg-brand-teal border-brand-teal text-black' : 'border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Posts List */}
            <div className="space-y-8">
              {posts.map((post) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={post.id} 
                  className="card-gradient p-8 space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-brand-teal font-bold">
                        {post.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold uppercase tracking-tight">{post.authorName}</h4>
                          <span className="text-[8px] px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded uppercase font-bold tracking-widest">
                            {post.authorTier}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {post.authorId === user?.id && (
                        <button 
                          onClick={() => setConfirmDelete({ type: 'post', postId: post.id })}
                          className="text-white/20 hover:text-brand-coral transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button className="text-white/20 hover:text-white transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-white/80 text-sm leading-relaxed">{post.content}</p>
                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-white/5">
                        <img src={post.imageUrl} alt="Post content" className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-[8px] text-brand-coral uppercase tracking-widest font-bold">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center gap-8">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 transition-colors group ${
                        post.likes.includes(user?.id || '') ? 'text-brand-coral' : 'text-white/40 hover:text-brand-coral'
                      }`}
                    >
                      <Heart size={18} className={post.likes.includes(user?.id || '') ? 'fill-brand-coral' : ''} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{post.likes.length}</span>
                    </button>
                    <button 
                      onClick={() => {
                        // Toggle comments visibility or focus
                      }}
                      className="flex items-center gap-2 text-white/40 hover:text-brand-teal transition-colors"
                    >
                      <Quote size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{post.comments.length}</span>
                    </button>
                  </div>

                  {/* Comments Section (Simplified) */}
                  {post.comments.length > 0 && (
                    <div className="pt-6 space-y-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-brand-teal">
                            {comment.authorName.charAt(0)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-tight">{comment.authorName}</span>
                              <span className="text-[8px] text-white/20 uppercase tracking-widest">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                              {comment.authorId === user?.id && (
                                <button 
                                  onClick={() => setConfirmDelete({ type: 'comment', postId: post.id, commentId: comment.id })}
                                  className="text-white/20 hover:text-brand-coral transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-white/60 leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  {user && (
                    <div className="pt-4 flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-brand-teal">
                        {user.name.charAt(0)}
                      </div>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const input = form.elements.namedItem('comment') as HTMLInputElement;
                          if (!input.value.trim()) return;
                          
                          const newComment: Comment = {
                            id: `c-${Date.now()}`,
                            authorId: user.id,
                            authorName: user.name,
                            content: input.value,
                            createdAt: new Date().toISOString()
                          };

                          setPosts(posts.map(p => 
                            p.id === post.id ? { ...p, comments: [...p.comments, newComment] } : p
                          ));
                          addNotification({
                            userId: post.authorId,
                            type: 'comment',
                            fromUserId: user.id,
                            fromUserName: user.name,
                            postId: post.id,
                            postContent: post.content.substring(0, 50) + '...'
                          });
                          input.value = '';
                        }}
                        className="flex-grow flex gap-2"
                      >
                        <input
                          name="comment"
                          placeholder="Add a comment..."
                          className="flex-grow bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] focus:outline-none focus:border-brand-teal transition-all"
                        />
                        <button type="submit" className="text-brand-teal hover:text-white transition-colors">
                          <Send size={14} />
                        </button>
                      </form>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
            {/* Leaderboard */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-tighter">Top Athletes</h2>
              <div className="card-gradient overflow-hidden">
                <div className="p-6 space-y-4">
                  {leaderboard.slice(0, 3).map((athlete) => (
                    <div key={athlete.rank} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <span className="text-brand-coral font-mono text-xs">#{athlete.rank}</span>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-tight">{athlete.name}</p>
                          <p className="text-[8px] text-white/40 uppercase tracking-widest">{athlete.level}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-brand-teal">{athlete.points.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 bg-white/5 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-all border-t border-white/5">
                  View Full Leaderboard
                </button>
              </div>
            </div>

            {/* Active Challenges */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-tighter">Active Challenges</h2>
              <div className="space-y-4">
                {challenges.map((challenge, idx) => (
                  <div key={idx} className="card-gradient p-6 space-y-4 group cursor-pointer hover:border-brand-coral transition-all">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold uppercase tracking-tight group-hover:text-brand-coral transition-colors">{challenge.title}</h4>
                      <span className="text-[8px] px-2 py-1 bg-brand-coral/10 text-brand-coral rounded uppercase font-bold tracking-widest">
                        {challenge.daysLeft}d Left
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                      <span>{challenge.participants.toLocaleString()} Athletes</span>
                      <span className="text-brand-teal">{challenge.reward}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-coral w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {isPosting && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPosting(false)}
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg card-gradient p-10 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold uppercase tracking-tighter">Create Post</h3>
                <button onClick={() => setIsPosting(false)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handlePostSubmit} className="space-y-6">
                <textarea
                  required
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's on your mind? Share your progress or ask a question..."
                  className="w-full h-40 bg-white/5 border border-white/10 p-6 text-sm focus:outline-none focus:border-brand-teal transition-colors resize-none"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <button type="button" className="p-2 text-white/40 hover:text-brand-teal transition-colors">
                      <Upload size={20} />
                    </button>
                    <button type="button" className="p-2 text-white/40 hover:text-brand-teal transition-colors">
                      <Link2 size={20} />
                    </button>
                  </div>
                  <button type="submit" className="btn-primary px-10 py-4">Post to Collective</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Recovery = () => (
  <div className="pt-40 pb-32 px-6">
    <div className="max-w-7xl mx-auto">
      <header className="mb-20 text-center space-y-6">
        <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">The System Completes Here</span>
        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Recovery & <span className="text-brand-teal">Performance</span></h1>
        <p className="text-white/40 uppercase tracking-widest text-xs max-w-xl mx-auto leading-relaxed">
          Training is only half the process. Recovery completes the system. Optimize your performance through professional mobility and stretch services.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-brand-teal text-xs font-bold uppercase tracking-widest">Featured Partner</span>
              <div className="h-px flex-grow bg-white/10" />
            </div>
            <h2 className="text-4xl font-bold uppercase tracking-tighter">FLEX MOB <span className="text-brand-coral">305</span></h2>
            <p className="text-white/50 text-lg font-light leading-relaxed">
              Flex Mob 305 specializes in professional stretching and body recovery services designed to improve mobility, reduce muscle tension, and optimize physical performance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { title: 'Assisted Stretching', desc: 'Deep tissue release and joint decompression.' },
              { title: 'Mobility Work', desc: 'Functional range of motion improvements.' },
              { title: 'Recovery Therapy', desc: 'Post-training muscle relaxation and repair.' },
              { title: 'Performance Optimization', desc: 'Systemic approach to physical readiness.' }
            ].map((service, i) => (
              <div key={i} className="space-y-2">
                <h4 className="font-bold uppercase text-sm text-brand-teal">{service.title}</h4>
                <p className="text-xs text-white/40">{service.desc}</p>
              </div>
            ))}
          </div>

          <button className="btn-primary">Book Recovery Session</button>
        </div>

        <div className="relative">
          <img 
            src="https://picsum.photos/seed/recovery-fmf/800/1000" 
            alt="Recovery Session" 
            className="rounded-3xl grayscale hover:grayscale-0 transition-all duration-1000 aspect-[4/5] object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-teal/10 blur-3xl rounded-full" />
        </div>
      </div>

      <section className="space-y-12">
        <h3 className="text-2xl font-bold uppercase tracking-tighter border-b border-white/10 pb-4">Recovery Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'The Science of Stretch', category: 'Education' },
            { title: 'Post-Workout Mobility', category: 'Tutorial' },
            { title: 'Sleep & Performance', category: 'Lifestyle' }
          ].map((item, i) => (
            <div key={i} className="card-gradient p-8 space-y-4 group cursor-pointer">
              <span className="text-[9px] uppercase tracking-widest text-brand-coral">{item.category}</span>
              <h4 className="text-xl font-bold uppercase group-hover:text-brand-teal transition-colors">{item.title}</h4>
              <p className="text-xs text-white/40 leading-relaxed">Learn how to optimize your body's natural recovery processes for maximum output.</p>
              <div className="flex items-center gap-2 text-brand-teal text-[10px] uppercase tracking-widest pt-4">
                Read More <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-7 flex items-center justify-between text-left group transition-all"
      >
        <span className={`text-lg md:text-xl uppercase tracking-tight font-bold transition-all duration-300 ${isOpen ? 'text-brand-teal translate-x-2' : 'text-white/70 group-hover:text-white group-hover:translate-x-1'}`}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0, scale: isOpen ? 1.2 : 1 }}
          className={`transition-colors duration-300 ${isOpen ? 'text-brand-teal' : 'text-white/20 group-hover:text-white/50'}`}
        >
          <Plus size={24} strokeWidth={1.5} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-8 pl-2 pr-12">
              <p className="text-white/40 leading-relaxed text-base font-light">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RetreatPage = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', experience: '', goals: '' });

  const handleApply = () => {
    setIsModalOpen(true);
    setFormStep(1);
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (formStep === 1 && formData.name && formData.email) {
      setFormStep(2);
    }
  };

  const handleBack = () => {
    if (formStep === 2) {
      setFormStep(1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setFormStep(3);
    showToast(`Application received! Confirmation sent to ${formData.email}`);
    setTimeout(() => {
      setIsModalOpen(false);
      setFormData({ name: '', email: '', experience: '', goals: '' });
      setFormStep(1);
    }, 5000);
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/fmf-retreat/1920/1080"
            alt="Retreat"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-brand-teal text-[10px] uppercase tracking-[0.5em] mb-6 block"
          >
            The Ultimate Immersion
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-8"
          >
            FMF <span className="text-brand-coral italic font-serif">Retreats</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 font-light leading-relaxed"
          >
            Reconnect with discipline, physical strength, and mental clarity. Our flagship immersion is currently held exclusively in Miami Beach, combining elite fitness training with luxury coastal wellness.
          </motion.p>
        </div>
      </section>

      {/* Details */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold uppercase tracking-tighter">What's <span className="text-brand-teal">Included</span></h2>
              <ul className="space-y-4">
                {[
                  'Daily Sunrise Calisthenics Sessions',
                  'Mindset & Discipline Workshops',
                  'Luxury Accommodation & Wellness Spa',
                  'Chef-prepared Performance Nutrition',
                  'Mobility & Recovery Practices',
                  'Community Building & Networking'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white/60">
                    <div className="w-1.5 h-1.5 bg-brand-coral rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={handleApply} className="btn-primary">Apply for Next Retreat</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://picsum.photos/seed/fmfr3/600/800" alt="Retreat 1" className="rounded-2xl aspect-[3/4] object-cover" referrerPolicy="no-referrer" />
            <img src="https://picsum.photos/seed/fmfr4/600/800" alt="Retreat 2" className="rounded-2xl aspect-[3/4] object-cover translate-y-12" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section className="py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold uppercase tracking-tighter mb-16 text-center">Upcoming <span className="text-brand-coral">Experiences</span></h2>
          <div className="space-y-12">
            {RETREATS.map((retreat) => (
              <div key={retreat.id} className="card-gradient overflow-hidden flex flex-col lg:flex-row group">
                <div className="lg:w-1/2 relative overflow-hidden">
                  <img src={retreat.image} alt={retreat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
                  <div className="absolute top-6 left-6 bg-brand-teal px-4 py-2 text-[10px] uppercase tracking-widest font-bold">{retreat.date}</div>
                </div>
                <div className="lg:w-1/2 p-12 flex flex-col justify-center space-y-6">
                  <div className="flex items-center gap-2 text-brand-coral text-xs uppercase tracking-widest">
                    <MapPin size={14} /> {retreat.location}
                  </div>
                  <h3 className="text-3xl font-bold uppercase">{retreat.title}</h3>
                  <p className="text-white/40 leading-relaxed">{retreat.description}</p>
                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="text-2xl font-bold">{retreat.price} <span className="text-xs text-white/20 font-normal uppercase tracking-widest">/ person</span></div>
                    <button onClick={handleApply} className="btn-outline">Apply Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold uppercase tracking-tighter mb-16 text-center">The <span className="text-brand-teal">Collective</span> Voice</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'James Wilson', role: 'Entrepreneur', text: 'The FMF retreat in Miami changed my entire perspective on discipline. It’s not just about the training; it’s about the mindset you carry into your business and life.' },
            { name: 'Elena Rodriguez', role: 'Creative Director', text: 'Mastering my body through calisthenics on the Miami coast was a spiritual experience. The community Michael has built is unmatched.' },
            { name: 'David Park', role: 'Professional Athlete', text: 'Even as a pro, the intensity and focus of the mindset workshops pushed me to a new level. Fashion meetz Fitness is the gold standard.' }
          ].map((t, i) => (
            <div key={i} className="card-gradient p-10 space-y-6 relative">
              <Quote className="text-brand-teal/20 absolute top-6 right-6" size={40} />
              <p className="text-white/60 italic leading-relaxed">"{t.text}"</p>
              <div className="pt-6 border-t border-white/5">
                <div className="font-bold uppercase tracking-tight">{t.name}</div>
                <div className="text-[10px] text-brand-coral uppercase tracking-widest">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Information */}
      <section className="py-32 bg-white/5 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold uppercase tracking-tighter">Booking <span className="text-brand-teal">Information</span></h2>
            <p className="text-white/40 leading-relaxed">
              FMF Retreats are exclusive, high-intensity experiences with limited capacity. We operate on an application basis to ensure a cohesive community of dedicated individuals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { step: '01', title: 'Application', desc: 'Submit your application detailing your fitness background and goals.' },
              { step: '02', title: 'Interview', desc: 'A brief call with our team to ensure the retreat is the right fit for you.' },
              { step: '03', title: 'Deposit', desc: 'Secure your spot with a non-refundable deposit once accepted.' }
            ].map((item, i) => (
              <div key={i} className="space-y-4 p-8 bg-white/5 rounded-2xl">
                <div className="text-brand-teal font-bold text-2xl">{item.step}</div>
                <h4 className="font-bold uppercase tracking-tight">{item.title}</h4>
                <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-12 card-gradient space-y-8">
            <h3 className="text-2xl font-bold uppercase">Ready to Commit?</h3>
            <p className="text-white/60">Applications for the Summer 2026 season are now open.</p>
            <button onClick={handleApply} className="btn-primary px-12">Start Your Application</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-40 px-6 max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Support</span>
          <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter">Common <span className="text-brand-coral italic font-serif">Questions</span></h2>
          <p className="text-white/30 text-xs uppercase tracking-widest">Everything you need to know before the immersion.</p>
        </div>
        <div className="space-y-2">
          {[
            { 
              q: 'What fitness level is required?', 
              a: 'While we welcome all levels, a baseline of physical fitness is recommended. Our trainers scale movements to your ability, but the intensity is high. We focus on calisthenics, mobility, and functional strength.' 
            },
            { 
              q: 'Where in Miami Beach is the retreat held?', 
              a: 'We partner with a luxury oceanfront estate in the South of Fifth (SoFi) district. It provides the perfect balance of private training grounds and immediate beach access for our sunrise sessions.' 
            },
            { 
              q: 'Are meals included in the price?', 
              a: 'Yes, all meals are included. We provide chef-prepared, performance-focused nutrition designed to fuel your training and recovery. We can accommodate most dietary restrictions with prior notice.' 
            },
            { 
              q: 'Are flights included?', 
              a: 'Flights are not included in the retreat price. We provide luxury ground transportation to and from Miami International Airport (MIA) on the start and end dates of the retreat.' 
            },
            { 
              q: 'Is there a minimum age requirement?', 
              a: 'Participants must be at least 21 years of age. Our community typically consists of dedicated professionals and athletes looking for a high-intensity growth environment.' 
            },
            { 
              q: 'What should I pack?', 
              a: 'You will receive a detailed packing list 30 days before the retreat. Generally, you will need multiple sets of training gear, comfortable resort wear, swimwear, and a pair of versatile training shoes.' 
            },
            { 
              q: 'Can I extend my stay?', 
              a: 'Yes, we can assist in booking additional nights at our partner estate or nearby luxury hotels at a preferred rate if you wish to enjoy Miami Beach for longer.' 
            },
            { 
              q: 'Can I come alone?', 
              a: 'Absolutely. Most of our participants come solo. The retreat is designed to build a strong community, and you will leave with a new network of like-minded individuals.' 
            },
            { 
              q: 'What is the cancellation policy?', 
              a: 'Deposits are non-refundable. Cancellations made 60 days prior to the start date are eligible for a partial credit toward a future retreat. We highly recommend purchasing travel insurance.' 
            }
          ].map((item, i) => (
            <div key={i}>
              <FAQItem question={item.q} answer={item.a} />
            </div>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card-gradient p-12 max-w-xl w-full relative z-10 space-y-8"
            >
              {formStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Step 01 / 02</span>
                    <h2 className="text-3xl font-bold uppercase tracking-tighter">Personal <span className="text-brand-coral">Information</span></h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Full Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                        placeholder="ALEX RIVERA"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Email Address</label>
                      <input 
                        type="email" 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                        placeholder="ALEX@POWERHOUR.COM"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleNext}
                    disabled={!formData.name || !formData.email}
                    className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Experience
                  </button>
                </div>
              )}

              {formStep === 2 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center space-y-2">
                    <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Step 02 / 02</span>
                    <h2 className="text-3xl font-bold uppercase tracking-tighter">Training <span className="text-brand-coral">Background</span></h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Fitness Experience</label>
                      <textarea 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors h-24 resize-none"
                        placeholder="Tell us about your current training routine..."
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Retreat Goals</label>
                      <textarea 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors h-24 resize-none"
                        placeholder="What do you hope to achieve during this immersion?"
                        value={formData.goals}
                        onChange={(e) => setFormData({...formData, goals: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={handleBack}
                      className="btn-outline py-4"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting || !formData.experience || !formData.goals}
                      className="btn-primary py-4 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}

              {formStep === 3 && (
                <div className="text-center py-12 space-y-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-brand-teal rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(45,212,191,0.3)]"
                  >
                    <Check size={40} className="text-black" />
                  </motion.div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold uppercase tracking-tighter">Application <span className="text-brand-teal">Received</span></h2>
                    <p className="text-white/40 text-sm uppercase tracking-widest">Our team will review your application and contact you within 48 hours.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const About = () => (
  <div className="pt-40 pb-32 px-6">
    <div className="max-w-4xl mx-auto space-y-24">
      <section className="text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Our <span className="text-brand-teal">Mission</span></h1>
        <p className="text-2xl text-white/60 font-light leading-relaxed">
          To inspire people to develop strength through training and intentional living.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
        <img src="https://picsum.photos/seed/fmf-about/800/1000" alt="About" className="rounded-3xl grayscale" referrerPolicy="no-referrer" />
        <div className="space-y-8">
          <h2 className="text-4xl font-bold uppercase tracking-tighter">Fashion meetz <span className="text-brand-coral">Fitness</span></h2>
          <div className="space-y-6 text-white/50 leading-relaxed">
            <p>
              Fashion meetz Fitness represents a lifestyle of discipline, movement, and aesthetic excellence. We believe that how you move is as important as how you present yourself to the world.
            </p>
            <p>
              Founded in Miami, FMF was born from the desire to bridge the gap between high-performance training and luxury lifestyle. Our programs are designed for those who demand the best from themselves in every arena.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <div className="text-3xl font-bold text-brand-teal">Miami</div>
              <div className="text-[10px] uppercase tracking-widest text-white/20">Headquarters</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-coral">2024</div>
              <div className="text-[10px] uppercase tracking-widest text-white/20">Established</div>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-12">
        <div className="text-center space-y-4">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Global Presence</span>
          <h2 className="text-4xl font-bold uppercase tracking-tighter">FMF <span className="text-brand-coral">Locations</span></h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { city: 'Miami', region: 'Florida, USA', status: 'Headquarters' }
          ].map((loc, i) => (
            <div key={i} className="card-gradient p-8 text-center space-y-2 group hover:border-brand-teal transition-all">
              <h3 className="text-xl font-bold uppercase tracking-tighter group-hover:text-brand-teal transition-colors">{loc.city}</h3>
              <p className="text-[10px] uppercase tracking-widest text-white/40">{loc.region}</p>
              <div className="pt-4">
                <span className="text-[8px] font-bold px-2 py-1 bg-white/5 text-white/20 uppercase tracking-widest rounded">{loc.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-brand-black text-brand-white font-sans selection:bg-brand-teal selection:text-white">
            <Navbar />
            
            <main>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/program" element={<Program />} />
                  <Route path="/videos" element={<VideoLibrary />} />
                  <Route path="/athletes" element={<Athletes />} />
                  <Route path="/membership" element={<Membership showToast={showToast} />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/schedule" element={<Schedule showToast={showToast} />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/recovery" element={<Recovery />} />
                  <Route path="/retreats" element={<RetreatPage showToast={showToast} />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </AnimatePresence>
            </main>

            <Footer />

            {/* Global Toast */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 50, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: 20, x: '-50%' }}
                  className="fixed bottom-12 left-1/2 z-[200] px-8 py-4 card-gradient flex items-center gap-4 border-brand-teal/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-brand-teal' : 'bg-brand-coral'} animate-pulse`} />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{toast.message}</span>
                  <button onClick={() => setToast(null)} className="ml-4 text-white/20 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}


