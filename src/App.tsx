/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams, Navigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ProfileDashboard } from './components/profile/ProfileDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CommunityDetail } from './components/community/CommunityDetail';
import { CommunityPage } from './components/community/CommunityPage';
import { AuthCallback } from './components/auth/AuthCallback';

import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { TermsOfService } from './components/legal/TermsOfService';
import { RefundPolicy } from './components/legal/RefundPolicy';
import { LiabilityWaiver } from './components/legal/LiabilityWaiver';
import { InAppWaiverPopup } from './components/legal/InAppWaiverPopup';
import { FreeAccessGate } from './components/FreeAccessGate';
import { useSiteContent } from './hooks/useSiteContent';
import { 
  Menu, X, Instagram, Twitter, Facebook, ArrowRight, ArrowLeft,
  Play, Calendar, ShoppingBag, Info, ChevronRight, ChevronLeft,
  Dumbbell, Zap, Heart, MapPin, Clock, Star, AlertCircle,
  Filter, Search, User, Quote, Plus, Minus, Upload, Link2, Send, Bell, Trash2,
  Youtube, ExternalLink, Share2, Trophy, Check, Users, Power, Ban, Layout, Globe,
  Edit2, Truck, Eye, Printer, UserPlus, UserMinus, MoreHorizontal,
  LayoutDashboard, PlayCircle, ListChecks, MessageSquare, ClipboardList, Package as PackageIcon, History, TrendingUp, Download, ShieldCheck, Award, Shield, Bookmark, CheckCircle
} from 'lucide-react';
import { AthletesDirectory } from './components/athletes/AthletesDirectory';
import { AthleteApplicationPage } from './components/athletes/AthleteApplicationPage';
import React, { useState, useEffect, useMemo, useRef, FormEvent, createContext, useContext, ReactNode, Component } from 'react';
import { createPortal } from 'react-dom';
import { 
  Video, 
  VideoCategory,
  UserVideoUpload,
  Package, 
  Athlete, 
  Program, 
  ProgramAssignment,
  Retreat, 
  Community, 
  CommunityPost,
  CommunityComment,
  Brand,
  Product, 
  ProductCategory,
  CartItem,
  Cart,
  OrderItem,
  Order, 
  UserProfile, 
  Notification,
  ActivityLog,
  RetreatApplication,
  Booking,
  FlexMobService,
  CollaborationBrand,
  TrainingSession,
  WorkoutLog,
  PersonalBest,
  Post,
  ProgramType,
  CommunityType
} from './types';

import { supabase } from './supabase';

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
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const state = this['state'] as any;
    if (state.hasError) {
      const errorMessage: string = state.error?.message || 'An unexpected error occurred.';
      const isStorageError = errorMessage.includes('before initialization') ||
        errorMessage.includes('localStorage') ||
        errorMessage.includes('JSON');

      const handleReset = () => {
        try { localStorage.clear(); } catch (_) {}
        try { sessionStorage.clear(); } catch (_) {}
        window.location.href = window.location.origin + window.location.pathname + '#/';
      };

      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '24px', fontFamily: 'sans-serif' }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '24px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ fontSize: 28 }}>⚠️</span>
            </div>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              WINGMAN crashed on render
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              {isStorageError
                ? 'Cached app data is out of sync with the new build. Click Reset to clear it and reload.'
                : errorMessage}
            </p>
            <button
              onClick={handleReset}
              style={{ width: '100%', padding: '14px 24px', background: '#2dd4a8', color: '#000', fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', borderRadius: 12, cursor: 'pointer', marginBottom: 12 }}
            >
              Reset &amp; Reload
            </button>
            <details style={{ textAlign: 'left', marginTop: 8 }}>
              <summary style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Error details</summary>
              <pre style={{ color: '#ef4444', fontSize: 10, marginTop: 8, overflowX: 'auto', background: 'rgba(239,68,68,0.05)', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{errorMessage}</pre>
            </details>
          </div>
        </div>
      );
    }

    return (this['props'] as any).children;
  }
}

// --- Mock Data ---

const VIDEOS: Video[] = [
  { 
    id: 'v1', 
    title: 'Morning Activation', 
    description: 'Wake up your joints and nervous system with this comprehensive morning routine designed to improve mobility and mental clarity.', 
    thumbnail_url: 'https://picsum.photos/seed/fmf1/800/450', 
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', 
    duration: '15 min', 
    category_id: 'mobility',
    visibility_status: 'published',
    allowed_packages: ['basic', 'elite'],
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 'v2', 
    title: 'Full Body Power', 
    description: 'High-intensity calisthenics for total strength. This session pushes your limits with explosive movements and high-volume sets.', 
    thumbnail_url: 'https://picsum.photos/seed/fmf2/800/450', 
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', 
    duration: '45 min', 
    category_id: 'strength',
    visibility_status: 'published',
    allowed_packages: ['elite'],
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];

// Branded placeholder generator Ã¢â‚¬â€ replace with real product photos later
const placeholder = (label: string, color: string = '2dd4a8') =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect fill="#0a0a0a" width="600" height="800"/><rect fill="#${color}" opacity="0.15" width="600" height="800"/><text x="300" y="370" text-anchor="middle" fill="#${color}" font-family="sans-serif" font-size="20" font-weight="bold" letter-spacing="4">${label.toUpperCase()}</text><text x="300" y="410" text-anchor="middle" fill="#ffffff" opacity="0.3" font-family="sans-serif" font-size="12" letter-spacing="6">COMING SOON</text></svg>`)}`;

const PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    brand_id: 'fmf',
    category_id: 'apparel',
    name: 'FMF Training Shirt',
    slug: 'fmf-training-shirt',
    description: 'High-performance training shirt.',
    price: 45,
    compare_at_price: 55,
    sku: 'TSH-001',
    inventory_count: 100,
    status: 'active',
    featured_image: placeholder('FMF Training Shirt'),
    images: [placeholder('FMF Training Shirt')],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 'p2', 
    brand_id: 'fmf',
    category_id: 'gear',
    name: 'FMF Power Band Set',
    slug: 'fmf-power-band-set',
    description: 'A complete set of resistance bands for calisthenics progression.',
    price: 65,
    compare_at_price: 80,
    sku: 'GBD-001',
    inventory_count: 50,
    status: 'active',
    featured_image: placeholder('Power Band Set'),
    images: [placeholder('Power Band Set')],
    benefits: ['Increased Resistance', 'Portability', 'Versatility'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 'p3', 
    brand_id: 'cle-paris',
    category_id: 'fragrance',
    name: "CLÉ Paris L'EAU",
    slug: 'cle-paris-leau',
    description: 'A fresh, sophisticated fragrance for the modern athlete.',
    price: 120,
    compare_at_price: 150,
    sku: 'FRG-001',
    inventory_count: 30,
    status: 'active',
    featured_image: placeholder('Clé Paris', 'c4a265'),
    images: [placeholder('Clé Paris', 'c4a265')],
    ingredients: ['Bergamot', 'Sandalwood', 'Marine Accord'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 'p4', 
    brand_id: 'mike-water',
    category_id: 'nutrition',
    name: 'Recovery Green Juice',
    slug: 'recovery-green-juice',
    description: 'Cold-pressed functional juice for post-workout recovery.',
    price: 12,
    compare_at_price: 15,
    sku: 'NUT-001',
    inventory_count: 200,
    status: 'active',
    featured_image: placeholder('Green Juice', '4ade80'),
    images: [placeholder('Green Juice', '4ade80')],
    ingredients: ['Kale', 'Spinach', 'Cucumber', 'Lemon', 'Ginger'],
    benefits: ['Hydration', 'Anti-inflammatory', 'Vitamin Rich'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];

const COLLABORATIONS: CollaborationBrand[] = [
  { 
    id: 'c1', 
    name: 'SORORITY', 
    category: "Women's Fitness Lifestyle",
    description: 'Exclusive women-focused brand dedicated to empowerment through fitness, confidence, and community. Strength, femininity, and performance.',
    image: placeholder('Sorority', 'e87461'),
    link: '/shop',
    buttonText: 'View Collection'
  },
  { 
    id: 'c2', 
    name: 'FLEX MOB 305', 
    category: 'Recovery & Mobility', 
    description: 'Specializing in professional assisted stretching and muscle recovery designed to support athletes and optimize performance.',
    image: placeholder('Flex Mob 305'),
    link: '/services',
    buttonText: 'Book Now'
  },
  { 
    id: 'c3', 
    name: 'PIER ST BARTH', 
    category: 'Luxury Resort Fitness', 
    description: 'Luxury resort-inspired fitness and swimwear brand blending beach aesthetics with fitness culture and premium performance.',
    image: placeholder('Pier St Barth', '60a5fa'),
    link: '/shop',
    buttonText: 'View Collection'
  },
  { 
    id: 'c4', 
    name: 'CLÉ PARIS', 
    category: 'Luxury Fragrance & Lifestyle', 
    description: 'Represents the elegance and sophistication of the FMF lifestyle. Luxury, confidence, and personal presence for the refined athlete.',
    image: placeholder('Clé Paris', 'c4a265'),
    link: 'https://cle-paris.com',
    buttonText: 'Explore Brand'
  },
  { 
    id: 'c5', 
    name: 'MIKE WATER FITNESS', 
    category: 'Functional Nutrition', 
    description: 'Cold-pressed functional juices designed for performance, recovery, and daily balance. Clean fuel for the body without additives or artificial sugars.',
    image: placeholder('Mike Water', '4ade80'),
    link: '/shop',
    buttonText: 'Shop Juices'
  }
];

const SESSIONS: TrainingSession[] = [
  { id: 's1', title: 'Sunrise Calisthenics', time: '06:00 AM', trainer: 'Anderson Djeemo', spots: 5, type: 'Beach Training' },
  { id: 's2', title: 'Power Hour Intensity', time: '09:00 AM', trainer: 'Sarah Chen', spots: 2, type: 'Strength' },
  { id: 's3', title: 'Mobility & Flow', time: '11:00 AM', trainer: 'Marcus Thorne', spots: 10, type: 'Recovery' },
  { id: 's4', title: 'Sunset Core Blast', time: '05:30 PM', trainer: 'Anderson Djeemo', spots: 8, type: 'Mindset & Core' },
];

const RETREATS: Retreat[] = [
  { 
    id: 'r1', 
    title: 'Miami Beach Transformation Retreat', 
    description: `🏝️ THE EXPERIENCE

This is not a vacation.
This is a full lifestyle reset.

For a limited time, you will step into the FMF system:

• Structured daily training
• Clean discipline-driven routine
• Elite Miami Beach environment
• Direct access to high-level coaching

You don’t come here to "try fitness."
You come here to transform your body, your habits, and your mindset.

💰 PROGRAM OPTIONS

🔹 2-WEEK TRANSFORMATION — $15,000
Duration: June 1st – June 14th (14 Days)

Perfect for:
• Rapid reset
• Fat loss / conditioning
• Breaking bad habits
• Rebuilding discipline

Includes:
• 2 daily training sessions (morning + evening)
• Beach workouts + rooftop sessions
• Mobility, recovery & stretching sessions
• Daily structure & coaching
• Nutrition guidance
• Lifestyle discipline framework

🔸 1-MONTH FULL IMMERSION — $25,000
Duration: June 1st – June 30th (30 Days)
⚠️ STRICTLY LIMITED: ONLY 4 SPOTS AVAILABLE

This is the complete transformation.

Perfect for:
• Total body recomposition
• Long-term habit installation
• High-level physical and mental upgrade
• Lifestyle overhaul

Includes everything from the 2-week program +:
• Deeper coaching & performance tracking
• Advanced calisthenics progression
• Extended recovery & regeneration protocols
• Full integration into the FMF lifestyle system
• Stronger accountability & structure

🏋️ DAILY STRUCTURE (EXAMPLE)
8:30 AM — Rooftop Training (Strength / Calisthenics)
10:00 AM — Beach Workout (Conditioning / Mobility)
Afternoon — Recovery / Sauna / Stretching
Evening — Optional Training / Lifestyle Integration

📍 LOCATIONS
Miami Beach (Primary)
Rooftop training (hotel partnerships)
Beach training zones
Private workout environments

Exact details provided upon confirmation.

🧠 WHAT YOU GAIN
• Discipline
• Structure
• Lean, athletic body
• Increased energy
• Mental clarity
• Stronger identity

This is not temporary.
This is who you become after the program.

⚠️ IMPORTANT
• Limited spots available
• Application required
• No refunds once confirmed
• Must be 21+ to attend`,
    cover_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', 
    start_date: '2026-06-01T09:00:00Z',
    end_date: '2026-06-30T17:00:00Z',
    location: 'Miami Beach, FL', 
    price: '$15k - $25k',
    visibility_status: 'published',
    access_type: 'package_based',
    allowed_packages: ['elite'],
    allowed_users: [],
    preview_enabled: true,
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];

// --- Auth Context ---

interface AuthContextType {
  user: UserProfile | null;
  notifications: Notification[];
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, tier: string) => Promise<void>;
  logout: () => void;
  updateTier: (tier: string) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  toggleFavorite: (videoId: string) => Promise<{ success: boolean; message: string }>;
  toggleBookmark: (videoId: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateSecurity: (email?: string, password?: string) => Promise<void>;
  logActivity: (action: string, entityType: string, entityId?: string, metadata?: any) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartItemWithProduct {
  product: Product;
  quantity: number;
}

const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItemWithProduct[]>(() => {
    const saved = localStorage.getItem('fmf_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('fmf_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart: cart as any, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (userId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const sessionEmail = session?.user?.email || '';

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      // Map DB columns to app's UserProfile shape
      const profile: UserProfile = {
        ...data,
        email: data.email || sessionEmail,
        full_name: data.full_name || data.name || ((data.email || sessionEmail) ? (data.email || sessionEmail).split('@')[0] : 'Member'),
        signup_date: data.signup_date || data.joinedAt || data.created_at || new Date().toISOString(),
        role: data.role || ((data.email || sessionEmail)?.toLowerCase() === 'fashionmeetzfitness86@gmail.com' ? 'admin' : 'user'),
        status: data.status || 'active',
        created_at: data.created_at || data.signup_date || data.joinedAt || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
      setUser(profile);
      return;
    }

    // No profile row found - build user from auth session
    if (session?.user) {
      const meta = session.user.user_metadata || {};
      const displayName = meta.display_name || meta.full_name || session.user.email?.split('@')[0] || 'Member';
      const now = new Date().toISOString();

      // In-memory user for immediate UI
      const memUser: any = {
        id: session.user.id,
        full_name: displayName,
        email: session.user.email || '',
        role: session.user.email?.toLowerCase() === 'fashionmeetzfitness86@gmail.com' ? 'admin' : 'user',
        tier: 'Free',
        status: 'active',
        signup_date: now,
        created_at: now,
        updated_at: now
      };
      setUser(memUser as UserProfile);

      // Persist to DB
      const dbRow = {
        id: session.user.id,
        full_name: displayName,
        role: session.user.email?.toLowerCase() === 'fashionmeetzfitness86@gmail.com' ? 'admin' : 'user',
        tier: 'Free',
        status: 'active'
      };
      supabase.from('profiles').upsert(dbRow).then(({ error: insertErr }) => {
        if (insertErr) console.error('Auto-create profile error:', insertErr);
      });
    }
    if (error && error.code !== 'PGRST116') console.error('Fetch profile error:', error);
  };

  const fetchNotifications = async (userId: string) => {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
    if (data) setNotifications(data as Notification[]);
    if (error) console.error('Fetch notifications error:', error);
  };

  useEffect(() => {
    let realtimeChannel: any = null;
    let notifChannel: any = null;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUser(session.user.id);
        fetchNotifications(session.user.id);

        // ——— Realtime: Re-fetch profile on any profile update ———
        realtimeChannel = supabase
          .channel(`profile-sync-${session.user.id}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
            (_payload) => { fetchUser(session.user.id); }
          )
          .subscribe();

        // ——— Realtime: Re-fetch notifications on any INSERT (live bell updates) ———
        notifChannel = supabase
          .channel(`notif-live-${session.user.id}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
            (_payload) => { fetchNotifications(session.user.id); }
          )
          .subscribe();
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser(session.user.id);
        fetchNotifications(session.user.id);
      } else {
        setUser(null);
        setNotifications([]);
        if (realtimeChannel) { supabase.removeChannel(realtimeChannel); realtimeChannel = null; }
        if (notifChannel) { supabase.removeChannel(notifChannel); notifChannel = null; }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
      if (notifChannel) supabase.removeChannel(notifChannel);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Supabase returns 'Email not confirmed' when the user hasn't verified
        if (error.message.toLowerCase().includes('email not confirmed')) {
          throw new Error('EMAIL_NOT_CONFIRMED');
        }
        throw error;
      }

      // Double-check: if we somehow got a session for an unconfirmed user
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error('EMAIL_NOT_CONFIRMED');
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, tier: string) => {
    try {
      // Build the redirect URL for email confirmation
      // In production this will be https://fitnesspowerhour.com/auth/callback
      // In dev it will be http://localhost:5173/auth/callback (handled by HashRouter as /#/auth/callback)
      const redirectUrl = `${window.location.origin}${window.location.pathname}#/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { display_name: name },
          emailRedirectTo: redirectUrl
        }
      });
      if (error) throw error;

      // Check if Supabase returned a user with an unconfirmed email
      // (identities array is empty when the user already exists)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('This email is already registered. Try logging in instead.');
      }

      if (data.user) {
        // Create a profile row immediately so it's ready when the user confirms
        const dbRow = {
          id: data.user.id,
          full_name: name,
          email,
          role: email.toLowerCase() === 'fashionmeetzfitness86@gmail.com' ? 'admin' : 'user',
          tier: 'Free',
          status: 'active',
          signup_date: new Date().toISOString()
        };
        await supabase.from('profiles').insert(dbRow);
      }

      // Sign out immediately — user must confirm email before accessing the app
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateTier = async (tier: string) => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      await supabase.from('profiles').update({ tier }).eq('id', session.user.id);
      fetchUser(session.user.id);
    } catch (error) {
      console.error('Error updating tier:', error);
    }
  };

  const addNotification = async (notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Only skip self-notifications for social types — system/milestone notifications should always fire
      const socialTypes = ['like', 'comment', 'follow', 'mention'];
      if (socialTypes.includes(notif.type) && notif.user_id === session?.user?.id) return;

      await supabase.from('notifications').insert({
        ...notif,
        created_at: new Date().toISOString(),
        is_read: false
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) fetchNotifications(session.user.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id).eq('is_read', false);
      fetchNotifications(session.user.id);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const toggleFavorite = async (videoId: string) => {
    if (!user) return { success: false, message: 'Must be logged in to like videos' };
    try {
      const hasActiveMembership = !!(user.tier === 'Basic' || user.membership_status === 'active' || user.role === 'admin' || user.role === 'super_admin' || user.role === 'athlete');
      if (!hasActiveMembership) {
        return { success: false, message: 'Upgrade to membership to like and save videos to your program.' };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { success: false, message: 'Session expired' };
      
      const currentFavorites = user.favorites || [];
      const isFavorited = currentFavorites.includes(videoId);
      const newFavorites = isFavorited
        ? currentFavorites.filter(id => id !== videoId)
        : [...currentFavorites, videoId];

      setUser({ ...user, favorites: newFavorites }); // Optimistic update

      const { error } = await supabase.from('profiles').update({ favorites: newFavorites }).eq('id', session.user.id);
      if (error) {
        // Revert optimistic update
        setUser(user);
        throw error;
      }
      fetchUser(session.user.id);
      
      return { success: true, message: isFavorited ? 'Removed from liked videos.' : 'Video liked and added to My Program.' };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, message: "Failed to update liked videos. Please check if the 'favorites' column exists." };
    }
  };

  const toggleBookmark = async (videoId: string) => {
    if (!user) return { success: false, message: 'Must be logged in to bookmark videos' };
    try {
      const hasActiveMembership = !!(user.tier === 'Basic' || user.membership_status === 'active' || user.role === 'admin' || user.role === 'super_admin' || user.role === 'athlete');
      if (!hasActiveMembership) {
        return { success: false, message: 'Upgrade to membership to bookmark videos and build your program.' };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { success: false, message: 'Session expired' };
      
      const currentBookmarks = user.bookmarks || [];
      const isBookmarked = currentBookmarks.includes(videoId);

      if (!isBookmarked && currentBookmarks.length >= 5) {
        return { success: false, message: 'You can only bookmark up to 5 videos in My Program. Remove one to add another.' };
      }

      const newBookmarks = isBookmarked
        ? currentBookmarks.filter(id => id !== videoId)
        : [...currentBookmarks, videoId];

      setUser({ ...user, bookmarks: newBookmarks }); // Optimistic update

      const { error } = await supabase.from('profiles').update({ bookmarks: newBookmarks }).eq('id', session.user.id);
      if (error) {
        // Revert optimistic update
        setUser(user);
        throw error;
      }
      fetchUser(session.user.id);
      
      return { success: true, message: isBookmarked ? 'Video removed from My Program.' : 'Video bookmarked and added to My Program.' };
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return { success: false, message: "Failed to update bookmarks. Please check if the 'bookmarks' column exists." };
    }
  };

  const updateProfile = async (profileUpdate: Partial<UserProfile>) => {
    if (!user) return;
    try {
      setUser({ ...user, ...profileUpdate } as UserProfile); // Optimistic update
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Strip keys that do not belong in the 'profiles' SQL table schema
      const { email, ...cleanProfileUpdate } = profileUpdate;

      const { error } = await supabase.from('profiles').update({
        ...cleanProfileUpdate
      }).eq('id', session.user.id);

      if (error) {
        // If error is about a missing column (schema cache), strip the offending field and retry
        const missingColMatch = error.message?.match(/column "?(\w+)"? of relation/i) ||
                                error.message?.match(/Could not find the '(\w+)' column/i);
        if (missingColMatch) {
          const badCol = missingColMatch[1];
          console.warn(`Column '${badCol}' not in DB schema yet — saving without it.`);
          const { [badCol as keyof typeof cleanProfileUpdate]: _removed, ...safeUpdate } = cleanProfileUpdate as any;
          const { error: retryError } = await supabase.from('profiles').update(safeUpdate).eq('id', session.user.id);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
      fetchUser(session.user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateSecurity = async (email?: string, password?: string) => {
    try {
      const updates: any = {};
      if (email) updates.email = email;
      if (password) updates.password = password;

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      // If email was updated, update core profile too
      if (email && user) {
        await supabase.from('profiles').update({ email }).eq('id', user.id);
        fetchUser(user.id);
      }
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}#/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  const logActivity = async (action: string, entityType: string, entityId?: string, metadata?: any) => {
    if (!user) return;
    try {
      await supabase.from('activity_logs').insert({
        actor_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
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
      toggleFavorite,
      toggleBookmark,
      updateProfile,
      updateSecurity,
      logActivity,
      sendPasswordResetEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Components ---

interface LandingAthlete {
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

const LANDING_ATHLETES: LandingAthlete[] = [
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
    name: 'Anderson Djeemo',
    role: 'Elite Calisthenics Trainer',
    philosophy: 'True strength is built from the ground up. Master the basics, and the impossible becomes routine.',
    image: 'https://picsum.photos/seed/anderson/800/1000',
    social: { instagram: '@anderson_djeemo', twitter: '@adjeemo' }
  }
];

const NotificationBell = () => {
  const { notifications, markAsRead, clearNotifications } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const unreadCount = notifications.filter((n: any) => !n.is_read && n.status !== 'read').length;

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
                ) : notifications.map((notif) => {
                  const route = (notif as any).metadata?.route || '';
                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        setSelectedNotif(notif);
                        setIsOpen(false);
                      }}
                      className={`p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${!(notif as any).is_read ? 'bg-brand-teal/5' : ''}`}
                    >
                      <div className="flex gap-3 items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${notif.type === 'milestone' || notif.type === 'system' ? 'bg-brand-teal/20 text-brand-teal' : 'bg-brand-coral/20 text-brand-coral'}`}>
                          {((notif as any).title || '?').charAt(0)}
                        </div>
                        <div className="flex-grow space-y-1">
                          <p className="text-[11px] text-white/80 leading-tight">
                            <span className="font-bold text-white">{notif.title}</span>
                          </p>
                          <p className="text-[10px] text-white/40 italic truncate max-w-[180px]">{(notif as any).message || ''}</p>
                          <p className="text-[8px] text-white/20 uppercase tracking-widest">{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {!(notif as any).is_read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Detail Modal using Portal to escape navbar stacking context constraints */}
      {createPortal(
        <AnimatePresence>
          {selectedNotif && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                onClick={() => setSelectedNotif(null)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-brand-black border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-[10000]"
              >
                <div className="p-8 space-y-6">
                  <button 
                    onClick={() => setSelectedNotif(null)}
                    className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="flex items-start gap-4 border-b border-white/5 pb-6">
                     <div className={`w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center text-lg font-black ${selectedNotif.type === 'milestone' || selectedNotif.type === 'system' ? 'bg-brand-teal/20 text-brand-teal' : 'bg-brand-coral/20 text-brand-coral'}`}>
                       {((selectedNotif as any).title || '?').charAt(0)}
                     </div>
                     <div>
                       <h3 className="text-xl font-black uppercase tracking-tight leading-tight">{selectedNotif.title}</h3>
                       <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-bold">
                         {new Date(selectedNotif.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                       </p>
                     </div>
                  </div>

                  <div className="text-sm text-white/80 leading-relaxed font-medium whitespace-pre-wrap px-2 text-left">
                    {selectedNotif.message}
                  </div>

                  <div className="pt-6 border-t border-white/5 flex flex-col justify-end gap-3">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold text-center mb-1">FMF Notification System</p>
                    
                    {selectedNotif.metadata?.route && (
                      <button
                        onClick={() => {
                          const route = selectedNotif.metadata.route;
                          if (route.startsWith('http://') || route.startsWith('https://')) {
                             window.open(route, '_blank');
                          } else {
                             const cleanRoute = route.startsWith('/') ? route : '/' + route;
                             window.location.href = window.location.origin + window.location.pathname + '#' + cleanRoute;
                          }
                          setSelectedNotif(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-brand-teal text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                      >
                        <Link2 size={14} /> Open Attached Link
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedNotif(null)}
                      className="w-full py-4 bg-white/5 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all"
                    >
                      Close Message
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [athletesPopup, setAthletesPopup] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Auto-close Athletes popup after 3 seconds
  useEffect(() => {
    if (!athletesPopup) return;
    const t = setTimeout(() => setAthletesPopup(false), 3000);
    return () => clearTimeout(t);
  }, [athletesPopup]);

  const hasActiveMembership = !!(user && (
    user.tier === 'Basic' ||
    user.membership_status === 'active' ||
    user.role === 'admin' ||
    user.role === 'super_admin' ||
    user.role === 'athlete'
  ));

  const navLinks = user ? [
    { name: 'Home', path: '/profile' },
    ...(hasActiveMembership ? [{ name: 'Videos', path: '/videos' }] : []),
    { name: 'Community', path: '/community' },
    { name: 'Shop', path: '/shop' },
    { name: 'Retreats', path: '/retreats' },
    { name: 'Services', path: '/services' },
    ...(user?.role === 'admin' || user?.role === 'super_admin' ? [{ name: 'Admin', path: '/admin/dashboard' }] : []),
  ] : [
    { name: 'Home', path: '/' },
    { name: 'Philosophy', path: '/philosophy' },
    { name: 'Athletes', path: '/athletes', comingSoon: true },
    { name: 'Community', path: '/community' },
    { name: 'Shop', path: '/shop' },
    { name: 'Retreats', path: '/retreats' },
    { name: 'Services', path: '/services' },
    { name: 'Membership', path: '/membership' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to={user ? '/profile' : '/'} className="flex flex-col leading-none">
          <span className="text-xl font-bold tracking-tighter text-brand-teal uppercase">Fitness Power Hour</span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">by Fashion meetz Fitness</span>
        </Link>

        <div className="hidden lg:flex space-x-8">
          {navLinks.map((link: any) => {
            const isMembership = link.name === 'Membership';
            const finalPath = isMembership && user && user.tier === 'Basic' ? '/profile#membership' : link.path;
            if (link.comingSoon) {
              return (
                <button
                  key={link.name}
                  onClick={() => setAthletesPopup(true)}
                  className="text-xs uppercase tracking-widest transition-colors text-white/60 hover:text-white"
                >
                  {link.name}
                </button>
              );
            }
            return (
              <Link
                key={link.name}
                to={finalPath}
                className={`text-xs uppercase tracking-widest transition-colors ${
                  location.pathname === link.path ? 'text-brand-coral' : 'text-white/60 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-6">
          {user ? (
            <div className="hidden lg:flex items-center space-x-4">
              <NotificationBell />
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <Link to="/admin/dashboard" className="px-4 py-2 bg-brand-teal/10 border border-brand-teal/30 hover:bg-brand-teal hover:text-black rounded-full transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} /> Admin Dashboard
                </Link>
              )}
              <Link to="/profile" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-teal" title="Profile Dashboard">
                <User size={18} />
              </Link>
              <Link to="/order-history" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-teal" title="Order History">
                <ShoppingBag size={18} />
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
              {navLinks.map((link: any) => {
                const isMembership = link.name === 'Membership';
                const finalPath = isMembership && user && user.tier === 'Basic' ? '/profile#membership' : link.path;
                if (link.comingSoon) {
                  return (
                    <button
                      key={link.name}
                      onClick={() => { setAthletesPopup(true); setIsOpen(false); }}
                      className="text-lg uppercase tracking-widest text-white/70 hover:text-brand-coral transition-colors text-left"
                    >
                      {link.name}
                    </button>
                  );
                }
                return (
                <Link
                  key={link.name}
                  to={finalPath}
                  onClick={() => setIsOpen(false)}
                  className="text-lg uppercase tracking-widest text-white/70 hover:text-brand-coral transition-colors"
                >
                  {link.name}
                </Link>
                );
              })}
              <div className="pt-6 border-t border-white/5">
                {user ? (
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Link 
                          to="/profile" 
                          onClick={() => setIsOpen(false)}
                          className="text-white/60 hover:text-brand-teal transition-colors flex items-center gap-2 text-xs uppercase tracking-widest"
                        >
                          <User size={16} /> Profile Dashboard
                        </Link>
                        {(user?.role === 'admin' || user?.role === 'super_admin') && (
                          <Link 
                            to="/admin/dashboard" 
                            onClick={() => setIsOpen(false)}
                            className="text-brand-teal flex items-center gap-2 text-xs uppercase tracking-widest font-black"
                          >
                            <Shield size={16} /> Admin Dashboard
                          </Link>
                        )}
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

      {/* Athletes Coming Soon Popup */}
      <AnimatePresence>
        {athletesPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setAthletesPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-brand-teal/20 rounded-3xl p-10 w-full max-w-sm text-center shadow-2xl relative"
            >
              <button
                onClick={() => setAthletesPopup(false)}
                className="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
              <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-teal/20">
                <Users size={28} className="text-brand-teal" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Athletes</h2>
              <p className="text-[11px] uppercase tracking-[0.3em] font-black text-brand-teal mb-3">Coming Soon</p>
              <p className="text-white/40 text-xs leading-relaxed">
                Our athlete roster is in final preparation. Check back soon for the full directory of FMF elite trainers.
              </p>
              <div className="mt-6 h-0.5 w-16 bg-brand-teal/30 mx-auto rounded-full">
                <motion.div
                  className="h-full bg-brand-teal rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = ({ showToast }: { showToast?: (msg: string, type?: 'success' | 'error') => void }) => (
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
          <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
          <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
          <li><Link to="/refund" className="hover:text-white">Refund Policy</Link></li>
          <li><Link to="/liability" className="hover:text-white">Liability Waiver</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="text-white text-xs uppercase tracking-widest mb-8">Join the Community</h3>
        <p className="text-white/40 text-sm mb-6">Subscribe for training tips and exclusive drops.</p>
        <form className="space-y-4" onSubmit={(e) => { 
          e.preventDefault(); 
          if (showToast) showToast('Thank you for subscribing!', 'success');
        }}>
          <div className="flex flex-col space-y-3">
            <input
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-teal transition-colors"
              required
            />
            <button 
              type="submit"
              className="w-full bg-brand-teal text-black text-[10px] font-bold uppercase tracking-[0.2em] py-3 rounded-lg hover:bg-brand-teal/90 transition-all"
            >
              Subscribe Now
            </button>
          </div>
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] leading-relaxed">
            By subscribing, you agree to our <Link to="/privacy" className="text-white/40 hover:text-white underline underline-offset-4">Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-[10px] uppercase tracking-[0.3em] text-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
      <span>© 2026 Fitness Power Hour. All Rights Reserved.</span>
      <span>Miami Beach</span>
    </div>
  </footer>
);

const MembershipGate = ({ isOpen, onClose, navigate }: { isOpen: boolean, onClose: () => void, navigate: any }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-black/95 backdrop-blur-2xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="card-gradient p-12 lg:p-16 max-w-2xl w-full relative z-10 space-y-12 rounded-[4rem] border border-brand-teal/20 text-center overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <ShieldCheck size={200} />
          </div>
          
          <div className="space-y-4 relative z-10">
            <div className="w-20 h-20 bg-brand-teal/10 rounded-3xl flex items-center justify-center text-brand-teal mx-auto border border-brand-teal/20">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">Unlock <span className="text-brand-teal">Access</span></h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">Authorized Personnel Only</p>
          </div>

          <div className="grid grid-cols-1 gap-4 relative z-10">
            <button 
              onClick={() => { onClose(); navigate('/membership'); }}
              className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-brand-teal transition-all text-left flex justify-between items-center"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-brand-teal font-black">Full Experience</span>
                <h4 className="text-xl font-bold uppercase tracking-tight">Select a Membership</h4>
              </div>
              <ChevronRight className="text-white/20 group-hover:text-brand-teal transition-colors" />
            </button>


          </div>

          <button 
            onClick={onClose}
            className="text-[10px] uppercase tracking-[0.5em] text-white/20 hover:text-white transition-colors pt-4 font-black"
          >
            Return to Surface
          </button>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Pages ---

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { get, loading } = useSiteContent();
  const [isGateOpen, setIsGateOpen] = useState(false);
  const isMember = user && (user.tier === 'Basic' || user.role === 'admin' || user.role === 'super_admin' || user.role === 'athlete');

  const handleProgramClick = () => {
    if (!isMember) navigate('/membership');
    else navigate('/profile#programs');
  };

  return (
    <div className="pt-20 bg-brand-black min-h-screen pb-32">
      {/* 1. HERO */}
      <section className="relative h-[90vh] flex items-center justify-center text-center overflow-hidden border-b border-brand-teal/20">
        <div className="absolute inset-0 z-0">
          <img
            src={get('home_hero_bg_image', 'https://picsum.photos/seed/fmf-hero/1920/1080')}
            alt="Hero"
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-8 fade-in">
          <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter text-white">
            {get('home_hero_title', 'Own Your Power').split(' ').map((word, i) => i === 0 ? <span key={i} className="text-brand-coral">{word} </span> : <span key={i}>{word} </span>)}
          </h1>
          <p className="text-white/60 text-lg md:text-2xl font-light uppercase tracking-widest">
            {get('home_hero_subtitle', 'The ultimate membership-based accountability platform.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <button onClick={handleProgramClick} className="btn-primary px-12 py-5 text-sm uppercase tracking-widest font-bold">
              Start Your Program
            </button>
            <button onClick={() => navigate('/membership')} className="btn-outline px-12 py-5 text-sm uppercase tracking-widest font-bold border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-black transition-all">
              Join for Free
            </button>
          </div>
        </div>
      </section>

      {/* 2. WHAT FMF IS */}
      <section className="py-32 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white">What is FMF?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Train', 'Recover', 'Elevate'].map((block, i) => (
              <div key={i} className="card-gradient p-12 aspect-square flex flex-col items-center justify-center text-center group transition-all hover:border-brand-teal/50 transition-all">
                <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-6 group-hover:scale-110 transition-transform">
                  {i === 0 ? <Dumbbell size={32} /> : i === 1 ? <Heart size={32} /> : <Zap size={32} />}
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-widest">{block}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-32 px-6 bg-white/5 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-brand-teal">How It Works</h2>
            <p className="text-white/50 text-sm uppercase tracking-widest">3 Simple Steps to Mastery</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Join', desc: 'Secure your membership & clear your mind.' },
              { num: '02', title: 'Train', desc: 'Follow structured, high-accountability phases.' },
              { num: '03', title: 'Track', desc: 'Engage the daily loop and compound growth.' }
            ].map((step, i) => (
              <div key={i} className="relative p-12 border border-white/10 rounded-[3rem] bg-brand-black shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="text-8xl font-black text-white/5 absolute -top-4 -left-2">{step.num}</div>
                <div className="relative z-10 pt-4 space-y-4">
                  <h4 className="text-2xl font-black uppercase tracking-widest">{step.title}</h4>
                  <p className="text-white/40 text-sm leading-relaxed max-w-[200px]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.5 SOCIAL PROOF */}
      <section className="py-32 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
             <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">Real Results</span>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white">The FMF <span className="text-brand-coral">Legion</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
               { name: 'Alex M.', role: 'Elite Member', quote: 'This system rebuilt my foundation. The discipline naturally translated to the rest of my life.' },
               { name: 'Sarah T.', role: 'FMF Protocol', quote: 'I stopped guessing. Checked in daily, followed the schedule, and hit goals I thought were years away.' },
               { name: 'David R.', role: 'Athlete', quote: 'Best training environment period. The tools, the timeline, the community. Unmatched.' }
            ].map((testimonial, i) => (
               <div key={i} className="card-gradient p-10 rounded-[3rem] border border-white/10 space-y-6">
                 <div className="flex text-brand-coral"><Star size={16}/><Star size={16}/><Star size={16}/><Star size={16}/><Star size={16}/></div>
                 <p className="text-white/60 text-lg italic leading-relaxed">"{testimonial.quote}"</p>
                 <div>
                    <h4 className="text-sm font-bold uppercase">{testimonial.name}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-brand-teal mt-1">{testimonial.role}</p>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROGRAM PHASES */}
      <section className="py-32 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">Program <span className="text-brand-coral">Phases</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((phase) => (
              <div 
                key={phase} 
                onClick={handleProgramClick}
                className="group cursor-pointer card-gradient overflow-hidden flex flex-col hover:border-brand-coral/50 transition-all border border-white/10"
              >
                <div className="aspect-video bg-white/5 relative flex items-center justify-center">
                  <h1 className="text-8xl font-black text-white/20 group-hover:text-brand-coral/40 transition-colors">P{phase}</h1>
                  {!isMember && (
                    <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ShieldCheck size={32} className="text-brand-coral" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-white">Join to Unlock</span>
                    </div>
                  )}
                </div>
                <div className="p-8 text-center bg-brand-black/50">
                  <h3 className="text-xl font-bold uppercase tracking-widest">Phase {phase}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MEMBERSHIP SECTION */}
      <section className="py-32 px-6 bg-brand-teal/5 border-y border-brand-teal/20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-brand-teal/10 blur-[100px] rounded-full" />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter text-white">
            Create Your <span className="text-brand-teal">Profile</span>
          </h2>
          <div className="flex justify-center">
            <div className="w-full max-w-md card-gradient p-12 space-y-8 border border-brand-teal shadow-[0_0_50px_rgba(45,212,191,0.15)] relative bg-brand-black">
              <div className="absolute -top-4 -right-4 bg-brand-teal text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm rotate-3">
                Join Now
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-widest text-center text-white">FMF Basic</h3>
              <div className="text-center">
                <span className="text-6xl font-black text-white">Free</span>
                <span className="text-white/40 text-xs uppercase tracking-widest pl-2">Access</span>
              </div>
              <ul className="space-y-4 text-left text-sm text-white/70">
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-teal"/> Create Your Athlete Profile</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-teal"/> Preview Training Programs</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-teal"/> Access Community Forums</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-brand-teal"/> VIP FMF Store Access</li>
              </ul>
              <button onClick={() => navigate('/membership')} className="w-full btn-primary bg-brand-teal text-black border-transparent shadow-glow-teal hover:scale-105 transition-all">
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SERVICES SECTION */}
      <section className="py-32 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Exclusive</span>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">Premium <span className="text-white">Services</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-gradient p-12 space-y-8 group border border-white/10 hover:border-brand-teal/30 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold uppercase tracking-tighter">Flex Mob <span className="text-brand-coral">305</span></h3>
                <p className="text-white/50 text-sm leading-relaxed">Professional assisted stretching and physiological recovery designed for systemic elevation.</p>
              </div>
              <button onClick={() => navigate('/profile#calendar')} className="btn-outline w-full uppercase tracking-widest text-[10px] hover:bg-brand-coral/10 hover:text-brand-coral hover:border-brand-coral">Request Session</button>
            </div>
            
            <div className="card-gradient p-12 space-y-8 group border border-white/10 hover:border-brand-teal/30 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold uppercase tracking-tighter">1-on-1 <span className="text-brand-teal">Training</span></h3>
                <p className="text-white/50 text-sm leading-relaxed">High-density personal instruction focused on strict form, discipline, and kinetic mastery.</p>
              </div>
              <button onClick={() => navigate('/profile#calendar')} className="btn-outline w-full uppercase tracking-widest text-[10px] hover:bg-brand-teal/10 hover:text-brand-teal hover:border-brand-teal">Request Services</button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SHOP SECTION */}
      <section className="py-32 px-6 bg-white/5 border-b border-white/10">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <ShoppingBag size={48} className="mx-auto text-brand-teal opacity-50" />
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">Official <span className="text-brand-coral border-b-2 border-brand-coral pb-1">Apparel</span></h2>
          <p className="text-white/60 text-lg uppercase tracking-widest">Exclusive access for active members only.</p>
          <button onClick={() => navigate('/shop')} className="btn-secondary px-12 py-4">Visit Store</button>
        </div>
      </section>

      {/* 8. RETREATS */}
      <section className="py-32 px-6 relative overflow-hidden border-b border-white/10 bg-brand-coral/5">
        <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://picsum.photos/seed/retreat-bg/1920/1080')] bg-cover bg-center" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-10">
          <h2 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter italic text-white/90">
            FMF <span className="text-brand-coral">Retreats</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto uppercase tracking-[0.2em] text-xs leading-loose">
            {get('home_retreats_description', 'Step fully off the grid. Immerse yourself in a guided physical and mental overhaul at our exclusive global destinations.')}
          </p>
          <button onClick={() => navigate('/retreats')} className="btn-outline border-brand-coral text-brand-coral hover:bg-brand-coral hover:text-black px-10">
            Explore Retreats
          </button>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-40 px-6 bg-brand-teal/5">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter">It Ends <br/><span className="text-brand-teal">With You</span></h2>
          <p className="text-white/40 uppercase tracking-widest text-sm max-w-lg mx-auto">
            Everything you need. Zero distractions. Build discipline today.
          </p>
          <button onClick={() => navigate('/membership')} className="btn-primary shadow-[0_0_40px_rgba(45,212,191,0.4)] px-16 py-6 text-xl rounded-2xl hover:scale-105 transition-all w-full md:w-auto mt-8">
            Start Your Program
          </button>
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
                With over 20 ye— Michael Leggett is the architect of the Fitness Power Hour program. His journey began as a street athlete, mastering the raw strength of calisthenics in urban environments.
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
                "Your body is the first tool you were given. Learning how to use it changes everything."
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
      weeks: 'Weeks 1-4',
      focus: ['Mobility', 'Core Stability', 'Body Control'],
      exercises: ['Push-ups', 'Squats', 'Planks', 'Lunges'],
      goal: 'Prepare the body for more advanced training.',
      color: 'brand-teal'
    },
    {
      title: 'Power',
      weeks: 'Weeks 5-8',
      focus: ['Explosive Strength', 'Endurance', 'Conditioning'],
      exercises: ['Jump Squats', 'Pull-ups', 'Burpees', 'Core Circuits'],
      goal: 'Build athletic performance.',
      color: 'brand-coral'
    },
    {
      title: 'Mastery',
      weeks: 'Weeks 9-12',
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

        {/* Session Structure Removed */}
      </div>
    </section>
  );
};

const ProgramPage = () => {
  const navigate = useNavigate();
  return (
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
            <button onClick={() => navigate('/membership')} className="btn-primary">Get Started</button>
            <Link to="/videos" className="btn-outline inline-block">View Library</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

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

      <div className="w-full max-w-6xl space-y-8">
        <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative">
          {video.source_type === 'youtube' ? (
            <iframe
              id={`yt-player-${video.id}`}
              src={`https://www.youtube.com/embed/${video.video_url?.split('v=')[1]}?autoplay=1&enablejsapi=1`}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={(e) => {
                const iframe = e.target as HTMLIFrameElement;
                if (!iframe.contentWindow) return;
                // Add event listener for YouTube postMessage
                const handleMessage = (event: MessageEvent) => {
                  if (event.origin !== 'https://www.youtube.com') return;
                  try {
                    const data = JSON.parse(event.data);
                    if (data.event === 'infoDelivery' && data.info) {
                      // We can track milestone progress here if needed via data.info.currentTime
                    }
                    if (data.event === 'onStateChange' && data.info === 0) {
                      // 0 = ENDED
                      if (onClose) onClose(); 
                    }
                  } catch (err) {}
                };
                window.addEventListener('message', handleMessage);
                return () => window.removeEventListener('message', handleMessage);
              }}
            />
          ) : video.source_type === 'upload' ? (
            <div className="w-full h-full flex items-center justify-center bg-brand-teal/5">
              <div className="text-center space-y-4">
                <Upload size={48} className="text-brand-teal mx-auto" />
                <p className="text-white/60 uppercase tracking-widest text-sm">Simulated Video Playback</p>
                <p className="text-white/20 text-xs">File: {video.video_url}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-coral/5">
              <div className="text-center space-y-4">
                <Link2 size={48} className="text-brand-coral mx-auto" />
                <p className="text-white/60 uppercase tracking-widest text-sm">External Link Redirect</p>
                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">Open External Link</a>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-4">
            <span className="text-brand-teal text-[10px] uppercase tracking-[0.4em] font-bold">{video.category_id}</span>
            <span className="text-brand-coral text-[10px] uppercase tracking-widest border border-brand-coral/20 px-2 py-0.5 rounded">{video.level}</span>
          </div>
          <h2 className="text-4xl font-bold uppercase tracking-tighter leading-none">{video.title}</h2>
          <p className="text-white/60 text-lg font-light leading-relaxed">
            {video.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const VideoUploadModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (v: Video) => void }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Full Body Workouts',
    duration: '',
    level: 'Beginner' as const,
    description: '',
    source_type: 'youtube' as const,
    video_url: '',
    visibility: 'everyone' as const
  });
  const [benefitsInput, setBenefitsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  if (!user || !(user.role === 'admin' || user.role === 'super_admin')) {
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newVideo: Video = {
      ...formData,
      id: `v-${Date.now()}`,
      thumbnail: `https://picsum.photos/seed/${Date.now()}/800/450`,
      benefits: benefitsInput ? benefitsInput.split(',').map(b => b.trim()) : ['Community Training', 'Performance', 'Discipline'],
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim().toLowerCase()) : [],
      createdAt: new Date().toISOString()
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

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Visibility</label>
            <select 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
              value={formData.visibility}
              onChange={e => setFormData({...formData, visibility: e.target.value as any})}
            >
              <option value="everyone">Everyone</option>
              <option value="Basic">Basic</option>
              <option value="Elite">Elite</option>
            </select>
          </div>

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
                value={benefitsInput}
                onChange={e => setBenefitsInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Tags (comma separated)</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
              placeholder="mobility, morning, beginner"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
            />
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
                  onClick={() => setFormData({...formData, source_type: type as any})}
                  className={`flex-1 py-3 rounded-xl border text-[10px] uppercase tracking-widest transition-all ${
                    formData.source_type === type ? 'bg-brand-teal border-brand-teal text-white' : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">
              {formData.source_type === 'youtube' ? 'YouTube URL' : formData.source_type === 'upload' ? 'File Name' : 'External Link'}
            </label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
              placeholder={formData.source_type === 'youtube' ? 'https://youtube.com/watch?v=...' : ''}
              value={formData.video_url}
              onChange={e => setFormData({...formData, video_url: e.target.value})}
            />
          </div>

          <button type="submit" className="btn-primary w-full py-4">Add to Library</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const VideoLibrary = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void }) => {
  const { user, toggleFavorite, toggleBookmark } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState('All');
  const [activeDuration, setActiveDuration] = useState('All');
  const [localVideos, setLocalVideos] = useState<Video[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleAddVideo = async (video: Video) => {
    try {
      await supabase.from('videos').upsert({ ...video });
    } catch (error) {
      console.error('Error adding video:', error);
    }
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        let query = supabase.from('videos').select('*');
        if (!(user?.role === 'admin' || user?.role === 'super_admin')) {
          query = query.eq('visibility_status', 'published');
        }
        const { data, error } = await query;
        if (error) throw error;
        if (data && data.length > 0) {
          setLocalVideos(data as Video[]);
        } else {
          setLocalVideos(VIDEOS);
        }
      } catch (error) {
        console.error('VideoLibrary error:', error);
        setLocalVideos(VIDEOS);
      }
    };
    fetchVideos();
  }, [user]);

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
      // Always allow visualization of published content (drafts are excluded in fetch)
      const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
      const matchesLevel = activeLevel === 'All' || v.level === activeLevel;
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (v.tags && v.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
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
              {user && (
                <button 
                  onClick={() => { window.location.hash = '#/profile#programs'; }}
                  className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-brand-teal transition-colors"
                >
                  <ChevronLeft size={14} /> Back to My Program
                </button>
              )}
              <h1 className="text-5xl font-bold uppercase tracking-tighter mb-4">Video <span className="text-brand-teal">Library</span></h1>
              <p className="text-white/40 uppercase tracking-widest text-xs">Master your movement with guided sessions</p>
            </div>

            {user && (user.tier !== 'Basic' || user.role === 'admin' || user.role === 'super_admin' || user.role === 'athlete') && (
              <button
                onClick={() => { window.location.hash = '#/profile#programs'; }}
                className="px-8 py-4 bg-brand-teal text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:shadow-glow-teal transition-all flex items-center gap-2 shadow-lg w-full md:w-auto justify-center"
              >
                <PlayCircle size={16} /> See My Program
              </button>
            )}
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
                className={`card-gradient overflow-hidden group cursor-pointer ${video.is_premium && (!user?.tier || user.tier === 'None') ? 'opacity-90 grayscale-[0.2]' : ''}`}
                onClick={() => {
                   if (video.is_premium && (!user?.tier || user.tier === 'None') && user?.role !== 'admin' && user?.role !== 'super_admin') {
                       window.location.hash = '#/profile#membership';
                   } else {
                       navigate(`/video/${video.id}`);
                   }
                }}
              >
                <div className="relative aspect-video">
                  <img src={video.thumbnail_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'; }} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                  
                  {video.is_premium ? (
                    <div className="absolute top-4 left-4 bg-brand-coral border border-brand-coral/50 text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded shadow-lg z-10">
                      Members Only
                    </div>
                  ) : (
                    <div className="absolute top-4 left-4 bg-brand-teal border border-brand-teal/50 text-black text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded shadow-lg z-10">
                      Free Access
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center">
                    {video.is_premium && (!user?.tier || user.tier === 'None') && user?.role !== 'admin' && user?.role !== 'super_admin' ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-black/80 rounded-full flex items-center justify-center shadow-2xl border border-brand-coral/50">
                          <Zap size={20} className="text-brand-coral" />
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-brand-coral font-bold bg-black/80 px-2 py-1 rounded">Unlock to Watch</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-brand-teal/80 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform shadow-2xl backdrop-blur-sm">
                        <Play fill="white" size={20} className="translate-x-0.5" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        const { success, message } = await toggleBookmark(video.id);
                        if (showToast) showToast(message, success ? 'success' : 'error');
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-all ${
                        user?.bookmarks?.includes(video.id) 
                          ? 'bg-brand-teal text-black' 
                          : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80'
                      }`}
                    >
                      <Bookmark size={14} className={user?.bookmarks?.includes(video.id) ? 'fill-black' : ''} />
                    </button>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        const { success, message } = await toggleFavorite(video.id);
                        if (showToast) showToast(message, success ? 'success' : 'error');
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-all ${
                        user?.favorites?.includes(video.id) 
                          ? 'bg-brand-coral text-white' 
                          : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80'
                      }`}
                    >
                      <Heart size={14} className={user?.favorites?.includes(video.id) ? 'fill-white' : ''} />
                    </button>
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase tracking-widest flex items-center gap-2">
                      {video.isPremium && <Zap size={10} className="text-brand-coral" />}
                      {video.source_type === 'youtube' && <Youtube size={12} className="text-red-500" />}
                      {video.source_type === 'upload' && <Upload size={12} className="text-brand-teal" />}
                      {video.source_type === 'link' && <ExternalLink size={12} className="text-brand-coral" />}
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
                      {(video.benefits || []).map((b, i) => (
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
        {isUploadModalOpen && (
          <VideoUploadModal 
            onClose={() => setIsUploadModalOpen(false)} 
            onAdd={handleAddVideo}
          />
        )}
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

  const { user } = useAuth();

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

    if (!user) {
      showToast('You must be logged in to book a session.', 'error');
      return;
    }

    setIsSending(true);

    try {
      if (bookingSession) {
        const response = await fetch('/.netlify/functions/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'service',
            serviceName: bookingSession.title,
            priceAmount: bookingSession.type.toLowerCase().includes('flex') ? 150 : 120,
            selectedDate: selectedDate.toISOString().split('T')[0],
            selectedTime: bookingSession.time,
            userId: user.id,
            userEmail: userEmail || user.email
          })
        });
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
          return; // Stop here, redirecting
        } else {
          throw new Error(data.error || 'Failed to initialize checkout');
        }
      }
    } catch (error) {
      console.error('Error creating booking checkout:', error);
      showToast('Checkout protocol failed to sync.', 'error');
    }
    
    setIsSending(false);
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
                    onClick={() => setSelectedDate(new Date())}
                    className="text-[10px] uppercase tracking-widest text-brand-teal hover:text-brand-coral transition-colors"
                  >
                    Go to Today
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                  <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ChevronRight size={20} /></button>
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
                  <p className="text-xs text-white/40 leading-relaxed">Miami Beach, FL</p>
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
                          disabled
                          onClick={(e) => e.preventDefault()}
                          className="btn-primary py-3 px-6 text-[10px] opacity-50 cursor-not-allowed"
                          title="Booking opens when physical location officially launches"
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

const CartModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const isMember = !!(user && (user.tier === 'Basic' || user.role === 'admin' || user.role === 'super_admin' || user.role === 'athlete'));
  const discount = 0.2;
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      const items = cart.map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: isMember ? Math.floor(item.product.price * (1 - discount)) : item.product.price,
        quantity: item.quantity
      }));

      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'shop',
          items,
          userId: user?.id || '',
          userEmail: user?.email || ''
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-brand-black border-l border-white/10 flex flex-col shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tighter">Shopping <span className="text-brand-teal">Cart</span></h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">{totalItems} Items</p>
              </div>
              <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                    <ShoppingBag size={40} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold uppercase tracking-widest">Your cart is empty</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Add some premium gear to get started</p>
                  </div>
                  <button onClick={onClose} className="btn-primary px-8 py-3 text-[10px]">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-6 group">
                    <div className="w-24 h-32 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      <img src={item.product.images?.[0] || item.product.featured_image} alt={item.product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold uppercase tracking-tight">{item.product.name}</h3>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-white/20 hover:text-brand-coral transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.product.category_id}</p>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-4 bg-white/5 rounded-lg p-1 border border-white/10">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-brand-teal">
                            ${(isMember ? Math.floor(item.product.price * (1 - discount)) : item.product.price) * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-white/5 border-t border-white/10 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40">
                    <span>Subtotal</span>
                    <span>${totalPrice}</span>
                  </div>
                  {isMember && (
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-brand-teal">
                      <span>Member Discount (20%)</span>
                      <span>-${Math.floor(totalPrice * discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold uppercase tracking-tighter pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span className="text-brand-teal">${isMember ? Math.floor(totalPrice * (1 - discount)) : totalPrice}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full btn-primary py-5 text-xs rounded-xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {checkoutLoading ? 'Redirecting to Stripe...' : 'Proceed to Checkout'} {!checkoutLoading && <ArrowRight size={16} />}
                  </button>
                  <button 
                    onClick={clearCart}
                    className="w-full py-4 text-[10px] uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
                
                <p className="text-[8px] text-white/20 uppercase tracking-widest text-center leading-relaxed">
                  Your delivery address will be collected securely at Checkout. <br />
                  Shipping and taxes calculated on the next screen.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    supabase.from('products').select('*').then(({ data }) => {
      // the backend checkout expects db products to be active
      if (data) setProducts(data as Product[]);
      setLoading(false);
    });
  }, []);
  
  return { products, loading };
};

const Store = () => {
  const { user } = useAuth();
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const [activeTab, setActiveTab] = useState(category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All');
  const [activeCollection, setActiveCollection] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    const saved = localStorage.getItem('fmf_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('fmf_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 3);
    });
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
    addToRecentlyViewed(product);
  };

  const { products: dbProducts, loading } = useProducts();

  const isMember = !!(user && (user.tier === 'Basic' || user.role === 'admin' || user.role === 'super_admin' || user.role === 'athlete'));
  const discount = 0.2; // 20% discount for members

  const tabs = ['All', 'Apparel', 'Gear', 'Accessories', 'Fragrance', 'Lifestyle', 'Nutrition'];
  const collections = ['All', 'FMF Training Collection', 'FMF Lifestyle Collection', 'FMF x Sorority Collection', 'Pier St Barth Collection', 'CLÉ Paris Collection', 'Mike Water Fitness'];

  const filteredProducts = useMemo(() => {
    let filtered = dbProducts;
    // ensure we don't crash from old mock formats
    if (activeTab !== 'All') {
      const tabKey = activeTab.toLowerCase();
      filtered = filtered.filter(p => p.category_id?.toLowerCase() === tabKey || p.category?.toLowerCase() === tabKey);
    }
    if (activeCollection !== 'All') {
      filtered = filtered.filter(p => (p.brand_id || 'FMF Lifestyle Collection') === activeCollection);
    }
    return filtered;
  }, [dbProducts, activeTab, activeCollection]);

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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">Unlock 20% Member Discount</p>
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
            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
              >
                <ShoppingBag size={20} className="text-white/60 group-hover:text-brand-teal transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-teal text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.5)]">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              className="group cursor-pointer"
              onClick={() => handleQuickView(product)}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-6">
                <img src={product.images?.[0] || product.featured_image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-brand-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white text-brand-black px-8 py-4 rounded-full flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all font-bold text-[10px] uppercase tracking-widest shadow-2xl">
                    <ShoppingBag size={16} />
                    Quick View
                  </button>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-brand-black/60 backdrop-blur-md text-[9px] uppercase tracking-widest px-2 py-1 rounded">{product.brand_id || 'FMF Lifestyle Collection'}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-tight group-hover:text-brand-teal transition-colors">{product.name}</h3>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{product.category_id || product.category}</p>
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
        
        {recentlyViewed.length > 0 && (
          <div className="mt-40 space-y-12">
            <h2 className="text-3xl font-bold uppercase tracking-tighter">Recently <span className="text-brand-teal">Viewed</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {recentlyViewed.map((p: Product) => (
                <div key={p.id} className="card-gradient p-6 space-y-6 group cursor-pointer" onClick={() => navigate(`/shop/product/${p.id}`)}>
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                    <img src={p.images?.[0] || p.featured_image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-tighter">{p.name}</h4>
                    <p className="text-xs text-white/40">${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick View Modal */}
        <AnimatePresence>
          {isQuickViewOpen && selectedProduct && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsQuickViewOpen(false)}
                className="absolute inset-0 bg-brand-black/90 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl card-gradient overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto scrollbar-hide"
              >
                <button 
                  onClick={() => setIsQuickViewOpen(false)}
                  className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-auto">
                  <img 
                    src={selectedProduct.images?.[0] || selectedProduct.featured_image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-brand-teal text-[10px] uppercase tracking-[0.4em] font-bold">{selectedProduct.brand_id}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-white/40 text-[10px] uppercase tracking-[0.4em]">{selectedProduct.category_id}</span>
                    </div>
                    <h2 className="text-4xl font-bold uppercase tracking-tighter leading-none">{selectedProduct.name}</h2>
                    <div className="flex items-baseline gap-4">
                      <span className="text-3xl font-bold text-white">${isMember ? Math.floor(selectedProduct.price * (1 - discount)) : selectedProduct.price}</span>
                      {(isMember || selectedProduct.compare_at_price > selectedProduct.price) && (
                        <span className="text-sm text-white/20 line-through">
                          ${isMember ? selectedProduct.price : selectedProduct.compare_at_price}
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedProduct.description && (
                    <p className="text-sm text-white/60 leading-relaxed font-light">
                      {selectedProduct.description}
                    </p>
                  )}

                  {selectedProduct.ingredients && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Ingredients</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.ingredients.map((ing, i) => (
                          <span key={i} className="text-[10px] text-white/60 bg-white/5 px-2 py-1 rounded border border-white/5">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProduct.benefits && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Key Benefits</p>
                      <ul className="space-y-1">
                        {selectedProduct.benefits.map((benefit, i) => (
                          <li key={i} className="text-[10px] text-white/60 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-brand-teal" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

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
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-white/20">
                      <span>SKU: {selectedProduct.sku}</span>
                      <span>Stock: {selectedProduct.inventory_count > 0 ? `${selectedProduct.inventory_count} units` : 'Out of Stock'}</span>
                    </div>
                    {!isMember && (
                      <Link to="/membership" className="flex items-center gap-2 text-brand-coral text-[10px] uppercase tracking-widest font-bold hover:underline">
                        <Zap size={12} /> Join Power Hour for 20% off
                      </Link>
                    )}
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <button 
                      onClick={() => {
                        if (selectedProduct) {
                          setIsAddingToCart(true);
                          addToCart(selectedProduct);
                          setTimeout(() => {
                            setIsAddingToCart(false);
                            setIsQuickViewOpen(false);
                            setIsCartOpen(true);
                          }, 1000);
                        }
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
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/.netlify/functions/create-checkout', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                type: 'shop',
                                items: [{
                                  id: selectedProduct.id,
                                  name: selectedProduct.name,
                                  description: selectedProduct.description,
                                  price: isMember ? Math.floor(selectedProduct.price * (1 - discount)) : selectedProduct.price,
                                  quantity: 1
                                }],
                                userId: user?.id || '',
                                userEmail: user?.email || ''
                              })
                            });
                            const data = await res.json();
                            if (data.url) window.location.href = data.url;
                          } catch (err) {
                            console.error('Buy now error:', err);
                          }
                        }}
                        className="w-full border border-white/10 py-6 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
                      >
                        Buy It Now
                      </button>
                      <button
                        onClick={async () => {
                          const url = `${window.location.origin}/#/shop/product/${selectedProduct.id}`;
                          if (navigator.share) {
                            try {
                              await navigator.share({
                                title: selectedProduct.name,
                                text: `Check out ${selectedProduct.name} on the FMF Store`,
                                url: url
                              });
                            } catch (err) {
                              console.error(err);
                            }
                          } else {
                            navigator.clipboard.writeText(url);
                            alert('Product link copied to clipboard!');
                          }
                        }}
                        className="w-full flex items-center justify-center gap-3 border border-brand-teal/30 text-brand-teal py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-brand-teal hover:text-black transition-all"
                      >
                        <Share2 size={16} /> Share Product
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

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <section className="mt-32 pt-24 border-t border-white/5">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Your History</span>
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Recently <span className="text-brand-coral">Viewed</span></h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {recentlyViewed.map((product) => (
                <div 
                  key={product.id} 
                  className="group cursor-pointer flex gap-6 items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-teal/30 transition-all"
                  onClick={() => handleQuickView(product)}
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={product.images?.[0] || product.featured_image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-tight group-hover:text-brand-teal transition-colors">{product.name}</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

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
                  Power Hour Members receive preferred pricing and exclusive access across the Fashion Meets Fitness platform. We've built an inner circle for those dedicated to the lifestyle.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Training Platform', desc: 'Full access to the Fitness Power Hour training platform' },
                  { title: 'Video Library', desc: 'Complete workout video library with 100+ sessions' },
                  { title: 'Structured Programs', desc: 'Expertly designed training programs for all levels' },
                  { title: 'Training Calendar', desc: 'Personalized scheduling and progress tracking' },
                  { title: '20% Store Discount', desc: 'Preferred pricing across the entire FMF store' },
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

            <div className="mt-32 p-12 md:p-24 rounded-[3rem] bg-gradient-to-br from-brand-black via-brand-black to-brand-teal/10 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-gradient-to-l from-[#c4a265]/20 to-transparent" />
              <div className="md:w-1/2 flex flex-col justify-center space-y-6">
                <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
                  CLÉ <span className="text-brand-teal italic">Paris</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Star className="text-brand-teal shrink-0 mt-1" size={20} />
                    <p className="text-white/60 text-lg font-light leading-relaxed">
                    CLÉ Paris represents the elegance and sophistication of the Fashion meetz Fitness lifestyle. Luxury, confidence, and personal presence for the refined athlete.
                    </p>
                  </div>
                </div>
                <button onClick={() => window.open('https://xn--clparis-cya.com/', '_blank', 'noopener,noreferrer')} className="btn-primary">Explore CLÉ Paris</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};



const EditUserModal = ({ user, onClose, onSave }: { user: UserProfile, onClose: () => void, onSave: (updatedUser: UserProfile) => void }) => {
  const [formData, setFormData] = useState<UserProfile>(user);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-brand-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold uppercase tracking-tight">Edit <span className="text-brand-teal">User</span></h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Display Name</label>
              <input 
                type="text" 
                value={formData.full_name || ''} 
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Email</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Tier</label>
              <select 
                value={formData.tier} 
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
              >
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
                <option value="Elite">Elite</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Role</label>
              <select 
                value={formData.role || 'user'} 
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
              >
                <option value="user">User</option>
                <option value="athlete">Athlete</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">City</label>
              <input 
                type="text" 
                value={formData.city || ''} 
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Level</label>
              <input 
                type="text" 
                value={formData.level || ''} 
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 border border-white/10 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button 
              onClick={() => onSave(formData)}
              className="flex-1 py-4 bg-brand-teal text-black rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-brand-teal/90 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ShippingLabelModal = ({ order, onClose }: { order: Order, onClose: () => void }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white text-black p-12 rounded-none w-full max-w-2xl shadow-2xl relative print:p-0 print:shadow-none"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-black/40 hover:text-black print:hidden">
          <X size={24} />
        </button>

        <div className="space-y-12">
          <div className="flex justify-between items-start border-b-4 border-black pb-8">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter">FMF Shipping</h2>
              <p className="text-xs font-bold uppercase tracking-widest mt-1">Fitness Power Hour Ecosystem</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">ORDER #{order.id.slice(-8).toUpperCase()}</p>
              <p className="text-[10px] uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest font-black border-b border-black pb-1">Ship From</p>
              <div className="text-sm space-y-1 font-medium">
                <p>FMF Logistics Hub</p>
                <p>123 Performance Way</p>
                <p>Miami, FL 33101</p>
                <p>United States</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest font-black border-b border-black pb-1">Ship To</p>
              <div className="text-sm space-y-1 font-bold">
                <p>{order.customer_name_snapshot}</p>
                <p>{order.shipping_address?.street || '456 Athlete Ave'}</p>
                <p>{order.shipping_address?.city || 'Los Angeles'}, {order.shipping_address?.state || 'CA'} {order.shipping_address?.zip || '90210'}</p>
                <p>{order.shipping_address?.country || 'United States'}</p>
              </div>
            </div>
          </div>

          <div className="border-4 border-black p-6 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="h-20 w-full bg-black flex items-center justify-center">
                <div className="flex gap-1 h-12">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className={`bg-white h-full ${i % 3 === 0 ? 'w-1' : i % 5 === 0 ? 'w-2' : 'w-0.5'}`} />
                  ))}
                </div>
              </div>
              <p className="font-mono text-xs tracking-[0.5em] font-bold">*{order.id.toUpperCase()}*</p>
            </div>
          </div>

          <div className="flex justify-between items-end pt-8 border-t border-black/10">
            <div className="text-[10px] uppercase tracking-widest font-bold">
              <p>Weight: 2.4 lbs</p>
              <p>Service: Priority Elite</p>
            </div>
            <button 
              onClick={handlePrint}
              className="bg-black text-white px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:invert transition-all print:hidden"
            >
              <Printer size={14} /> Print Label
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CreateCommunityModal = ({ onClose, showToast }: { onClose: () => void, showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: 'https://picsum.photos/seed/community/800/1000'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const newCommunity: CommunityType = {
      id: `c${Date.now()}`,
      ...formData,
      members: [],
      createdAt: new Date().toISOString()
    };

    try {
      await supabase.from('communities').insert(newCommunity);
      showToast('Community created!', 'success');
      onClose();
    } catch (error) {
      showToast('Error creating community', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-black border border-white/10 p-10 rounded-3xl w-full max-w-md space-y-8"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold uppercase tracking-tighter">Create <span className="text-brand-teal">Community</span></h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Community Name</label>
            <input 
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal transition-colors"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Elite Calisthenics"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Description</label>
            <textarea 
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal transition-colors resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this community about?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Cover Image URL</label>
            <input 
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal transition-colors"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-brand-teal text-black rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-brand-teal/90 transition-all"
          >
            Create Community
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const CommunityMemberModal = ({ community, users, onClose, showToast }: { community: CommunityType, users: UserProfile[], onClose: () => void, showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const [search, setSearch] = useState('');
  
  const members = useMemo(() => {
    return users.filter(u => community.members.includes(u.id));
  }, [users, community.members]);

  const nonMembers = useMemo(() => {
    return users.filter(u => !community.members.includes(u.id) && (
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [users, community.members, search]);

  const handleAddMember = async (userId: string) => {
    try {
      const updatedMembers = [...community.members, userId];
      await supabase.from('communities').update({ members: updatedMembers }).eq('id', community.id);
      showToast('Member added!', 'success');
    } catch (error) {
      showToast('Error adding member', 'error');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const updatedMembers = community.members.filter(id => id !== userId);
      await supabase.from('communities').update({ members: updatedMembers }).eq('id', community.id);
      showToast('Member removed!', 'success');
    } catch (error) {
      showToast('Error removing member', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-black border border-white/10 p-10 rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-tighter">Manage <span className="text-brand-teal">Members</span></h2>
            <p className="text-white/40 uppercase tracking-widest text-[10px] mt-1">{community.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1 overflow-hidden">
          <div className="flex flex-col space-y-6 overflow-hidden">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Current Members ({members.length})</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
              {members.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal text-[10px] font-bold">
                      {(u.full_name || 'U')[0]}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tight">{u.full_name}</p>
                      <p className="text-[8px] text-white/40">{u.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveMember(u.id)}
                    className="p-2 text-brand-coral hover:bg-brand-coral/10 rounded-lg transition-all"
                  >
                    <UserMinus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-6 overflow-hidden">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Add Members</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input 
                  type="text"
                  placeholder="Search users..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-brand-teal transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
              {nonMembers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-[10px] font-bold">
                      {(u.full_name || 'U')[0]}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tight">{u.full_name}</p>
                      <p className="text-[8px] text-white/40">{u.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddMember(u.id)}
                    className="p-2 text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-all"
                  >
                    <UserPlus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Services = () => {
  const navigate = useNavigate();
  const services = [
    {
      id: 'flexmob305',
      title: 'Flex Mob 305',
      desc: 'Professional assisted stretching and muscle recovery.',
      image: 'https://picsum.photos/seed/flexmob-service/800/600',
      path: '/services/flexmob305'
    },
    {
      id: 'personal-training',
      title: 'Personal Training',
      desc: 'One-on-one or small group functional training sessions.',
      image: 'https://picsum.photos/seed/pt-service/800/600',
      path: '/services/personal-training'
    }
  ];

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 space-y-6">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Our Services</span>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">FMF <span className="text-brand-teal">Services</span></h1>
          <p className="text-white/40 uppercase tracking-widest text-xs max-w-xl leading-relaxed">
            From elite training to professional recovery, we provide the tools you need to master your body.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {services.map((service) => (
            <div key={service.id} className="card-gradient p-12 space-y-8 group hover:border-brand-teal/30 transition-all cursor-pointer" onClick={() => navigate(service.path)}>
              <div className="aspect-video rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-bold uppercase tracking-tighter">{service.title}</h3>
                <p className="text-white/40 text-lg font-light leading-relaxed">{service.desc}</p>
                <button className="btn-outline">Learn More</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FlexMob305 = ({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedService, setSelectedService] = useState('Stretching');
  const [serviceMessage, setServiceMessage] = useState('');
  
  const [contactPreference, setContactPreference] = useState('Email');
  const contactOptions = ['Email', 'Phone Call', 'Text Message', 'In-Person at Studio'];
  
  const hasActiveMembership = !!(user && (user.tier === 'Basic' || user.membership_status === 'active' || user.role === 'admin' || user.role === 'super_admin' || user.role === 'athlete'));

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAge, setGuestAge] = useState('');
  const [guestGender, setGuestGender] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<{ date: string, time: string, service: string, amount: number, email: string } | null>(null);
  const [showWaiver, setShowWaiver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceOptions = [
    { name: 'Stretching', price: 180 },
    { name: 'Massage', price: 120 },
    { name: 'Recovery', price: 80 }
  ];
  const timeSlots = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase.from('service_requests')
          .select('*')
          .eq('service_subtype', 'FlexMob305');
      if (data) {
        setAllRequests(data);
        if (user) {
          setMyRequests(data.filter((r: any) => r.user_id === user.id));
        }
      }
    };
    fetchRequests();
  }, [user]);

  const handleAddService = async () => {
    if (!user && (!guestName || !guestEmail || !guestPhone)) {
      showToast('Please provide your full name, email, and phone number to book as a guest.', 'error');
      return;
    }
    if (!selectedDay) {
      showToast('Please select a date.', 'error');
      return;
    }
    if (!selectedSlot) {
      showToast('Please select a time slot.', 'error');
      return;
    }

    const guestAccepted = !user ? localStorage.getItem('guest_waiver_accepted') : 'true';
    if ((user && !user.waiver_accepted) || (!user && !guestAccepted)) {
       setShowWaiver(true);
       return;
    }

    proceedToCheckout();
  };

  const proceedToCheckout = async () => {
    setIsSubmitting(true);
    try {
      const getFormattedTime = (timeSlot: string) => {
        const map: Record<string, string> = {
          '09:00 AM': '09:00:00', '10:30 AM': '10:30:00', '01:00 PM': '13:00:00',
          '02:30 PM': '14:30:00', '04:00 PM': '16:00:00', '05:30 PM': '17:30:00'
        };
        return map[timeSlot] || '12:00:00';
      };

      const formattedSlot = getFormattedTime(selectedSlot);
      const isTaken = allRequests.some(r => r.requested_date === selectedDay && r.requested_time === formattedSlot && r.status !== 'denied');
      
      if (isTaken) {
         showToast('Error: Slot was just reserved by another user.', 'error');
         setIsSubmitting(false);
         return;
      }

      const activeServiceObj = serviceOptions.find(ref => ref.name === selectedService);
      const amountPaid = activeServiceObj?.price || 0;

      const { data, error } = await supabase.from('service_requests').insert({
        user_id: user ? user.id : null,
        guest_name: !user ? guestName : null,
        guest_email: !user ? guestEmail : null,
        guest_phone: !user ? guestPhone : null,
        amount_paid: amountPaid,
        service_type: selectedService,
        service_subtype: 'FlexMob305',
        requested_date: selectedDay,
        requested_time: formattedSlot,
        status: 'unpaid',
        notes: (hasActiveMembership ? '' : `[Contact Preference: ${contactPreference}] `) + (!user && (guestAge || guestGender) ? `[Age: ${guestAge || 'N/A'}, Gender: ${guestGender || 'N/A'}] ` : '') + 'Message: ' + serviceMessage
      }).select().single();

      if (error) throw error;
      if (data) {
        setAllRequests(prev => [...prev, data]);
        if (user) setMyRequests(prev => [...prev, data]);
      }
      
      // Route through connected stripe handler automatically
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'service',
          serviceName: selectedService,
          priceAmount: amountPaid,
          selectedDate: selectedDay,
          selectedTime: formattedSlot,
          userId: user ? user.id : '',
          userEmail: user ? user.email : guestEmail,
          requestId: data.id,
          successUrl: window.location.href.split('#')[0] + '#/profile?payment=success&type=service',
          cancelUrl: window.location.href
        })
      });

      const checkoutData = await res.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error(checkoutData.error || 'Failed to initialize checkout session.');
      }

      setServiceMessage('');
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setGuestAge('');
      setGuestGender('');
    } catch (err: any) {
      showToast(err.message || 'Failed to request service.', 'error');
    } finally {
      setIsSubmitting(false);
      setShowCheckout(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getRequestsForDay = (dayStr: string, requestsArray: any[]) => requestsArray.filter(r => r.requested_date === dayStr && r.status !== 'denied');

  const getFormattedTime = (timeSlot: string) => {
    const map: Record<string, string> = {
      '09:00 AM': '09:00:00', '10:30 AM': '10:30:00', '01:00 PM': '13:00:00',
      '02:30 PM': '14:30:00', '04:00 PM': '16:00:00', '05:30 PM': '17:30:00'
    };
    return map[timeSlot] || '12:00:00';
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const days = getDaysInMonth(currentDate);
  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="pt-40 pb-32 px-6 fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-6 text-center max-w-3xl mx-auto">
          <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">Recovery & Mobility</span>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Flex Mob <span className="text-brand-coral">305</span></h1>
          <p className="text-white/60 text-lg font-light leading-relaxed">
            Specializing in professional assisted stretching and muscle recovery designed to support athletes and optimize performance.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-left">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <h3 className="text-2xl font-black uppercase tracking-tighter">{monthLabel}</h3>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="hidden md:grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-3 text-center text-white/20 text-[9px] uppercase font-black tracking-widest border-b border-white/5">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 md:gap-2 max-h-[60vh] md:max-h-none overflow-y-auto md:overflow-visible">
              {days.map((date, idx) => {
                if (!date) return <div key={idx} className="hidden md:block h-20 md:h-28 rounded-xl" />;

                const dayStr = date.toISOString().split('T')[0];
                const dayAllRequests = getRequestsForDay(dayStr, allRequests);
                const dayMyRequests = getRequestsForDay(dayStr, myRequests);
                
                const isToday = isSameDay(date, today);
                const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isSelected = selectedDay === dayStr;
                
                const fullyBooked = dayAllRequests.length >= timeSlots.length;
                
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: isPast ? 1 : 1.04 }}
                    whileTap={{ scale: isPast ? 1 : 0.97 }}
                    onClick={() => { if (!isPast && !fullyBooked) { setSelectedDay(dayStr); setSelectedSlot(''); } }}
                    className={`h-22 md:h-28 p-2 md:p-3 border rounded-xl flex flex-col ${isPast || fullyBooked ? 'cursor-not-allowed' : 'cursor-pointer'} transition-all relative overflow-hidden ${isSelected ? 'bg-brand-coral/10 border-brand-coral shadow-[0_0_20px_rgba(255,107,107,0.15)]' : isToday && !fullyBooked ? 'bg-brand-teal/5 border-brand-teal/40' : fullyBooked && !isPast ? 'bg-red-500/5 border-red-500/20 opacity-50' : isPast ? 'bg-white/[0.01] border-white/[0.02] opacity-30' : 'bg-white/[0.03] border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs md:text-sm font-black font-mono flex items-center gap-2 ${isSelected ? 'text-brand-coral' : isToday && !fullyBooked ? 'text-brand-teal' : isPast ? 'text-white/20' : 'text-white/50'}`}>
                        <span className="md:hidden uppercase text-[9px] tracking-widest">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        {date.getDate()}
                      </span>
                    </div>

                    <div className="mt-2 md:mt-auto space-y-1">
                      {dayMyRequests.length > 0 ? (
                         <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase truncate bg-brand-coral/20 text-brand-coral">
                            <Check size={8} /> Your Booking
                         </div>
                      ) : dayAllRequests.length > 0 && !isPast && !fullyBooked ? (
                         <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase truncate bg-white/10 text-white/40">
                             {timeSlots.length - dayAllRequests.length} slots left
                         </div>
                      ) : null}
                      
                      {fullyBooked && !isPast && (
                         <div className="text-[8px] font-black uppercase text-red-500 mt-1">Sold out</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-1 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
            <AnimatePresence mode="wait">
              {selectedDay ? (
                <motion.div
                  key={selectedDay}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card-gradient rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl"
                >
                  <div className={`p-6 border-b border-white/5 ${selectedDay === todayStr ? 'bg-brand-teal/5' : 'bg-white/[0.02]'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-coral">
                          Initiate Request
                        </p>
                        <h4 className="text-xl font-black uppercase tracking-tighter mt-1">
                          {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' })}
                        </h4>
                      </div>
                      <button onClick={() => { setSelectedDay(null); setSelectedSlot(''); }} className="p-2 text-white/20 hover:text-white transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                     <div className="space-y-4">
                        <div>
                          <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block mb-2">Service Protocol</label>
                          <div className="grid grid-cols-1 gap-2">
                             {serviceOptions.map(s => (
                                <button key={s.name} onClick={() => setSelectedService(s.name)} className={`py-3 px-4 rounded-xl text-xs font-bold transition-all text-left border flex items-center justify-between ${selectedService === s.name ? 'bg-brand-coral/10 border-brand-coral text-brand-coral' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}>
                                   <span>{s.name}</span>
                                   {!user && <span className="opacity-60">${s.price}</span>}
                                </button>
                             ))}
                          </div>
                        </div>                        <div>
                          <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block mb-2">Available Time Windows</label>
                          <div className="grid grid-cols-2 gap-2">
                            {timeSlots.map(t => {
                               const dbTime = getFormattedTime(t);
                               const isTaken = allRequests.some(r => r.requested_date === selectedDay && r.requested_time === dbTime && r.status !== 'denied');
                               const isMine = myRequests.some(r => r.requested_date === selectedDay && r.requested_time === dbTime && r.status !== 'denied');

                               if (isMine) {
                                  return (
                                     <button key={t} disabled className="py-3 rounded-xl text-[10px] font-bold border border-brand-coral/40 bg-brand-coral/10 text-brand-coral opacity-80 cursor-not-allowed flex items-center justify-center gap-1">
                                        <Check size={12}/> Confirmed
                                     </button>
                                  )
                               }
                               if (isTaken) {
                                  return (
                                     <button key={t} disabled className="py-3 rounded-xl text-[10px] font-bold border border-white/5 bg-white/5 text-white/20 line-through cursor-not-allowed">
                                        {t.split(' ')[0]} Full
                                     </button>
                                  )
                               }
                               return (
                                  <button key={t} onClick={() => setSelectedSlot(t)} className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${selectedSlot === t ? 'bg-brand-coral text-black border-brand-coral shadow-[0_0_15px_rgba(255,107,107,0.3)]' : 'bg-white/10 border-transparent hover:bg-white/20 text-white'}`}>
                                    {t}
                                  </button>
                               )
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block mb-2">Focus Area / Notes (Optional)</label>
                          <textarea rows={2} placeholder="Briefly describe your focus area..." value={serviceMessage} onChange={e => setServiceMessage(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:border-brand-coral outline-none transition-all placeholder-white/20 resize-none -mb-2" />
                        </div>
                     </div>

                     {!user && (
                        <div className="space-y-3 pt-4 border-t border-white/5">
                          <label className="text-[9px] uppercase tracking-widest font-black text-brand-coral block mb-3">Guest Contact Info</label>
                          <input type="text" placeholder="Full Name" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-coral outline-none transition-all" />
                          <input type="email" placeholder="Email Address" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-coral outline-none transition-all" />
                          <input type="tel" placeholder="Phone Number" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-coral outline-none transition-all" />
                          <div className="grid grid-cols-2 gap-2">
                             <input type="number" placeholder="Age (Optional)" value={guestAge} onChange={e => setGuestAge(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-coral outline-none transition-all" min="1" max="100" />
                             <select value={guestGender} onChange={e => setGuestGender(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-coral outline-none transition-all appearance-none cursor-pointer">
                                <option value="" disabled>Gender (Optional)</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                             </select>
                          </div>
                        </div>
                     )}

                     {!bookingConfirmed ? (
                         <button onClick={handleAddService} disabled={isSubmitting || !selectedSlot || (!user && (!guestName || !guestEmail || !guestPhone))} className="w-full py-4 bg-brand-coral text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-[0_0_15px_rgba(255,107,107,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                            {isSubmitting ? 'Redirecting to Checkout...' : `Pay $${serviceOptions.find(o => o.name === selectedService)?.price} & Book`}
                         </button>
                     ) : (
                        <div className="mt-4 p-5 rounded-2xl border border-brand-coral/30 bg-brand-coral/5 space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-coral"><Check size={80} /></div>
                          <h3 className="text-xl font-black text-brand-coral uppercase tracking-tighter">Booking Confirmed</h3>
                          <div className="space-y-1 text-xs font-bold text-white/60 relative z-10">
                            <p>Service: <span className="text-white">{bookingConfirmed.service}</span></p>
                            <p>Date: <span className="text-white">{bookingConfirmed.date}</span></p>
                            <p>Time: <span className="text-white">{bookingConfirmed.time}</span></p>
                            <p>Location: <span className="text-white">Miami Core Facility HQ</span></p>
                            {bookingConfirmed.amount > 0 && <p>Amount Paid: <span className="text-white">${bookingConfirmed.amount}.00</span></p>}
                          </div>
                          <p className="text-[9px] uppercase tracking-widest text-white/40 leading-relaxed border-t border-white/10 pt-3">
                             An email confirmation has been sent instantly to <span className="text-white">{bookingConfirmed.email}</span> with these details. You must email us 48hr before your appointment to cancel, or you must show up.
                          </p>
                          <button onClick={() => { setBookingConfirmed(null); setSelectedDay(null); setSelectedSlot(''); }} className="w-full mt-2 py-3 bg-white/10 text-white hover:bg-white text-black font-black uppercase text-[9px] tracking-widest rounded-xl transition-all">Done</button>
                        </div>
                     )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card-gradient rounded-[2.5rem] border border-dashed border-white/10 p-10 text-center space-y-6"
                >
                  <Calendar size={40} className="text-white/10 mx-auto" />
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-white/30">Select a Date</h4>
                    <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mt-2 leading-relaxed">
                      Click any available day on the calendar to secure your recovery service window.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {showWaiver && (
        <InAppWaiverPopup 
          user={user as any} 
          onAccept={() => {
             setShowWaiver(false);
             if (!user) localStorage.setItem('guest_waiver_accepted', 'true');
             // Update local user object immediately to prevent infinite loops before refetch
             if (user) user.waiver_accepted = true;
             proceedToCheckout();
          }} 
          onCancel={() => setShowWaiver(false)} 
        />
      )}
    </div>
  );
};

const PersonalTraining = ({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedService, setSelectedService] = useState('1-on-1 Training');
  const [serviceMessage, setServiceMessage] = useState('');
  
  const [contactPreference, setContactPreference] = useState('Email');
  const contactOptions = ['Email', 'Phone Call', 'Text Message', 'In-Person at Studio'];
  
  const hasActiveMembership = !!(user && (user.tier === 'Basic' || user.membership_status === 'active' || user.role === 'admin' || user.role === 'super_admin' || user.role === 'athlete'));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);

  const serviceOptions = [
    { name: '1-on-1 Training', price: 75 },
    { name: 'Small Group Training', price: 250 }
  ];
  const timeSlots = ['06:00 AM', '07:30 AM', '09:00 AM', '12:00 PM', '04:00 PM', '05:30 PM'];
  const MAX_PARTICIPANTS_PER_SLOT = 5;

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase.from('service_requests')
          .select('*')
          .eq('service_subtype', 'PersonalTraining');
      if (data) {
        setAllRequests(data);
        if (user) {
          setMyRequests(data.filter((r: any) => r.user_id === user.id));
        }
      }
    };
    fetchRequests();
  }, [user]);

  const handleAddService = async () => {
    if (!user) {
      showToast('Please login to request a session.', 'error');
      return;
    }
    if (!selectedDay) {
      showToast('Please select a date.', 'error');
      return;
    }
    if (!selectedSlot) {
      showToast('Please select a time slot.', 'error');
      return;
    }

    if (user && !user.waiver_accepted) {
       setShowWaiver(true);
       return;
    }

    proceedToCheckout();
  };

  const proceedToCheckout = async () => {
    setIsSubmitting(true);
    try {
      const getFormattedTime = (timeSlot: string) => {
        const map: Record<string, string> = {
          '06:00 AM': '06:00:00', '07:30 AM': '07:30:00', '09:00 AM': '09:00:00',
          '12:00 PM': '12:00:00', '04:00 PM': '16:00:00', '05:30 PM': '17:30:00'
        };
        return map[timeSlot] || '12:00:00';
      };

      const formattedSlot = getFormattedTime(selectedSlot);
      const slotRequests = allRequests.filter(r => r.requested_date === selectedDay && r.requested_time === formattedSlot && r.status !== 'denied' && r.status !== 'cancelled');
      
      if (slotRequests.length >= MAX_PARTICIPANTS_PER_SLOT) {
         showToast('Error: Slot is already full.', 'error');
         setIsSubmitting(false);
         return;
      }

      const activeServiceObj = serviceOptions.find(ref => ref.name === selectedService);
      const amountPaid = activeServiceObj?.price || 0;

      const { data, error } = await supabase.from('service_requests').insert({
        user_id: user.id,
        service_type: selectedService,
        service_subtype: 'PersonalTraining',
        requested_date: selectedDay,
        requested_time: formattedSlot,
        status: 'unpaid',
        notes: (hasActiveMembership ? '' : `[Contact Preference: ${contactPreference}] `) + 'Message: ' + serviceMessage
      }).select().single();

      if (error) throw error;
      if (data) {
        setAllRequests(prev => [...prev, data]);
        setMyRequests(prev => [...prev, data]);
      }

      // Route through connected stripe handler automatically
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'service',
          serviceName: selectedService,
          priceAmount: amountPaid,
          selectedDate: selectedDay,
          selectedTime: formattedSlot,
          userId: user.id,
          userEmail: user.email,
          requestId: data.id,
          successUrl: window.location.href.split('#')[0] + '#/profile?payment=success&type=service',
          cancelUrl: window.location.href
        })
      });

      const checkoutData = await res.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error(checkoutData.error || 'Failed to initialize checkout session.');
      }
      
      setServiceMessage('');
      setSelectedSlot('');
      setSelectedDay(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to request service.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getRequestsForDay = (dayStr: string, requestsArray: any[]) => requestsArray.filter(r => r.requested_date === dayStr && r.status !== 'denied' && r.status !== 'cancelled');

  const getFormattedTime = (timeSlot: string) => {
    const map: Record<string, string> = {
      '06:00 AM': '06:00:00', '07:30 AM': '07:30:00', '09:00 AM': '09:00:00',
      '12:00 PM': '12:00:00', '04:00 PM': '16:00:00', '05:30 PM': '17:30:00'
    };
    return map[timeSlot] || '12:00:00';
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const days = getDaysInMonth(currentDate);
  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="pt-40 pb-32 px-6 fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-6 text-center max-w-3xl mx-auto">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Studio Training</span>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Personal <span className="text-brand-teal">Training</span></h1>
          <p className="text-white/60 text-lg font-light leading-relaxed">
            Elite functional training sessions in our private studio. Maximum 5 participants per session for personalized attention.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-left">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <h3 className="text-2xl font-black uppercase tracking-tighter">{monthLabel}</h3>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="hidden md:grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-3 text-center text-white/20 text-[9px] uppercase font-black tracking-widest border-b border-white/5">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 md:gap-2 max-h-[60vh] md:max-h-none overflow-y-auto md:overflow-visible">
              {days.map((date, idx) => {
                if (!date) return <div key={idx} className="hidden md:block h-20 md:h-28 rounded-xl" />;

                const dayStr = date.toISOString().split('T')[0];
                const dayAllRequests = getRequestsForDay(dayStr, allRequests);
                const dayMyRequests = getRequestsForDay(dayStr, myRequests);
                
                const isToday = isSameDay(date, today);
                const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isSelected = selectedDay === dayStr;
                
                // fullyBooked: if all slots have 5 participants
                const fullyBooked = timeSlots.every(t => dayAllRequests.filter(r => r.requested_time === getFormattedTime(t)).length >= MAX_PARTICIPANTS_PER_SLOT);
                
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: isPast ? 1 : 1.04 }}
                    whileTap={{ scale: isPast ? 1 : 0.97 }}
                    onClick={() => { if (!isPast && !fullyBooked) { setSelectedDay(dayStr); setSelectedSlot(''); } }}
                    className={`h-22 md:h-28 p-2 md:p-3 border rounded-xl flex flex-col ${isPast || fullyBooked ? 'cursor-not-allowed' : 'cursor-pointer'} transition-all relative overflow-hidden ${isSelected ? 'bg-brand-teal/10 border-brand-teal shadow-[0_0_20px_rgba(45,212,191,0.15)]' : isToday && !fullyBooked ? 'bg-brand-teal/5 border-brand-teal/40' : fullyBooked && !isPast ? 'bg-red-500/5 border-red-500/20 opacity-50' : isPast ? 'bg-white/[0.01] border-white/[0.02] opacity-30' : 'bg-white/[0.03] border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs md:text-sm font-black font-mono flex items-center gap-2 ${isSelected ? 'text-brand-teal' : isToday && !fullyBooked ? 'text-brand-teal' : isPast ? 'text-white/20' : 'text-white/50'}`}>
                        <span className="md:hidden uppercase text-[9px] tracking-widest">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        {date.getDate()}
                      </span>
                    </div>

                    <div className="mt-2 md:mt-auto space-y-1">
                      {dayMyRequests.length > 0 ? (
                         <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase truncate bg-brand-teal/20 text-brand-teal">
                            <Check size={8} /> Your Booking
                         </div>
                      ) : dayAllRequests.length > 0 && !isPast && !fullyBooked ? (
                         <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase truncate bg-white/10 text-white/40">
                             {timeSlots.length - dayAllRequests.filter(r => r.requested_time !== null).reduce((acc: string[], curr: any) => acc.includes(curr.requested_time) ? acc : [...acc, curr.requested_time], []).filter((time: string) => dayAllRequests.filter((r) => r.requested_time === time).length >= MAX_PARTICIPANTS_PER_SLOT).length} slots left
                         </div>
                      ) : null}
                      
                      {fullyBooked && !isPast && (
                         <div className="text-[8px] font-black uppercase text-red-500 mt-1">Sold out</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-1 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
            <AnimatePresence mode="wait">
              {selectedDay ? (
                <motion.div
                  key={selectedDay}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card-gradient rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl"
                >
                  <div className={`p-6 border-b border-white/5 ${selectedDay === todayStr ? 'bg-brand-teal/5' : 'bg-white/[0.02]'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-teal">
                          Initiate Request
                        </p>
                        <h4 className="text-xl font-black uppercase tracking-tighter mt-1">
                          {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' })}
                        </h4>
                      </div>
                      <button onClick={() => { setSelectedDay(null); setSelectedSlot(''); }} className="p-2 text-white/20 hover:text-white transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                     <div className="space-y-4">
                        <div>
                          <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block mb-2">Service Protocol</label>
                          <div className="grid grid-cols-1 gap-2">
                             {serviceOptions.map(s => (
                                <button key={s.name} onClick={() => setSelectedService(s.name)} className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${selectedService === s.name ? 'bg-brand-teal/10 border-brand-teal text-brand-teal' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}>
                                   <span>{s.name}</span><span className="opacity-60">${s.price}</span>
                                </button>
                             ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block mb-2">Available Time Windows</label>
                          <div className="grid grid-cols-2 gap-2">
                            {timeSlots.map(t => {
                               const dbTime = getFormattedTime(t);
                               const slotRequests = allRequests.filter(r => r.requested_date === selectedDay && r.requested_time === dbTime && r.status !== 'denied' && r.status !== 'cancelled');
                               const isTaken = slotRequests.length >= MAX_PARTICIPANTS_PER_SLOT;
                               const isMine = myRequests.some(r => r.requested_date === selectedDay && r.requested_time === dbTime && r.status !== 'denied' && r.status !== 'cancelled');

                               if (isMine) {
                                  return (
                                     <button key={t} disabled className="py-3 rounded-xl text-[10px] font-bold border border-brand-teal/40 bg-brand-teal/10 text-brand-teal opacity-80 cursor-not-allowed flex items-center justify-center gap-1">
                                        <Check size={12}/> Confirmed
                                     </button>
                                  )
                               }
                               if (isTaken) {
                                  return (
                                     <button key={t} disabled className="py-3 rounded-xl text-[10px] font-bold border border-white/5 bg-white/5 text-white/20 line-through cursor-not-allowed">
                                        {t.split(' ')[0]} Full
                                     </button>
                                  )
                               }
                               return (
                                  <button key={t} onClick={() => setSelectedSlot(t)} className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${selectedSlot === t ? 'bg-brand-teal text-black border-brand-teal shadow-[0_0_15px_rgba(45,212,191,0.3)]' : 'bg-white/10 border-transparent hover:bg-white/20 text-white'}`}>
                                    {t}
                                    <span className="block text-[8px] opacity-70 mt-0.5">{MAX_PARTICIPANTS_PER_SLOT - slotRequests.length} spots left</span>
                                  </button>
                               )
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block mb-2">Focus Area / Notes (Optional)</label>
                          <textarea rows={2} placeholder="Briefly describe your fitness goals..." value={serviceMessage} onChange={e => setServiceMessage(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:border-brand-teal outline-none transition-all placeholder-white/20 resize-none -mb-2" />
                        </div>
                     </div>

                     {!user ? (
                        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                           <AlertCircle size={14} /> You must be logged in to book.
                        </div>
                     ) : !hasActiveMembership && (
                        <div className="space-y-4">
                          <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block mb-2">Admin Contact Preference</label>
                          <div className="grid grid-cols-2 gap-2">
                             {contactOptions.map(opt => (
                                <button key={opt} onClick={() => setContactPreference(opt)} className={`py-3 px-2 rounded-xl text-[10px] font-bold transition-all border ${contactPreference === opt ? 'bg-brand-teal/10 border-brand-teal text-brand-teal' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}>
                                   {opt}
                                </button>
                             ))}
                          </div>
                          <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">As a free user, an admin will contact you to confirm and process payment for this request.</p>
                        </div>
                     )}

                     <button onClick={handleAddService} disabled={isSubmitting || !selectedSlot || !user} className="w-full py-4 bg-brand-teal text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-glow-teal transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                        {isSubmitting ? 'Syncing...' : <>Request Slot Sync <ArrowRight size={14} /></>}
                     </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card-gradient rounded-[2.5rem] border border-dashed border-white/10 p-10 text-center space-y-6"
                >
                  <Calendar size={40} className="text-white/10 mx-auto" />
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-white/30">Select a Date</h4>
                    <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mt-2 leading-relaxed">
                      Click any available day on the calendar to secure your training service window.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {showWaiver && (
        <InAppWaiverPopup 
          user={user as any} 
          onAccept={() => {
             setShowWaiver(false);
             if (user) user.waiver_accepted = true;
             proceedToCheckout();
          }} 
          onCancel={() => setShowWaiver(false)} 
        />
      )}
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (product) {
      const saved = localStorage.getItem('fmf_recently_viewed');
      const prev = saved ? JSON.parse(saved) : [];
      const filtered = prev.filter((p: any) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 3);
      localStorage.setItem('fmf_recently_viewed', JSON.stringify(updated));
    }
  }, [product]);

  if (!product) return <div className="pt-40 text-center">Product not found</div>;

  const recentlyViewed = JSON.parse(localStorage.getItem('fmf_recently_viewed') || '[]');

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white mb-12 transition-colors uppercase tracking-widest text-[10px]">
          <ArrowLeft size={14} /> Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div className="space-y-8">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-white/5">
              <img src={product.images?.[0] || product.featured_image} alt={product.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" referrerPolicy="no-referrer" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.gallery?.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5 cursor-pointer border border-transparent hover:border-brand-teal/50 transition-all">
                  <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">{product.brand_id}</span>
                <span className="text-white/20">/</span>
                <span className="text-white/40 text-[10px] uppercase tracking-[0.5em]">{product.category_id}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">{product.name}</h1>
              <div className="text-4xl font-light tracking-tighter">${product.price}</div>
            </div>

            <p className="text-white/60 text-lg font-light leading-relaxed">{product.description}</p>

            <div className="space-y-8">
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Select Size</label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map(size => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={`px-6 py-3 border rounded-xl transition-all uppercase tracking-widest text-xs font-bold ${selectedSize === size ? 'border-brand-teal bg-brand-teal text-white' : 'border-white/10 hover:border-white/30'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => addToCart(product)} className="btn-primary w-full py-6 text-lg">Add to Cart</button>
            </div>

            <div className="pt-12 border-t border-white/10 space-y-6">
              <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-white/40">
                <Truck size={16} /> Free Shipping on orders over $150
              </div>
              <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-white/40">
                <ShieldCheck size={16} /> 100% Authentic FMF Product
              </div>
            </div>
          </div>
        </div>

        {recentlyViewed.length > 0 && (
          <div className="mt-40 space-y-12">
            <h2 className="text-3xl font-bold uppercase tracking-tighter">Recently <span className="text-brand-teal">Viewed</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {recentlyViewed.map((p: Product) => (
                <div key={p.id} className="card-gradient p-6 space-y-6 group cursor-pointer" onClick={() => navigate(`/shop/product/${p.id}`)}>
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                    <img src={p.images?.[0] || p.featured_image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-tighter">{p.name}</h4>
                    <p className="text-xs text-white/40">${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BrandPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const brandProducts = products.filter(p => p.brand_id.toLowerCase().replace(/ /g, '-') === slug);

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 space-y-6">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Brand Collection</span>
          <h1 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter">{slug?.replace(/-/g, ' ')}</h1>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {brandProducts.map(product => (
            <div key={product.id} className="card-gradient p-8 space-y-8 group cursor-pointer" onClick={() => navigate(`/shop/product/${product.id}`)}>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src={product.images?.[0] || product.featured_image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-tighter">{product.name}</h3>
                <p className="text-white/40">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Mission = () => (
  <div className="pt-40 pb-32 px-6">
    <div className="max-w-4xl mx-auto space-y-20">
      <header className="space-y-6 text-center">
        <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Our Purpose</span>
        <h1 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter">The <span className="text-brand-teal italic">Mission</span></h1>
      </header>

      <div className="space-y-12 text-white/60 text-xl font-light leading-relaxed text-center">
        <p>
          Fashion Meetz Fitness was established in 2022 with a singular mission: to redefine the intersection of physical performance and personal lifestyle.
        </p>
        <p>
          We believe that discipline is the ultimate form of self-respect. Our goal is to provide the environment, the tools, and the community required for individuals to master their bodies and their minds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-20 border-t border-white/10">
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-brand-teal">2022</div>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Established</p>
        </div>
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-brand-coral">10k+</div>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Community Members</p>
        </div>
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-brand-teal">Premium</div>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Training Standards</p>
        </div>
      </div>
    </div>
  </div>
);

const RunClub = () => {
  const { user } = useAuth();
  const [isJoined, setIsJoined] = useState(false);

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <header className="space-y-6">
              <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">Community Movement</span>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">FMF <span className="text-brand-coral">Run Club</span></h1>
              <p className="text-white/60 text-lg font-light leading-relaxed">
                Join the movement. The FMF Run Club is a community-driven initiative focused on endurance, discipline, and collective growth.
              </p>
            </header>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-brand-coral/20 flex items-center justify-center text-brand-coral">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold uppercase tracking-tighter">Open to All</h4>
                  <p className="text-xs text-white/40">Anyone can join the Run Club community, regardless of membership tier.</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsJoined(!isJoined)}
                className={`btn-primary w-full md:w-auto ${isJoined ? 'bg-white/10 text-white' : 'bg-brand-coral hover:bg-brand-coral/80'}`}
              >
                {isJoined ? 'Joined Run Club' : 'Join Run Club'}
              </button>
            </div>
          </div>
          
          <div className="relative aspect-square rounded-3xl overflow-hidden">
            <img src="https://picsum.photos/seed/runclub/1000/1000" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Membership = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const { user, login, signup, logout, updateTier, sendPasswordResetEmail } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const params = new URLSearchParams(location.search);
  const wantsLogin = params.get('mode') === 'login';
  const wasConfirmed = params.get('confirmed') === 'true';
  const shouldOpenModal = !user && (wantsLogin || wasConfirmed);

  const [isRegistering, setIsRegistering] = useState(shouldOpenModal);
  const [isLogin, setIsLogin] = useState(shouldOpenModal);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(wasConfirmed);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnverified, setShowUnverified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [localPassModal, setLocalPassModal] = useState<any>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Close modal and go to profile when user logs in
  useEffect(() => {
    if (user) {
      setIsRegistering(false);
      navigate('/profile');
    }
  }, [user]);

  // Open login modal when URL params change (e.g. clicking Login from another page)
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (!user && p.get('mode') === 'login') {
      setIsLogin(true);
      setIsRegistering(true);
    }
    if (!user && p.get('confirmed') === 'true') {
      setIsConfirmed(true);
      setIsLogin(true);
      setIsRegistering(true);
    }
  }, [location.search, location.key]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const tiers = [
    {
      name: 'Free',
      price: 'Free',
      period: 'forever',
      features: [
        'Create your athlete profile',
        'Explore the platform',
        'Access to community forums',
        'Preview training content'
      ],
      button: 'Sign Up Free',
      highlight: true
    },
    {
      name: 'Basic',
      price: '$19.99',
      period: 'per month',
      features: [
        'Full Video Library Access',
        'Program Builder Tracker',
        'Service Booking Privileges',
        'VIP Access to FMF Store'
      ],
      button: 'Get Full Access',
      highlight: false
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
    setShowUnverified(false);
  };

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendConfirmation = async () => {
    const emailToResend = unverifiedEmail || formData.email;
    if (!emailToResend) {
      showToast('Please enter your email address.', 'error');
      return;
    }
    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}#/auth/callback`;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToResend,
        options: { emailRedirectTo: redirectUrl }
      });
      if (error) throw error;
      showToast('Confirmation email sent! Check your inbox.');
      setResendCooldown(30);
    } catch (err: any) {
      showToast(err.message || 'Failed to resend. Try again later.', 'error');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        showToast('Logged in successfully');
        const p = new URLSearchParams(location.search);
        if (p.get('confirmed') === 'true') {
           sessionStorage.setItem('intent_onboarding', 'true');
        }
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        if (formData.password !== formData.confirmPassword) {
          showToast('Passwords do not match', 'error');
          setIsSubmitting(false);
          return;
        }
        await signup(formData.name, formData.email, formData.password, selectedTier?.name || 'Basic');
        setIsSuccess(true);
      }
    } catch (error: any) {
      const errMsg = error?.message || '';

      // Handle unconfirmed email specifically
      if (errMsg === 'EMAIL_NOT_CONFIRMED') {
        setShowUnverified(true);
        setUnverifiedEmail(formData.email);
        setErrorMsg('');
        setIsSubmitting(false);
        return;
      }

      let msg = 'Action failed';
      if (errMsg.includes('already registered') || errMsg.includes('already been registered')) msg = 'This email is already registered. Try logging in instead.';
      else if (errMsg.includes('Invalid login credentials')) msg = 'Incorrect email or password. Please try again.';
      else if (errMsg.includes('Email not confirmed')) msg = 'Your email is not confirmed yet. Please check your inbox and click the confirmation link.';
      else if (errMsg.includes('Password should be')) msg = 'Password must be at least 6 characters.';
      else if (errMsg) msg = errMsg;
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
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

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
          {tiers.map((tier, i) => (
            <div 
              key={i} 
              className={`card-gradient p-12 flex flex-col space-y-8 relative overflow-hidden ${
                tier.highlight ? 'border-brand-teal shadow-[0_0_50px_rgba(45,212,191,0.1)]' : ''
              } ${user?.tier === tier.name ? 'ring-2 ring-brand-teal ring-offset-4 ring-offset-brand-black' : ''}`}
            >
              {tier.highlight && (
                <div className="absolute top-6 right-6 bg-brand-teal text-black text-[8px] font-bold px-2 py-1 uppercase tracking-widest rounded">
                  Most Popular
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
                  Power Hour Members receive preferred pricing and exclusive access across the Fashion Meets Fitness platform. We've built an inner circle for those dedicated to the lifestyle.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Training Platform', desc: 'Full access to the Fitness Power Hour training platform' },
                  { title: 'Video Library', desc: 'Complete workout video library with 100+ sessions' },
                  { title: 'Structured Programs', desc: 'Expertly designed training programs for all levels' },
                  { title: 'Training Calendar', desc: 'Personalized scheduling and progress tracking' },
                  { title: '20% Store Discount', desc: 'Preferred pricing across the entire FMF store' },
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

              {(!user || user.tier === 'Basic') && (
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
                  "Being a Fitness Power Hour member isn't just about the workouts; it's about the standard you set for your life. The privileges are just a reflection of that commitment."
                </p>
                <p className="text-brand-teal text-[10px] uppercase tracking-widest mt-4 font-bold">Ã¢â‚¬â€ Michael L, Founder</p>
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
                    {isLogin ? <Check size={40} /> : <Send size={40} />}
                  </div>
                  <h3 className="text-3xl font-bold uppercase tracking-tighter">
                    {isLogin ? 'Welcome Back' : 'Check Your Email'}
                  </h3>
                  <p className="text-white/40 text-sm uppercase tracking-widest">
                    {isLogin ? 'Your power is now unlocked.' : `We sent a confirmation link to ${formData.email}. Click it to activate your account.`}
                  </p>
                  {!isLogin && (
                    <>
                      <button
                        onClick={() => { setIsRegistering(false); setIsSuccess(false); setFormData({ name: '', email: '', password: '', confirmPassword: '' }); }}
                        className="btn-primary mt-4"
                      >
                        Got It
                      </button>
                      <div className="pt-4">
                        <button
                          onClick={handleResendConfirmation}
                          disabled={resendCooldown > 0}
                          className="text-[10px] uppercase tracking-widest text-white/40 hover:text-brand-teal transition-colors disabled:opacity-30"
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive it? Resend Email"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : showUnverified ? (
                /* â”€â”€ Email Not Verified Panel â”€â”€ */
                <div className="text-center space-y-6 py-8">
                  <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                    <Send size={36} className="text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-bold uppercase tracking-tighter">
                    Email Not <span className="text-amber-500">Verified</span>
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Please verify your email before logging in. We sent a confirmation link to <span className="text-white font-bold">{unverifiedEmail}</span>.
                  </p>
                  <div className="space-y-4 pt-4">
                    <button
                      onClick={handleResendConfirmation}
                      disabled={resendCooldown > 0}
                      className="btn-primary w-full py-5 disabled:opacity-30"
                    >
                      {resendCooldown > 0 ? `Resend Available in ${resendCooldown}s` : 'Resend Confirmation Email'}
                    </button>
                    <button
                      onClick={() => { setShowUnverified(false); setErrorMsg(''); }}
                      className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {isConfirmed && (
                      <div className="mb-6 p-4 bg-brand-teal/10 border border-brand-teal/30 rounded-lg text-center">
                        <Check size={24} className="mx-auto text-brand-teal mb-2" />
                        <p className="text-brand-teal text-sm font-bold uppercase tracking-widest">Email Confirmed!</p>
                        <p className="text-white/50 text-xs mt-1">Log in with your credentials to access your account.</p>
                      </div>
                    )}
                    <h3 className="text-3xl font-bold uppercase tracking-tighter">
                      {isConfirmed ? 'Log In Now' : isLogin ? 'Welcome Back' : 'Join the Collective'}
                    </h3>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest">
                      {isLogin ? 'Enter your credentials to continue' : 'Creating your FMF account'}
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
                        onChange={(e) => { setErrorMsg(''); setShowUnverified(false); setFormData({ ...formData, email: e.target.value }); }}
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
                        placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
                          placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                        />
                      </div>
                    )}

                    {errorMsg && (
                      <div className="p-4 bg-brand-coral/10 border border-brand-coral/30 rounded-lg">
                        <p className="text-brand-coral text-xs leading-relaxed">{errorMsg}</p>
                      </div>
                    )}

                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-5 flex items-center justify-center gap-3 disabled:opacity-50">
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {isLogin ? 'Logging in...' : 'Creating account...'}
                        </>
                      ) : (
                        isLogin ? 'Login' : 'Complete Registration'
                      )}
                    </button>
                  </form>

                  <div className="text-center space-y-3">
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(true); setForgotEmail(formData.email); setForgotError(''); setForgotSent(false); }}
                        className="text-[10px] uppercase tracking-widest text-white/30 hover:text-brand-teal transition-colors block w-full"
                      >
                        Forgot Password?
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setShowUnverified(false); setShowForgotPassword(false); }}
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

      {/* ── Forgot Password Modal ── */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowForgotPassword(false); setForgotSent(false); setForgotError(''); }}
              className="absolute inset-0 bg-brand-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full max-w-md card-gradient p-12 space-y-8 rounded-[2rem] border border-white/10 shadow-2xl"
            >
              <button
                onClick={() => { setShowForgotPassword(false); setForgotSent(false); setForgotError(''); }}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {forgotSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-8 py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
                    className="w-20 h-20 bg-brand-teal rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(45,212,191,0.25)]"
                  >
                    <Send size={36} className="text-black" />
                  </motion.div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Reset Link <span className="text-brand-teal">Sent</span></h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      We've sent a password reset link to <span className="text-white font-bold">{forgotEmail}</span>.
                    </p>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest">
                      Check your inbox and follow the link to set a new password. The link expires in 1 hour.
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                    className="btn-primary w-full py-4 text-[10px] uppercase tracking-[0.4em] font-black"
                  >
                    Back to Login
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-2">
                      <Shield size={28} className="text-brand-teal" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Forgot <span className="text-brand-teal">Password?</span></h3>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">
                      Enter your account email and we'll send you a secure reset link.
                    </p>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setForgotSubmitting(true);
                      setForgotError('');
                      try {
                        await sendPasswordResetEmail(forgotEmail);
                        setForgotSent(true);
                      } catch (err: any) {
                        setForgotError(err?.message || 'Failed to send reset email. Please try again.');
                      } finally {
                        setForgotSubmitting(false);
                      }
                    }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Email Address</label>
                      <input
                        required
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
                        className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-brand-teal transition-colors rounded-lg"
                        placeholder="YOUR@EMAIL.COM"
                        autoFocus
                      />
                    </div>

                    {forgotError && (
                      <div className="p-4 bg-brand-coral/10 border border-brand-coral/30 rounded-lg">
                        <p className="text-brand-coral text-xs leading-relaxed">{forgotError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={forgotSubmitting || !forgotEmail}
                      className="btn-primary w-full py-5 flex items-center justify-center gap-3 disabled:opacity-50 text-[10px] uppercase tracking-[0.4em] font-black"
                    >
                      {forgotSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={14} /> Send Reset Link
                        </>
                      )}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setForgotError(''); }}
                    className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors block w-full text-center"
                  >
                    Back to Login
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Athlete Application CTA */}
      <section className="mt-40 py-24 border-t border-white/5 text-center space-y-8">
        <div className="max-w-xl mx-auto space-y-4">
           <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em] font-bold">Elite Affiliation</span>
           <h2 className="text-4xl font-bold uppercase tracking-tighter">Interested in becoming an <br/> <span className="text-brand-teal">FMF Athlete?</span></h2>
           <p className="text-white/40 uppercase tracking-widest text-[10px] leading-relaxed">
             Join our inner circle of elite performers and lead the collective. We are looking for professional coaches and high-performance individuals to represent the brand.
           </p>
        </div>
        <Link 
          to="/athlete-application" 
          className="inline-flex items-center gap-2 text-brand-teal text-xs uppercase tracking-[0.3em] font-bold hover:underline group"
        >
          Apply for Athlete Status <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
};

const ProfileGuard = () => {
  const navigate = useNavigate();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (waited) navigate('/membership?mode=login', { replace: true });
  }, [waited]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

// ── Reset Password Page ──────────────────────────────────────────────────────
// Supabase redirects here after the user clicks the email reset link.
// URL format: /#/reset-password (with token exchanged automatically by Supabase detectSessionInUrl,
// OR a ?code= param from PKCE flow that we must exchange ourselves).
const ResetPassword = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ready' | 'saving' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password strength
  const strength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#2dd4bf'][strength];

  useEffect(() => {
    const init = async () => {
      try {
        // PKCE flow: exchange code for session
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setStatus('ready');
          return;
        }

        // Implicit/magic-link flow: check if Supabase auto-set a session
        // (detectSessionInUrl picks up hash params automatically)
        await new Promise(resolve => setTimeout(resolve, 800));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('ready');
        } else {
          setStatus('error');
          setErrorMsg('Invalid or expired reset link. Please request a new one.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err?.message || 'Invalid or expired reset link.');
      }
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    setStatus('saving');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      setStatus('success');
      setTimeout(() => {
        navigate('/membership?mode=login', { replace: true });
      }, 3000);
    } catch (err: any) {
      setStatus('ready');
      showToast(err?.message || 'Failed to update password.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black px-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md card-gradient p-12 space-y-10 rounded-[3rem] border border-white/10 shadow-2xl"
      >
        {/* Loading */}
        {status === 'loading' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 py-8">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-brand-teal/10 animate-ping" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Verifying <span className="text-brand-teal">Link</span></h2>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Authenticating your reset session...</p>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 py-4">
            <div className="w-20 h-20 bg-brand-coral/15 rounded-full flex items-center justify-center mx-auto border border-brand-coral/30">
              <AlertCircle size={44} className="text-brand-coral" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Link <span className="text-brand-coral">Invalid</span></h2>
              <p className="text-sm text-white/50 leading-relaxed">{errorMsg}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/membership?mode=login', { replace: true })}
                className="btn-primary w-full py-5 text-[10px] uppercase tracking-[0.4em] font-black"
              >
                Back to Login
              </button>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">
                Go to login → click "Forgot Password?" to get a new link.
              </p>
            </div>
          </motion.div>
        )}

        {/* Success */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-center space-y-8 py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
              className="w-20 h-20 bg-brand-teal rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(45,212,191,0.3)]"
            >
              <Check size={44} className="text-black" />
            </motion.div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Password <span className="text-brand-teal">Updated</span></h2>
              <p className="text-sm text-white/50 uppercase tracking-widest">Your new password has been saved.</p>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">Redirecting you to login...</p>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className="h-full bg-brand-teal rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Password Form */}
        {(status === 'ready' || status === 'saving') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="space-y-3">
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-2">
                <Shield size={28} className="text-brand-teal" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">
                Set New <span className="text-brand-teal">Password</span>
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-white/40 leading-relaxed">
                Choose a strong password for your FMF account. Minimum 8 characters.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40">New Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-4 pr-12 text-sm focus:outline-none focus:border-brand-teal transition-colors rounded-lg"
                    placeholder="••••••••"
                    minLength={8}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((s) => (
                        <div
                          key={s}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: strength >= s ? strengthColor : 'rgba(255,255,255,0.06)' }}
                        />
                      ))}
                    </div>
                    <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40">Confirm Password</label>
                <div className="relative">
                  <input
                    required
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-white/5 border p-4 pr-12 text-sm focus:outline-none transition-colors rounded-lg ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-brand-coral/60 focus:border-brand-coral'
                        : 'border-white/10 focus:border-brand-teal'
                    }`}
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[9px] uppercase tracking-widest text-brand-coral font-bold">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'saving' || !password || !confirmPassword || password !== confirmPassword}
                className="btn-primary w-full py-5 flex items-center justify-center gap-3 disabled:opacity-50 text-[10px] uppercase tracking-[0.4em] font-black"
              >
                {status === 'saving' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} /> Update Password
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const PaymentSuccessModal = ({ tier, onClose }: { tier: string | null; onClose: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="w-full max-w-md p-10 rounded-[2rem] border border-brand-teal/30 bg-gradient-to-b from-[#0d0d0d] to-[#111] shadow-[0_0_60px_rgba(45,212,191,0.15)] text-center space-y-6"
    >
      <div className="mx-auto w-20 h-20 rounded-full bg-brand-teal/10 flex items-center justify-center">
        <svg className="w-10 h-10 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-black uppercase tracking-tight text-white">Congrats <span className="text-brand-teal">You're In</span></h2>
      <p className="text-white/50 text-sm leading-relaxed">
        Your payment went through successfully.
      </p>
      <p className="text-white/70 text-sm leading-relaxed">
        Time to build your streak and unlock your full potential.
      </p>
      <p className="mt-2">
        <span className="text-brand-teal font-black text-xs uppercase tracking-[0.3em]">Own Your Power</span>
      </p>
      <button
        onClick={onClose}
        className="w-full py-4 bg-brand-teal text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-brand-teal/90 transition-all"
      >
        Continue
      </button>
    </motion.div>
  </div>
);

const Profile = ({ user, logout, updateTier, showToast }: { user: UserProfile; logout: () => void; updateTier: (tier: string) => void; showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const location = useLocation();
  const [paymentSuccess, setPaymentSuccess] = useState<{ show: boolean; tier: string | null }>({ show: false, tier: null });

  useEffect(() => {
    // Check ALL possible param locations for HashRouter compatibility
    const routerParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams((window.location.hash || '').split('?')[1] || '');
    const windowParams = new URLSearchParams(window.location.search);

    const payment = routerParams.get('payment') || hashParams.get('payment') || windowParams.get('payment');
    const tier = routerParams.get('tier') || hashParams.get('tier') || windowParams.get('tier');

    console.log('[FPH] payment check:', { payment, tier, locationSearch: location.search, hash: window.location.hash });

    if (payment === 'success') {
      setPaymentSuccess({ show: true, tier });
      if (tier) updateTier(tier);
      window.history.replaceState(null, '', window.location.pathname + '#/profile');
      return;
    }

    const stored = sessionStorage.getItem('fph_payment_success');
    if (stored) {
      sessionStorage.removeItem('fph_payment_success');
      setPaymentSuccess({ show: true, tier: stored === 'true' ? null : stored });
      if (stored !== 'true') updateTier(stored);
    }
  }, [location]);

  return (
    <>
      <AnimatePresence>
        {paymentSuccess.show && (
          <PaymentSuccessModal
            tier={paymentSuccess.tier}
            onClose={() => setPaymentSuccess({ show: false, tier: null })}
          />
        )}
      </AnimatePresence>
      <ProfileDashboard
        user={user}
        logout={logout}
        updateTier={updateTier}
        showToast={showToast}
      />
    </>
  );
};

const Philosophy = () => {
  const pillars = [
    { 
      title: 'Discipline', 
      desc: 'Consistency is the foundation of all progress. We believe in showing up when you don\'t want to, because that is where true strength is forged.', 
      icon: <Dumbbell size={32} />,
      color: 'text-brand-coral'
    },
    { 
      title: 'Movement', 
      desc: 'The human body was designed for freedom and power. Our training focuses on mastering your own weight before adding external resistance.', 
      icon: <Zap size={32} />,
      color: 'text-brand-teal'
    },
    { 
      title: 'Energy', 
      desc: 'Training is not just about burning calories; it is about generating energy. A strong body fuels a sharp mind and a resilient spirit.', 
      icon: <Heart size={32} />,
      color: 'text-brand-coral'
    },
    { 
      title: 'Lifestyle', 
      desc: 'Fitness is not a destination or a phase. It is an essential part of how you live, eat, think, and interact with the world.', 
      icon: <Star size={32} />,
      color: 'text-brand-teal'
    },
  ];

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 space-y-6 max-w-3xl">
          <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">The FMF Manifesto</span>
          <h1 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter leading-none">
            Master Your <br /> <span className="text-brand-teal italic">Existence</span>
          </h1>
          <p className="text-white/60 text-xl font-light leading-relaxed">
            Fashion Meetz Fitness is more than a brand. It is a philosophy of living with intention, discipline, and aesthetic excellence.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
          {pillars.map((pillar, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-gradient p-12 space-y-8 group hover:border-brand-teal/30 transition-all"
            >
              <div className={`${pillar.color} group-hover:scale-110 transition-transform duration-500`}>
                {pillar.icon}
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-bold uppercase tracking-tighter">{pillar.title}</h3>
                <p className="text-white/40 text-lg font-light leading-relaxed">{pillar.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">The <span className="text-brand-coral">Architect's</span> Vision</h2>
            <div className="space-y-6 text-white/60 text-lg font-light leading-relaxed">
              <p>
                Michael Leggett founded FMF with a simple yet profound realization: the discipline required to master one's physical body is the same discipline required to master any aspect of life.
              </p>
              <p>
                By blending the raw, functional power of calisthenics with the refined aesthetics of high fashion, we create an environment where performance and presence coexist.
              </p>
            </div>
            <div className="pt-8 border-t border-white/10">
              <p className="text-2xl italic font-light text-white/80 leading-tight">
                "We don't just build muscles. We build the character required to use them with purpose."
              </p>
              <p className="text-sm font-bold uppercase tracking-widest text-white/40 mt-4">— Michael Leggett</p>
            </div>
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden">
            <img 
              src="https://picsum.photos/seed/philosophy-vision/1000/1000" 
              alt="FMF Vision" 
              className="w-full h-full object-cover grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-60" />
          </div>
        </div>
      </div>
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
        {LANDING_ATHLETES.map((athlete) => (
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


const Recovery = () => {
  const navigate = useNavigate();
  return (
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

          <button onClick={() => navigate('/services')} className="btn-primary">Book Recovery Session</button>
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
};

const FAQItem = ({ question, answer }: { question: string; answer: React.ReactNode }) => {
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
              <div className="text-white/40 leading-relaxed text-base font-light space-y-4">
                {answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VideoDetail = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, toggleFavorite, toggleBookmark } = useAuth();
  const [video, setVideo] = useState<Video | undefined>(VIDEOS.find(v => v.id === id));
  const [loading, setLoading] = useState(!video);
  const [isLogging, setIsLogging] = useState(false);

  const handleLogWorkout = async () => {
    if (!user) {
      if (showToast) showToast('Please login to log a workout', 'error');
      return;
    }
    
    setIsLogging(true);
    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      // Check existing sessions today
      const { data: existing } = await supabase
        .from('calendar_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_date', todayStr);
        
      const sessionCount = existing?.length || 0;
      
      await supabase.from('calendar_sessions').insert({
        user_id: user.id,
        source_type: 'check_in',
        title: sessionCount >= 1 ? `Second Session: ${video?.title || 'Workout'}` : `Completed: ${video?.title || 'Workout'}`,
        session_date: todayStr,
        session_time: now.toISOString().split('T')[1].split('.')[0],
        duration_minutes: parseInt(video?.duration || '45'),
        status: 'completed'
      });
      
      if (sessionCount === 0) {
        await supabase.from('profiles').update({
          last_checkin: now.toISOString(),
          streak_count: (user.streak_count || user.streak || 0) + 1
        }).eq('id', user.id);
        if (showToast) showToast('🔥 Workout Logged! Streak increased!', 'success');
      } else {
        if (showToast) showToast('✅ Additional workout logged!', 'success');
      }
      
      // Navigate to profile dashboard after brief delay to see the active streak
      setTimeout(() => navigate('/profile'), 1500);
      
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Failed to log workout', 'error');
    } finally {
      setIsLogging(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!video && id) {
      const fetchVideo = async () => {
        try {
          const { data, error } = await supabase.from('videos').select('*').eq('id', id).single();
          if (error) throw error;
          if (data) {
            setVideo(data as Video);
          }
        } catch (error) {
          console.error('Error fetching video:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchVideo();
    }
  }, [id, video]);

  if (loading) {
    return (
      <div className="pt-40 pb-32 px-6 text-center">
        <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
        <p className="text-white/40 uppercase tracking-widest text-xs">Loading workout...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="pt-40 pb-32 px-6 text-center">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-8">Video Not Found</h1>
        <Link to="/videos" className="btn-primary inline-block">Back to Library</Link>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isLocked = video.isPremium && (!user || user.tier === 'Basic') && !isAdmin;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-32 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase tracking-widest text-[10px] mb-12"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div className="relative aspect-video rounded-3xl overflow-hidden card-gradient shadow-2xl">
              {isLocked ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-10 text-center p-12">
                  <Zap size={48} className="text-brand-coral mb-6 animate-pulse" />
                  <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4">Elite Content</h2>
                  <p className="text-white/60 max-w-md mx-auto mb-8 uppercase tracking-widest text-xs leading-relaxed">
                    This masterclass is exclusive to Power Hour members. Upgrade your account to unlock our full training library.
                  </p>
                  <Link to="/membership" className="btn-primary px-12">Upgrade Now</Link>
                </div>
              ) : (
                <iframe
                  src={video.video_url?.replace('watch?v=', 'embed/')}
                  title={video.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              )}
              <img src={video.thumbnail_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'; }} alt={video.title} className="absolute inset-0 w-full h-full object-cover -z-10 opacity-40" />
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-brand-teal text-[10px] uppercase tracking-[0.4em] font-bold">{video.category_id}</span>
                    <span className="text-brand-coral text-[10px] uppercase tracking-widest border border-brand-coral/20 px-2 py-0.5 rounded">{video.level}</span>
                  </div>
                  <h1 className="text-5xl font-bold uppercase tracking-tighter leading-none">{video.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={async () => {
                      const { success, message } = await toggleBookmark(video.id);
                      if (showToast) showToast(message, success ? 'success' : 'error');
                    }}
                    className={`p-4 rounded-full backdrop-blur-md transition-all ${
                      user?.bookmarks?.includes(video.id) 
                        ? 'bg-brand-teal text-black' 
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Bookmark size={20} className={user?.bookmarks?.includes(video.id) ? 'fill-black' : ''} />
                  </button>
                  <button 
                    onClick={async () => {
                      const { success, message } = await toggleFavorite(video.id);
                      if (showToast) showToast(message, success ? 'success' : 'error');
                    }}
                    className={`p-4 rounded-full backdrop-blur-md transition-all ${
                      user?.favorites?.includes(video.id) 
                        ? 'bg-brand-coral text-white' 
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Heart size={20} className={user?.favorites?.includes(video.id) ? 'fill-white' : ''} />
                  </button>
                  <button 
                    onClick={async () => {
                      const url = `${window.location.origin}/#/video/${video.id}`;
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: video.title,
                            text: `Check out ${video.title} on FMF Power Hour`,
                            url: url
                          });
                        } catch (err) {
                          console.error('Error sharing:', err);
                        }
                      } else {
                        navigator.clipboard.writeText(url);
                        if (showToast) showToast('Video link copied to clipboard!', 'success');
                      }
                    }}
                    className="p-4 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                    title="Share Video"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-white/80 text-xl leading-relaxed font-light">
                  {video.description}
                </p>
                <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <h4 className="text-xs uppercase tracking-[0.3em] text-brand-teal mb-4 font-bold">Session Overview</h4>
                  <p className="text-white/50 text-sm leading-relaxed">
                    This session is designed to push your boundaries while maintaining perfect form. Focus on the mind-muscle connection and breathe through every movement.
                  </p>
                </div>
                
                {user && (
                    <button 
                      disabled={isLogging}
                      onClick={handleLogWorkout}
                      className="w-full mt-8 py-5 flex items-center justify-center gap-3 bg-brand-teal text-black uppercase tracking-widest text-[11px] font-black rounded-2xl hover:bg-brand-teal/90 transition-all disabled:opacity-50 shadow-[0_0_40px_rgba(45,212,191,0.2)]"
                    >
                      {isLogging ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle size={20} className="fill-black text-brand-teal" />
                      )}
                      {isLogging ? 'Logging Session...' : 'Complete Session & Log Check-in'}
                    </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-teal">Key Benefits</h3>
                  <div className="space-y-4">
                    {(video.benefits || []).map((benefit, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-2 h-2 rounded-full bg-brand-teal group-hover:scale-150 transition-transform" />
                        <span className="text-xs uppercase tracking-widest text-white/80">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-coral">Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-white/5">
                      <span className="text-[10px] uppercase tracking-widest text-white/20">Duration</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold">{video.duration}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/5">
                      <span className="text-[10px] uppercase tracking-widest text-white/20">Intensity</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold">{video.level}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/5">
                      <span className="text-[10px] uppercase tracking-widest text-white/20">Equipment</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold">Bodyweight</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="card-gradient p-10 space-y-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Instructor</h3>
              <div className="flex items-center gap-6">
                <img 
                  src={video.instructorImage} 
                  alt={video.instructor} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-brand-teal/30"
                />
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-tighter">{video.instructor}</h4>
                  <p className="text-[10px] text-brand-teal uppercase tracking-widest font-bold">Master Trainer</p>
                </div>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                Expert in functional movement and high-performance calisthenics. Marcus has trained thousands of athletes worldwide.
              </p>
              <button className="w-full py-4 border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 transition-all">
                View Trainer Profile
              </button>
            </div>

            <div className="card-gradient p-10 space-y-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Next Session</h3>
              <div className="space-y-6">
                {VIDEOS.filter(v => v.id !== video.id).slice(0, 2).map(v => (
                  <Link key={v.id} to={`/video/${v.id}`} className="flex gap-4 group">
                    <div className="w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                      <img src={v.thumbnail_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'; }} alt={v.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-tight group-hover:text-brand-teal transition-colors">{v.title}</h4>
                      <p className="text-[8px] text-white/40 uppercase tracking-widest">{v.duration}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/videos" className="block text-center text-[10px] uppercase tracking-widest text-brand-teal font-bold hover:underline">
                View All Workouts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RetreatPage = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', experience: '', goals: '' });
  const [liveRetreats, setLiveRetreats] = useState<Retreat[]>([]);

  // Fetch live retreats from Supabase on mount
  useEffect(() => {
    supabase
      .from('retreats')
      .select('*')
      .eq('visibility_status', 'published')
      .then(({ data, error }) => {
        if (error) {
          console.warn('[RetreatPage] Could not load retreats from DB:', error.message);
          return;
        }
        if (data && data.length > 0) {
          setLiveRetreats(data as Retreat[]);
        }
      });
  }, []);

  // Use live Supabase retreats; fall back to the hardcoded array so the page is never empty.
  // useMemo prevents TDZ issues in the Vite production bundle when referencing the
  // module-level RETREATS constant inside a closure.
  const displayRetreats = useMemo(
    () => (liveRetreats.length > 0 ? liveRetreats : RETREATS),
    [liveRetreats]
  );

  const handleApply = () => {
    // Pre-fill form from logged-in user profile
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.full_name || '',
        email: prev.email || user.email || ''
      }));
    }
    setIsModalOpen(true);
    setFormStep(1);
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (formStep === 1 && formData.name && formData.email && formData.phone) {
      setFormStep(2);
    }
  };

  const handleBack = () => {
    if (formStep === 2) setFormStep(1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Resolve the first published retreat id from Supabase
      const retreat_id = liveRetreats[0]?.id ||
        (await supabase.from('retreats').select('id').eq('visibility_status', 'published').limit(1)
          .then(r => r.data?.[0]?.id)) ||
        null;

      const { error } = await supabase.from('retreat_applications').insert({
        retreat_id,
        user_id: user?.id || null,
        user_name: formData.name,
        user_email: formData.email,
        phone: formData.phone || null,
        status: 'pending',
        message: [
          formData.experience && `Experience: ${formData.experience}`,
          formData.goals && `Goals: ${formData.goals}`
        ].filter(Boolean).join('\n\n') || null
      });

      if (error) throw error;

      setFormStep(3);
      showToast(`Application received! We'll be in touch at ${formData.email}`, 'success');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', experience: '', goals: '' });
        setFormStep(1);
      }, 5000);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      showToast(err.message || 'Failed to submit application. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={displayRetreats[0]?.cover_image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1920&auto=format&fit=crop'}
            alt="Miami Beach Retreat"
            className="w-full h-full object-cover opacity-50"
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
            <img src="https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=600&auto=format&fit=crop" alt="Beach Training" className="rounded-2xl aspect-[3/4] object-cover" />
            <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop" alt="Rooftop Workout" className="rounded-2xl aspect-[3/4] object-cover translate-y-12" />
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section className="py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold uppercase tracking-tighter mb-16 text-center">Upcoming <span className="text-brand-coral">Experiences</span></h2>
          <div className="space-y-12">
            {displayRetreats.map((retreat) => (
              <div key={retreat.id} className="card-gradient overflow-hidden rounded-[2rem] border border-white/10 group">
                {/* Hero Image */}
                <div className="relative h-72 lg:h-96 overflow-hidden">
                  <img
                    src={retreat.cover_image}
                    alt={retreat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                  {/* Overlay badges */}
                  <div className="absolute bottom-8 left-8 right-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-brand-coral text-[10px] uppercase tracking-widest font-bold mb-2">
                        <MapPin size={12} /> {retreat.location}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">{retreat.title}</h3>
                    </div>
                    <div className="flex flex-col gap-2 text-right">
                      <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                        {new Date(retreat.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="px-3 py-1 bg-brand-coral text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                        21+ Only
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-8 lg:p-12 space-y-8">
                  {/* Description preview */}
                  <p className="text-white/50 text-sm leading-relaxed max-w-2xl">
                    {retreat.description
                      ? retreat.description.replace(/[🏝️💰🔹🔸🏋️📍🧠⚠️]/gu, '').split('\n').find((l: string) => l.trim().length > 40) || retreat.description.substring(0, 280) + '…'
                      : 'An exclusive FMF immersion experience. Application required. Limited spots available.'}
                  </p>

                  {/* Pricing block — dual-tier for Miami Beach, single price for others */}
                  {retreat.description?.includes('2-WEEK') ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Tier 1 */}
                      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Option 1</p>
                            <h4 className="text-xl font-black uppercase tracking-tight mt-1">2-Week Transformation</h4>
                            <p className="text-[10px] text-white/40 mt-1">
                              {retreat.start_date ? new Date(retreat.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'June 1st'} · 14 Days
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-black text-brand-teal">$15,000</p>
                          </div>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-white/50">
                          {['2 daily training sessions', 'Beach + rooftop workouts', 'Mobility & recovery', 'Nutrition guidance'].map(item => (
                            <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-teal rounded-full flex-shrink-0" />{item}</li>
                          ))}
                        </ul>
                      </div>
                      {/* Tier 2 */}
                      <div className="p-6 bg-brand-coral/5 border border-brand-coral/20 rounded-2xl space-y-4 relative overflow-hidden">
                        <div className="absolute top-4 right-4 px-2 py-0.5 bg-brand-coral text-black text-[8px] font-black uppercase tracking-widest rounded-full">
                          ⚠️ Only 4 Spots
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-brand-coral/60 font-bold">Option 2</p>
                            <h4 className="text-xl font-black uppercase tracking-tight mt-1">1-Month Full Immersion</h4>
                            <p className="text-[10px] text-white/40 mt-1">
                              {retreat.start_date ? new Date(retreat.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'June 1st'} – {retreat.end_date ? new Date(retreat.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'June 30th'} · 30 Days
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-black text-brand-coral">$25,000</p>
                          </div>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-white/50">
                          {['Everything in 2-week +', 'Advanced calisthenics progression', 'Performance tracking', 'Full FMF lifestyle integration'].map(item => (
                            <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-coral rounded-full flex-shrink-0" />{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    /* Single-price card for other retreats */
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Investment</p>
                          <p className="text-3xl font-black text-brand-teal">
                            {retreat.price
                              ? (typeof retreat.price === 'number'
                                  ? `$${Number(retreat.price).toLocaleString()}`
                                  : String(retreat.price).startsWith('$') ? retreat.price : `$${retreat.price}`)
                              : 'Contact for Pricing'}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          {retreat.start_date && (
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                              {new Date(retreat.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              {retreat.end_date && ` – ${new Date(retreat.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
                            </p>
                          )}
                          {(retreat as any).capacity && (
                            <p className="text-[9px] text-brand-coral font-black uppercase tracking-widest">
                              {(retreat as any).capacity} Spots Max
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Requirements / notices */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-6 border-t border-white/5">
                    <div className="flex flex-wrap gap-4">
                      {((retreat as any).requirements
                        ? (retreat as any).requirements.split('.').filter((s: string) => s.trim())
                        : ['Application Required', 'No Refunds Once Confirmed', '21+ To Attend', 'Limited Spots']
                      ).slice(0, 4).map((note: string) => (
                        <span key={note} className="text-[9px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-brand-coral rounded-full" />{note.trim()}
                        </span>
                      ))}
                    </div>
                    <button onClick={handleApply} className="btn-primary flex-shrink-0 px-10">
                      Apply Now
                    </button>
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
            { name: 'James Wilson', role: 'Entrepreneur', text: "The FMF retreat in Miami changed my entire perspective on discipline. It's not just about the training; it's about the mindset you carry into your business and life." },
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
              a: (
                <>
                  <p>All levels are welcome.</p>
                  <p>The program is built on calisthenics fundamentals, meaning every movement can be scaled to your level — from beginner to advanced.</p>
                  <p>Our coaching system focuses on:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Proper form</li>
                    <li>Progressive strength</li>
                    <li>Controlled intensity</li>
                  </ul>
                  <p>You are not expected to be in shape — you come here to become it.</p>
                </>
              )
            },
            { 
              q: 'Where in Miami Beach is the retreat held?', 
              a: (
                <>
                  <p>The retreat takes place across premium locations in Miami Beach, including:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Beach training zones (sunrise & daytime sessions)</li>
                    <li>Rooftop fitness spaces (hotel partnerships)</li>
                    <li>Private indoor training areas</li>
                  </ul>
                  <p>Exact locations are shared with confirmed participants prior to arrival.</p>
                </>
              )
            },
            { 
              q: 'Are meals included in the price?', 
              a: (
                <>
                  <p>Meals are not fully included, but guidance is.</p>
                  <p>We provide:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Daily nutrition recommendations</li>
                    <li>Approved meal options nearby</li>
                    <li>Access to clean, performance-focused food options</li>
                  </ul>
                  <p>This keeps flexibility while ensuring you stay aligned with the program.</p>
                </>
              )
            },
            { 
              q: 'Are flights included?', 
              a: (
                <>
                  <p>No — flights are not included.</p>
                  <p>Participants are responsible for their own travel to Miami.</p>
                  <p>Once you arrive, we guide you through the full experience.</p>
                </>
              )
            },
            { 
              q: 'Is there a minimum age requirement?', 
              a: (
                <>
                  <p>Yes.</p>
                  <p>Participants must be 21 years or older to join the retreat.</p>
                </>
              )
            },
            { 
              q: 'What should I pack?', 
              a: (
                <>
                  <p>Keep it simple and performance-focused:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Training clothes (lightweight, breathable)</li>
                    <li>Running shoes / training shoes</li>
                    <li>Swimwear (for recovery & beach sessions)</li>
                    <li>Towel & hydration bottle</li>
                    <li>Optional: resistance bands / recovery tools</li>
                  </ul>
                  <p>Miami weather is warm — pack accordingly.</p>
                </>
              )
            },
            { 
              q: 'Can I extend my stay?', 
              a: (
                <>
                  <p>Yes.</p>
                  <p>Many clients choose to extend their stay before or after the program.</p>
                  <p>We can:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Recommend accommodations</li>
                    <li>Suggest additional experiences</li>
                    <li>Guide you through extended training options</li>
                  </ul>
                </>
              )
            },
            { 
              q: 'Can I come alone?', 
              a: (
                <>
                  <p>Yes — and most people do.</p>
                  <p>This is not just a fitness program, it’s an environment.</p>
                  <p>You’ll be surrounded by:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Like-minded individuals</li>
                    <li>Athletes, entrepreneurs, and high-performers</li>
                    <li>A structured but social atmosphere</li>
                  </ul>
                  <p>You won’t feel alone — you’ll feel aligned.</p>
                </>
              )
            },
            { 
              q: 'What is the cancellation policy?', 
              a: (
                <>
                  <p>All retreat bookings are final and non-refundable.</p>
                  <p>Due to the nature of scheduling, staffing, and limited availability, we do not offer refunds once a spot is secured.</p>
                  <p>However:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You may request a reschedule (case-by-case basis)</li>
                    <li>Credits may be applied to future programs when applicable</li>
                  </ul>
                </>
              )
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
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Phone Number <span className="text-brand-coral">*</span></label>
                      <input 
                        type="tel"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-teal outline-none transition-colors"
                        placeholder="+1 (305) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleNext}
                    disabled={!formData.name || !formData.email || !formData.phone}
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
              <div className="text-3xl font-bold text-brand-coral">2022</div>
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

const MainAppContent = ({ showToast, toast, setToast }: { showToast: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void; toast: any; setToast: any }) => {
  const { user, logout, updateTier } = useAuth();

  return (
    <Router>
      <ScrollToTop />
      <FreeAccessGate user={user} />
      <div className="min-h-screen bg-brand-black text-brand-white font-sans selection:bg-brand-teal selection:text-white">
        <Navbar />
        
        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={user ? <Navigate to="/profile" replace /> : <Home />} />
              <Route path="/philosophy" element={user ? <Navigate to="/profile" replace /> : <Philosophy />} />
              <Route path="/mission" element={<Mission />} />
              <Route path="/run-club" element={<RunClub />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/flexmob305" element={<FlexMob305 showToast={showToast} />} />
              <Route path="/services/personal-training" element={<PersonalTraining showToast={showToast} />} />
              <Route path="/program" element={<ProgramPage />} />
              <Route path="/athletes" element={<AthletesDirectory showToast={showToast} />} />
              <Route path="/athlete-application" element={<AthleteApplicationPage showToast={showToast} />} />
              <Route path="/videos" element={<VideoLibrary showToast={showToast} />} />
              <Route path="/video/:id" element={<VideoDetail showToast={showToast} />} />
              <Route path="/membership" element={<Membership showToast={showToast} />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword showToast={showToast} />} />
              <Route path="/community" element={<CommunityPage user={user} showToast={showToast} />} />
              <Route path="/community/:id" element={<CommunityDetail user={user} showToast={showToast} />} />
              <Route path="/schedule" element={<Schedule showToast={showToast} />} />
              <Route path="/shop" element={<Store />} />
              <Route path="/shop/:category" element={<Store />} />
              <Route path="/shop/product/:id" element={<ProductDetail />} />
              <Route path="/brand/:slug" element={<BrandPage />} />
              <Route path="/profile" element={
                user ? (
                  <Profile user={user} logout={logout} updateTier={updateTier} showToast={showToast} />
                ) : (
                  <ProfileGuard />
                )
              } />
              <Route path="/order-history" element={<Navigate to="/profile#orders" replace />} />
              <Route path="/recovery" element={<Recovery />} />
              <Route path="/retreats" element={<RetreatPage showToast={showToast} />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/liability" element={<LiabilityWaiver />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={
                user && (user.role === 'admin' || user.role === 'super_admin') ? (
                  <AdminDashboard user={user} logout={logout} showToast={showToast} />
                ) : (
                  <Navigate to="/" replace />
                )
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer showToast={showToast} />

        {/* Global Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className={`fixed bottom-12 left-1/2 z-[200] px-8 py-4 card-gradient flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border ${
                toast.type === 'success' ? 'border-brand-teal/30' : 
                toast.type === 'error' ? 'border-brand-coral/30' : 
                toast.type === 'warning' ? 'border-amber-500/30' : 'border-blue-500/30'
              }`}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                toast.type === 'success' ? 'bg-brand-teal shadow-glow-teal' : 
                toast.type === 'error' ? 'bg-brand-coral shadow-glow-coral' : 
                toast.type === 'warning' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
              }`} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-4 text-white/20 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default function App() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };


  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <MainAppContent showToast={showToast} toast={toast} setToast={setToast} />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}



