/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ProfileDashboard } from './components/profile/ProfileDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AthleteDashboard } from './components/athlete/AthleteDashboard';
import { CommunityPage } from './components/community/CommunityPage';
import { CommunityDetail } from './components/community/CommunityDetail';
import { AthleteApplication } from './components/AthleteApplication';
import { 
  Menu, X, Instagram, Twitter, Facebook, ArrowRight, ArrowLeft,
  Play, Calendar, ShoppingBag, Info, ChevronRight, ChevronLeft,
  Dumbbell, Zap, Heart, MapPin, Clock, Star, AlertCircle,
  Filter, Search, User, Quote, Plus, Minus, Upload, Link2, Send, Bell, Trash2,
  Youtube, ExternalLink, Share2, Trophy, Check, Users, Power, Ban, Layout, Globe,
  Edit2, Truck, Eye, Printer, UserPlus, UserMinus, MoreHorizontal,
  LayoutDashboard, PlayCircle, ListChecks, MessageSquare, ClipboardList, Package as PackageIcon, History, TrendingUp, Download, ShieldCheck, Award
} from 'lucide-react';
import React, { useState, useEffect, useMemo, useRef, FormEvent, createContext, useContext, ReactNode, Component } from 'react';
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
            <div className="w-16 h-16 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto text-brand-teal">
              <Clock size={32} />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tighter">Something Went Wrong</h2>
            <p className="text-white/40 text-sm leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => {
                (this as any).setState({ hasError: false, error: null });
                window.location.href = window.location.origin + window.location.pathname + '#/';
              }}
              className="btn-primary w-full"
            >
              Try Again
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

// Branded placeholder generator â€” replace with real product photos later
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
    name: "CLÃ‰ PARIS L'EAU",
    slug: 'cle-paris-leau',
    description: 'A fresh, sophisticated fragrance for the modern athlete.',
    price: 120,
    compare_at_price: 150,
    sku: 'FRG-001',
    inventory_count: 30,
    status: 'active',
    featured_image: placeholder('ClÃ© Paris', 'c4a265'),
    images: [placeholder('ClÃ© Paris', 'c4a265')],
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
    link: '/store',
    buttonText: 'View Collection'
  },
  { 
    id: 'c2', 
    name: 'FLEX MOB 305', 
    category: 'Recovery & Mobility', 
    description: 'Specializing in professional assisted stretching and muscle recovery designed to support athletes and optimize performance.',
    image: placeholder('Flex Mob 305'),
    link: '/recovery',
    buttonText: 'Learn More'
  },
  { 
    id: 'c3', 
    name: 'PIER ST BARTH', 
    category: 'Luxury Resort Fitness', 
    description: 'Luxury resort-inspired fitness and swimwear brand blending beach aesthetics with fitness culture and premium performance.',
    image: placeholder('Pier St Barth', '60a5fa'),
    link: '/store',
    buttonText: 'View Collection'
  },
  { 
    id: 'c4', 
    name: 'CLÃ‰ PARIS', 
    category: 'Luxury Fragrance & Lifestyle', 
    description: 'Represents the elegance and sophistication of the FMF lifestyle. Luxury, confidence, and personal presence for the refined athlete.',
    image: placeholder('ClÃ© Paris', 'c4a265'),
    link: '/store',
    buttonText: 'Explore Brand'
  },
  { 
    id: 'c5', 
    name: 'MIKE WATER FITNESS', 
    category: 'Functional Nutrition', 
    description: 'Cold-pressed functional juices designed for performance, recovery, and daily balance. Clean fuel for the body without additives or artificial sugars.',
    image: placeholder('Mike Water', '4ade80'),
    link: '/store',
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
    title: 'Miami Beach Immersion', 
    description: 'Our exclusive flagship experience. Miami Beach is currently our only retreat location, focusing on high-intensity calisthenics, mindset workshops, and luxury wellness on the Florida coast.',
    cover_image: 'https://picsum.photos/seed/fmfr1/1200/600', 
    start_date: '2026-06-15T09:00:00Z',
    end_date: '2026-06-20T17:00:00Z',
    location: 'Miami Beach, FL', 
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
  toggleFavorite: (videoId: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateSecurity: (email?: string, password?: string) => Promise<void>;
  logActivity: (action: string, entityType: string, entityId?: string, metadata?: any) => Promise<void>;
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
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      // Map DB columns to app's UserProfile shape
      const profile: UserProfile = {
        ...data,
        full_name: data.full_name || data.name || data.email || 'Member',
        signup_date: data.signup_date || data.joinedAt || data.created_at || new Date().toISOString(),
        role: data.role || (data.email?.toLowerCase() === 'fashionmeetzfitness86@gmail.com' ? 'super_admin' : 'user'),
        status: data.status || 'active',
        created_at: data.created_at || data.signup_date || data.joinedAt || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
      setUser(profile);
      return;
    }

    // No profile row found - build user from auth session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const meta = session.user.user_metadata || {};
      const displayName = meta.display_name || meta.full_name || session.user.email?.split('@')[0] || 'Member';
      const now = new Date().toISOString();

      // In-memory user for immediate UI
      const memUser: any = {
        id: session.user.id,
        full_name: displayName,
        email: session.user.email || '',
        role: session.user.email?.toLowerCase() === 'fashionmeetzfitness86@gmail.com' ? 'super_admin' : 'user',
        tier: 'Free Access',
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
        email: session.user.email || '',
        role: session.user.email?.toLowerCase() === 'fashionmeetzfitness86@gmail.com' ? 'super_admin' : 'user',
        tier: 'Free Access',
        status: 'active',
        signup_date: now
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUser(session.user.id);
        fetchNotifications(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser(session.user.id);
        fetchNotifications(session.user.id);
      } else {
        setUser(null);
        setNotifications([]);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, tier: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { display_name: name },
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;

      if (data.user) {
        // Use profiles table
        const dbRow = {
          id: data.user.id,
          full_name: name,
          email,
          role: email.toLowerCase() === 'fashionmeetzfitness86@gmail.com' ? 'super_admin' : 'user',
          tier: tier || 'Free Access',
          status: 'active',
          signup_date: new Date().toISOString()
        };
        await supabase.from('profiles').insert(dbRow);
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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
      // Don't notify yourself
      if (notif.user_id === session?.user?.id) return;

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
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const currentFavorites = user.favorites || [];
      const isFavorited = currentFavorites.includes(videoId);
      const newFavorites = isFavorited
        ? currentFavorites.filter(id => id !== videoId)
        : [...currentFavorites, videoId];

      await supabase.from('profiles').update({ favorites: newFavorites }).eq('id', session.user.id);
      fetchUser(session.user.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const updateProfile = async (profileUpdate: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase.from('profiles').update({
        ...profileUpdate,
        updated_at: new Date().toISOString()
      }).eq('id', session.user.id);

      if (error) throw error;
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
      updateProfile,
      updateSecurity,
      logActivity
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
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        // In a real app, navigate to the post
                      }}
                      className={`p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${!(notif as any).is_read ? 'bg-brand-teal/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${notif.type === 'like' ? 'bg-brand-coral/20 text-brand-coral' : 'bg-brand-teal/20 text-brand-teal'}`}>
                          {((notif as any).from_user_name || (notif as any).fromUserName || '?').charAt(0)}
                        </div>
                        <div className="flex-grow space-y-1">
                          <p className="text-[11px] text-white/80 leading-tight">
                            <span className="font-bold text-white">{(notif as any).from_user_name || (notif as any).fromUserName || 'Someone'}</span> {notif.type === 'like' ? 'liked' : 'commented on'} your post:
                          </p>
                          <p className="text-[10px] text-white/40 italic truncate max-w-[180px]">"{(notif as any).post_content || (notif as any).postContent || ''}"</p>
                          <p className="text-[8px] text-white/20 uppercase tracking-widest">{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {!(notif as any).is_read && (
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

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Philosophy', path: '/philosophy' },
    { name: 'Athletes', path: '/athletes' },
    { name: 'Community', path: '/community' },
    { name: 'Shop', path: '/shop' },
    { name: 'Retreats', path: '/retreats' },
    { name: 'Services', path: '/services' },
    { name: 'Membership', path: '/membership' },
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
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link to="/admin/dashboard" className="hidden lg:flex items-center space-x-2 text-xs uppercase tracking-widest text-brand-teal hover:text-white transition-colors">
              <ShieldCheck size={16} />
              <span>{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
            </Link>
          )}
          {user ? (
            <div className="hidden lg:flex items-center space-x-4">
              <NotificationBell />
              <Link to="/profile" className="flex flex-col items-end group">
                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-teal group-hover:text-white transition-colors">{user.full_name}</span>
                <span className="text-[8px] uppercase tracking-widest text-white/40">{user.tier}</span>
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
                          <span className="text-sm font-bold text-brand-teal uppercase tracking-widest">{user.full_name}</span>
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
                    <Link 
                      to="/order-history" 
                      onClick={() => setIsOpen(false)}
                      className="text-white/60 text-xs uppercase tracking-widest hover:text-brand-teal transition-colors"
                    >
                      Order History
                    </Link>
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
          <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-white">Terms of Service</a></li>
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
            By subscribing, you agree to our <a href="#" className="text-white/40 hover:text-white underline underline-offset-4">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-[10px] uppercase tracking-[0.3em] text-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
      <span>Â© 2026 Fitness Power Hour. All Rights Reserved.</span>
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
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('visibility_status', 'published')
          .limit(3);
        if (error) throw error;
        if (data && data.length > 0) {
          setFeaturedVideos(data as Video[]);
        } else {
          setFeaturedVideos(VIDEOS.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setFeaturedVideos(VIDEOS.slice(0, 3));
      }
    };
    fetchVideos();
  }, []);

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
              <button onClick={() => navigate('/membership')} className="btn-primary">Get Started</button>
              <button onClick={() => navigate('/videos')} className="btn-outline">Explore Program</button>
              <button onClick={() => navigate('/shop')} className="btn-secondary">Shop Collection</button>
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
              Fitness Power Hour is not just a workout program â€” it is a lifestyle built around discipline, movement, and personal strength. We focus on four core pillars that define the FMF way of life.
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
              <div className="space-y-2">
                <Heart className="text-brand-coral" size={32} />
                <h4 className="font-bold uppercase text-sm">Energy</h4>
                <p className="text-xs text-white/40">Training fuels the mind and body for peak performance.</p>
              </div>
              <div className="space-y-2">
                <Star className="text-brand-teal" size={32} />
                <h4 className="font-bold uppercase text-sm">Lifestyle</h4>
                <p className="text-xs text-white/40">Fitness becomes an essential part of how you live.</p>
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

      {/* Local Pass Promotion */}
      <section className="py-32 px-6 bg-brand-teal/5 border-y border-brand-teal/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Miami Local</span>
              <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none">
                Physical <br /> <span className="text-brand-coral italic">Local Passes</span>
              </h2>
              <p className="text-white/50 text-lg font-light leading-relaxed">
                Visiting Miami or just want to experience the Power Hour locally? Our physical passes give you full access to the FMF ecosystem for a limited time, including our signature recovery beverages.
              </p>
              <div className="flex flex-wrap gap-8">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-white">$59</p>
                  <p className="text-[10px] uppercase tracking-widest text-brand-teal font-bold">3-Day Pass</p>
                </div>
                <div className="w-px h-12 bg-white/10 hidden md:block" />
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-white">$89</p>
                  <p className="text-[10px] uppercase tracking-widest text-brand-teal font-bold">7-Day Pass</p>
                </div>
              </div>
              <button onClick={() => navigate('/membership')} className="btn-primary">Get Your Pass</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Cold-Pressed Juice', icon: <Zap size={20} /> },
                { title: 'Ginger Shot', icon: <Zap size={20} /> },
                { title: 'Beverage of Choice', icon: <Zap size={20} /> }
              ].map((item, i) => (
                <div key={i} className="card-gradient p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-brand-teal/20 rounded-full flex items-center justify-center text-brand-teal mx-auto">
                    {item.icon}
                  </div>
                  <p className="text-[10px] uppercase tracking-widest font-bold leading-tight">{item.title}</p>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest">Included Free</p>
                </div>
              ))}
            </div>
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
            {featuredVideos.map((video) => (
              <motion.div
                key={video.id}
                whileHover={{ y: -10 }}
                className="card-gradient overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/video/${video.id}`)}
              >
                <div className="relative aspect-video">
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                  {video.isPremium && (
                    <div className="absolute top-4 left-4 bg-brand-coral text-white text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded flex items-center gap-1 shadow-lg z-10">
                      <Zap size={10} fill="white" />
                      Elite
                    </div>
                  )}
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
            <div className="text-brand-coral font-bold uppercase tracking-[0.3em] text-sm">Anderson Djeemo</div>
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
                Fitness Power Hour is not just a workout program â€” it is a lifestyle built around discipline, movement, and personal strength.
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
                â€œYour body is the first tool you were given. Learning how to use it changes everything.â€
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/40">â€” Michael Leggett</p>
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
      weeks: 'Weeks 1â€“4',
      focus: ['Mobility', 'Core Stability', 'Body Control'],
      exercises: ['Push-ups', 'Squats', 'Planks', 'Lunges'],
      goal: 'Prepare the body for more advanced training.',
      color: 'brand-teal'
    },
    {
      title: 'Power',
      weeks: 'Weeks 5â€“8',
      focus: ['Explosive Strength', 'Endurance', 'Conditioning'],
      exercises: ['Jump Squats', 'Pull-ups', 'Burpees', 'Core Circuits'],
      goal: 'Build athletic performance.',
      color: 'brand-coral'
    },
    {
      title: 'Mastery',
      weeks: 'Weeks 9â€“12',
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
            <p className="text-white/40 text-sm uppercase tracking-widest">45â€“60 Minutes of Focused Discipline</p>
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
              src={`https://www.youtube.com/embed/${video.video_url?.split('v=')[1]}?autoplay=1`}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
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

  if (!user || user.role !== 'admin') {
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

const VideoLibrary = () => {
  const { user, toggleFavorite } = useAuth();
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
      // Visibility check
      const userTier = user?.tier || 'everyone';
      const visibility = v.visibility || 'everyone';
      
      let hasAccess = false;
      if (user?.role === 'admin' || user?.role === 'super_admin') hasAccess = true;
      else if (visibility === 'everyone') hasAccess = true;
      else if (visibility === 'Basic' && userTier !== 'everyone') hasAccess = true;
      else if ((visibility === 'Premium' || visibility === 'Elite') && (userTier === 'Elite' || userTier === 'Admin')) hasAccess = true;

      if (!hasAccess) return false;

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
              <h1 className="text-5xl font-bold uppercase tracking-tighter mb-4">Video <span className="text-brand-teal">Library</span></h1>
              <p className="text-white/40 uppercase tracking-widest text-xs">Master your movement with guided sessions</p>
            </div>
            {user?.role === 'admin' && (
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} /> Add Video
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
                className={`card-gradient overflow-hidden group cursor-pointer ${video.isPremium && (!user || user.tier === 'Basic') ? 'opacity-80' : ''}`}
                onClick={() => navigate(`/video/${video.id}`)}
              >
                <div className="relative aspect-video">
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                  {video.isPremium && (
                    <div className="absolute top-4 left-4 bg-brand-coral text-white text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded flex items-center gap-1 shadow-lg z-10">
                      <Zap size={10} fill="white" />
                      Elite
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {video.isPremium && (!user || user.tier === 'Basic') ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-brand-black/80 rounded-full flex items-center justify-center shadow-2xl border border-brand-coral/50">
                          <Zap size={20} className="text-brand-coral" />
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-brand-coral font-bold bg-brand-black/80 px-2 py-1 rounded">Unlock with Elite</span>
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

const CartModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const isMember = user && user.tier !== 'Basic';
  const discount = 0.3;
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
                      <img src={item.product.featured_image} alt={item.product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
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
                      <span>Member Discount (30%)</span>
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
                  Shipping and taxes calculated at checkout. <br />
                  Secure payment powered by FMF.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
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

  const isMember = user && user.tier !== 'Basic';
  const discount = 0.3; // 30% discount for members

  const tabs = ['All', 'Apparel', 'Gear', 'Accessories', 'Fragrance', 'Lifestyle', 'Nutrition'];
  const collections = ['All', 'FMF Training Collection', 'FMF Lifestyle Collection', 'FMF x Sorority Collection', 'Pier St Barth Collection', 'CLÃ‰ Paris Collection', 'Mike Water Fitness'];

  const filteredProducts = useMemo(() => {
    let filtered = PRODUCTS;
    if (activeTab !== 'All') {
      filtered = filtered.filter(p => p.category_id === activeTab.toLowerCase());
    }
    if (activeCollection !== 'All') {
      filtered = filtered.filter(p => p.brand_id === activeCollection);
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
                <img src={product.featured_image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-brand-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white text-brand-black px-8 py-4 rounded-full flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all font-bold text-[10px] uppercase tracking-widest shadow-2xl">
                    <ShoppingBag size={16} />
                    Quick View
                  </button>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-brand-black/60 backdrop-blur-md text-[9px] uppercase tracking-widest px-2 py-1 rounded">{product.brand_id}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-tight group-hover:text-brand-teal transition-colors">{product.name}</h3>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{product.category_id}</p>
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
                    <img src={p.featured_image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                    src={selectedProduct.featured_image} 
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
                        <Zap size={12} /> Join Power Hour for 30% off
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
                                price: isMember ? Math.floor(selectedProduct.price * 0.7) : selectedProduct.price,
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
                    <img src={product.featured_image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
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

            <div className="mt-32 p-12 md:p-24 rounded-[3rem] bg-gradient-to-br from-brand-black via-brand-black to-brand-teal/10 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-gradient-to-l from-[#c4a265]/20 to-transparent" />
              <div className="relative z-10 max-w-xl space-y-8">
                <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">Luxury Lifestyle</span>
                <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none">
                  CLÃ‰ <span className="text-brand-teal italic">Paris</span>
                </h2>
                <p className="text-white/60 text-lg font-light leading-relaxed italic">
                  "Train with discipline. Move with strength. Carry yourself with elegance."
                </p>
                <div className="space-y-4 text-sm text-white/40 leading-relaxed">
                  <p>
                    CLÃ‰ Paris represents the elegance and sophistication of the Fashion meetz Fitness lifestyle. Luxury, confidence, and personal presence for the refined athlete.
                  </p>
                </div>
                <button className="btn-primary">Explore CLÃ‰ Paris</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const ProgramBuilder = ({ videos, showToast }: { videos: Video[], showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [programTitle, setProgramTitle] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (data) setUsers(data as UserProfile[]);
      if (error) console.error('Error fetching users:', error);
    };
    fetchUsers();
  }, []);

  const handleAddVideo = (video: Video) => {
    if (!selectedVideos.find(v => v.id === video.id)) {
      setSelectedVideos([...selectedVideos, video]);
    }
  };

  const handleRemoveVideo = (videoId: string) => {
    setSelectedVideos(selectedVideos.filter(v => v.id !== videoId));
  };

  const handleSaveProgram = async () => {
    if (!selectedUser || !programTitle || selectedVideos.length === 0) {
      showToast('Please fill all fields', 'error');
      return;
    }

    const newProgram: Program = {
      id: `prog-${Date.now()}`,
      title: programTitle,
      description: 'Personalized training program',
      video_ids: selectedVideos.map(v => v.id),
      created_by: 'admin',
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('user_programs').upsert({
        id: selectedUser,
        programs: [newProgram]
      });
      showToast('Program linked to user!', 'success');
      setProgramTitle('');
      setSelectedVideos([]);
      setSelectedUser('');
    } catch (error) {
      showToast('Error saving program', 'error');
    }
  };

  return (
    <div className="card-gradient p-8 space-y-8">
      <h3 className="text-xl font-bold uppercase tracking-tight">Build & Link <span className="text-brand-teal">Program</span></h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Select User</label>
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal"
            >
              <option value="">Choose a user...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Program Title</label>
            <input 
              type="text"
              value={programTitle}
              onChange={(e) => setProgramTitle(e.target.value)}
              placeholder="e.g. 4-Week Strength Phase"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Selected Videos ({selectedVideos.length})</label>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {selectedVideos.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-xs font-bold truncate">{v.title}</span>
                  <button onClick={() => handleRemoveVideo(v.id)} className="text-brand-coral hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {selectedVideos.length === 0 && (
                <p className="text-[10px] text-white/20 uppercase tracking-widest text-center py-4">No videos selected</p>
              )}
            </div>
          </div>

          <button onClick={handleSaveProgram} className="btn-primary w-full py-4">Link Program to Profile</button>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest text-white/40">Available Videos</label>
          <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {videos.map(v => (
              <div 
                key={v.id} 
                onClick={() => handleAddVideo(v)}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-brand-teal cursor-pointer transition-all group"
              >
                <img src={v.thumbnail_url} className="w-16 h-10 object-cover rounded grayscale group-hover:grayscale-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold truncate">{v.title}</p>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest">{v.level} â€¢ {v.duration}</p>
                </div>
                <Plus size={14} className="text-white/20 group-hover:text-brand-teal" />
              </div>
            ))}
          </div>
        </div>
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedService, setSelectedService] = useState('Stretching');

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase.from('bookings').select('*').eq('service_type', 'flex_mob');
      if (data) setBookings(data as Booking[]);
      if (error) console.error('Error fetching bookings:', error);
    };
    fetchBookings();
  }, []);

  const handleBookingRequest = async () => {
    if (!user) {
      showToast('Please login to request a booking', 'error');
      return;
    }

    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        user_name: user.full_name,
        service_type: 'flex_mob',
        service_name: selectedService,
        date: selectedDate,
        time: '10:00 AM',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      showToast('Booking request sent successfully');
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const services = ['Massages', 'Stretching', 'Physical Therapy'];

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div className="space-y-12">
            <header className="space-y-6">
              <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">Recovery & Mobility</span>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Flex Mob <span className="text-brand-coral">305</span></h1>
              <p className="text-white/60 text-lg font-light leading-relaxed">
                Specializing in professional assisted stretching and muscle recovery designed to support athletes and optimize performance.
              </p>
            </header>

            <div className="space-y-8">
              <h3 className="text-2xl font-bold uppercase tracking-tighter">Our Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {services.map(s => (
                  <div key={s} className={`p-6 border rounded-2xl transition-all cursor-pointer ${selectedService === s ? 'border-brand-coral bg-brand-coral/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`} onClick={() => setSelectedService(s)}>
                    <p className="text-sm font-bold uppercase tracking-widest text-center">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-gradient p-10 space-y-8">
              <h3 className="text-2xl font-bold uppercase tracking-tighter">Request Appointment</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Select Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-brand-coral outline-none transition-all"
                  />
                </div>
                <button onClick={handleBookingRequest} className="btn-primary w-full bg-brand-coral hover:bg-brand-coral/80">Request Booking</button>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="card-gradient p-10 space-y-8">
              <h3 className="text-2xl font-bold uppercase tracking-tighter">Booking Calendar</h3>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <p className="text-white/40 text-sm italic">No bookings scheduled yet.</p>
                ) : (
                  bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/5">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-tighter">{booking.service_name}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{booking.date} at {booking.time}</p>
                      </div>
                      <span className={`text-[8px] uppercase tracking-widest px-2 py-1 rounded-full ${
                        booking.status === 'approved' ? 'bg-brand-teal/20 text-brand-teal' :
                        booking.status === 'pending' ? 'bg-brand-coral/20 text-brand-coral' :
                        'bg-white/10 text-white/40'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="aspect-video rounded-3xl overflow-hidden">
              <img src="https://picsum.photos/seed/flexmob-lifestyle/1000/600" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonalTraining = ({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase.from('bookings').select('*').eq('service_type', 'personal_training');
      if (data) setSessions(data as Booking[]);
      if (error) console.error('Error fetching sessions:', error);
    };
    fetchSessions();
  }, []);

  const handleRequest = async () => {
    if (!user) {
      showToast('Please login to request a session', 'error');
      return;
    }

    // Check if class is full (max 5)
    const existingAtTime = sessions.filter(s => s.date === selectedDate && s.status === 'approved');
    if (existingAtTime.length >= 5) {
      showToast('This session is full', 'error');
      return;
    }

    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        user_name: user.full_name,
        service_type: 'personal_training',
        service_name: 'Studio Session',
        date: selectedDate,
        time: '09:00 AM',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      showToast('Session request sent');
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  return (
    <div className="pt-40 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div className="space-y-12">
            <header className="space-y-6">
              <span className="text-brand-teal text-[10px] uppercase tracking-[0.5em]">Studio Training</span>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Personal <span className="text-brand-teal">Training</span></h1>
              <p className="text-white/60 text-lg font-light leading-relaxed">
                Elite functional training sessions in our private studio. Maximum 5 participants per session for personalized attention.
              </p>
            </header>

            <div className="card-gradient p-10 space-y-8">
              <h3 className="text-2xl font-bold uppercase tracking-tighter">Book a Session</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Select Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-brand-teal outline-none transition-all"
                  />
                </div>
                <button onClick={handleRequest} className="btn-primary w-full">Request Session</button>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="card-gradient p-10 space-y-8">
              <h3 className="text-2xl font-bold uppercase tracking-tighter">Upcoming Sessions</h3>
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <p className="text-white/40 text-sm italic">No sessions scheduled.</p>
                ) : (
                  sessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/5">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-tighter">{session.date}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{session.time}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[8px] uppercase tracking-widest px-2 py-1 rounded-full ${
                          session.status === 'approved' ? 'bg-brand-teal/20 text-brand-teal' :
                          session.status === 'pending' ? 'bg-brand-coral/20 text-brand-coral' :
                          'bg-white/10 text-white/40'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = PRODUCTS.find(p => p.id === id);
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
              <img src={product.featured_image} alt={product.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" referrerPolicy="no-referrer" />
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
                    <img src={p.featured_image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
  const brandProducts = PRODUCTS.filter(p => p.brand_id.toLowerCase().replace(/ /g, '-') === slug);

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
                <img src={product.featured_image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
          <div className="text-4xl font-bold text-brand-teal">Elite</div>
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
  const { user, login, signup, logout, updateTier } = useAuth();
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
      name: 'Basic',
      price: '$19.99',
      period: 'per month',
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
      name: 'Elite',
      price: '$59',
      period: 'per month',
      features: [
        'Full training system',
        'Retreat priority access',
        'Community features & Live Q&A',
        'Special product drops',
        '1-on-1 mindset coaching',
        'Personalized nutrition plan',
        'Direct trainer messaging'
      ],
      button: 'Go Elite',
      highlight: true,
      badge: 'Priority Access'
    },
    {
      name: 'Local Collective',
      price: '$299',
      period: 'per month',
      features: [
        'Full training system',
        'Retreat priority access',
        'Exclusive content',
        'Special product drops',
        '1-on-1 mindset coaching',
        'Personalized nutrition plan',
        'Direct trainer messaging',
        '1x Free Cold-Pressed Juice / mo',
        '1x Free Ginger Shot / mo',
        '1x Free Beverage of choice / mo'
      ],
      button: 'Join Locally',
      highlight: false,
      badge: 'Local Only'
    }
  ];

  const localPasses = [
    {
      name: '3-Day Local Pass',
      price: '$59',
      period: 'one-time',
      features: [
        '3 Days Full Access',
        'Physical Local Pass',
        '1x Free Cold-Pressed Juice',
        '1x Free Ginger Shot',
        '1x Free Beverage of choice'
      ],
      button: 'Purchase Pass',
      highlight: false,
      badge: 'Limited Time'
    },
    {
      name: '7-Day Local Pass',
      price: '$89',
      period: 'one-time',
      features: [
        '7 Days Full Access',
        'Physical Local Pass',
        '1x Free Cold-Pressed Juice',
        '1x Free Ginger Shot',
        '1x Free Beverage of choice'
      ],
      button: 'Purchase Pass',
      highlight: false,
      badge: 'Best Value'
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
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        // Don't navigate here â€” useEffect on user will close modal and redirect
      } else {
        if (formData.password !== formData.confirmPassword) {
          showToast('Passwords do not match', 'error');
          return;
        }
        await signup(formData.name, formData.email, formData.password, selectedTier?.name || 'Basic');
        setIsSuccess(true);
      }
    } catch (error: any) {
      const errMsg = error?.message || '';
      let msg = 'Action failed';
      if (errMsg.includes('already registered') || errMsg.includes('already been registered')) msg = 'This email is already registered. Try logging in instead.';
      else if (errMsg.includes('Invalid login credentials')) msg = 'Incorrect email or password. Please try again.';
      else if (errMsg.includes('Email not confirmed')) msg = 'Your email is not confirmed yet. Please check your inbox and click the confirmation link.';
      else if (errMsg.includes('Password should be')) msg = 'Password must be at least 6 characters.';
      else if (errMsg) msg = errMsg;
      setErrorMsg(msg);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

        {/* Local Passes Section */}
        <section className="mt-40">
          <div className="text-center mb-16 space-y-4">
            <span className="text-brand-coral text-[10px] uppercase tracking-[0.5em]">Physical Passes</span>
            <h2 className="text-4xl font-bold uppercase tracking-tighter">Miami <span className="text-brand-teal italic">Local Passes</span></h2>
            <p className="text-white/40 text-xs uppercase tracking-widest max-w-xl mx-auto">Short-term access for visitors and locals. Includes our signature recovery beverages.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {localPasses.map((pass, i) => (
              <div 
                key={i} 
                className="card-gradient p-12 flex flex-col space-y-8 relative overflow-hidden border-brand-teal/20"
              >
                {pass.badge && (
                  <div className="absolute top-6 right-6 bg-brand-teal text-black text-[8px] font-bold px-2 py-1 uppercase tracking-widest rounded">
                    {pass.badge}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tighter mb-2">{pass.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{pass.price}</span>
                    <span className="text-xs text-white/40 uppercase tracking-widest">{pass.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 flex-grow">
                  {pass.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-white/60">
                      <Check size={16} className="text-brand-teal" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleJoin(pass)}
                  className="w-full py-4 bg-brand-teal text-black uppercase tracking-widest text-[10px] font-bold hover:bg-white transition-all"
                >
                  {pass.button}
                </button>
              </div>
            ))}
          </div>
        </section>

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
                  <th className="py-6 text-[10px] uppercase tracking-widest text-white font-bold text-center">Basic</th>
                  <th className="py-6 text-[10px] uppercase tracking-widest text-brand-coral font-bold text-center">Elite</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Basic Workouts', basic: true, elite: true },
                  { name: 'Full Video Library', basic: false, elite: true },
                  { name: 'Structured Programs', basic: false, elite: true },
                  { name: 'Training Calendar', basic: false, elite: true },
                  { name: '30% Store Discount', basic: false, elite: true },
                  { name: 'Community Forum', basic: true, elite: true },
                  { name: 'Exclusive Mobility Flows', basic: false, elite: true },
                  { name: 'Monthly Live Q&A', basic: false, elite: true },
                  { name: 'Retreat Priority Access', basic: false, elite: true },
                  { name: '1-on-1 Mindset Coaching', basic: false, elite: true },
                  { name: 'Personalized Nutrition', basic: false, elite: true },
                  { name: 'Direct Trainer Messaging', basic: false, elite: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 text-white/60 font-light">{row.name}</td>
                    <td className="py-6 text-center">
                      {row.basic ? <Check size={18} className="mx-auto text-white/40" /> : <X size={18} className="mx-auto text-white/10" />}
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
                  Power Hour Members receive preferred pricing and exclusive access across the Fashion Meets Fitness platform. We've built an inner circle for those dedicated to the lifestyle.
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
                <p className="text-brand-teal text-[10px] uppercase tracking-widest mt-4 font-bold">â€” Michael L, Founder</p>
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
                    <button
                      onClick={() => { setIsRegistering(false); setIsSuccess(false); setFormData({ name: '', email: '', password: '', confirmPassword: '' }); }}
                      className="btn-primary mt-4"
                    >
                      Got It
                    </button>
                  )}
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
                        onChange={(e) => { setErrorMsg(''); setFormData({ ...formData, email: e.target.value }); }}
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

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    useEffect(() => {
      navigate('/membership?mode=login');
    }, [navigate]);
    return null;
  }

  const orders = user.orderHistory || [];

  return (
    <div className="pt-40 pb-32 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 space-y-4">
          <Link to="/profile" className="text-brand-teal text-[10px] uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
            <ArrowRight size={14} className="rotate-180" /> Back to Profile
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-coral/20 rounded-full flex items-center justify-center text-brand-coral">
              <ShoppingBag size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">Order <span className="text-brand-coral">History</span></h1>
              <p className="text-white/40 uppercase tracking-widest text-xs">View and track your past purchases</p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((order: any) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id} 
                className="card-gradient p-8 flex flex-col md:flex-row justify-between gap-8 hover:border-brand-teal/30 transition-all group"
              >
                <div className="space-y-6 flex-grow">
                  <div className="flex items-center justify-between md:justify-start md:gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-white/20">Order ID</p>
                      <p className="text-sm font-bold uppercase tracking-widest text-white">{order.id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-white/20">Date Placed</p>
                      <p className="text-sm text-white/60 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/20">Items Purchased</p>
                    <div className="flex flex-wrap gap-3">
                      {order.items.map((item: string, i: number) => (
                        <div key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase tracking-widest text-white/80 group-hover:border-brand-teal/20 transition-colors">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-between items-end gap-6 md:min-w-[150px] border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase tracking-widest text-white/20">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                      order.status === 'Delivered' ? 'bg-brand-teal/20 text-brand-teal' : 'bg-brand-coral/20 text-brand-coral'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase tracking-widest text-white/20">Total Amount</p>
                    <p className="text-2xl font-bold text-white">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="card-gradient p-20 text-center space-y-8">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                <ShoppingBag size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-tight">No Orders Yet</h3>
                <p className="text-white/40 text-xs uppercase tracking-widest">Your purchase history will appear here once you've made a purchase.</p>
              </div>
              <Link to="/store" className="btn-primary inline-block px-12">
                Visit the FMF Store
              </Link>
            </div>
          )}
        </div>

        <footer className="mt-20 p-10 bg-brand-teal/5 border border-brand-teal/10 rounded-3xl">
          <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-widest text-brand-teal">Need Assistance?</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Our support team is available 24/7 for order inquiries.</p>
            </div>
            <button className="px-8 py-4 border border-brand-teal/30 text-brand-teal text-[10px] uppercase tracking-widest font-bold hover:bg-brand-teal hover:text-black transition-all">
              Contact Support
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, logout, updateTier } = useAuth();
  const navigate = useNavigate();
  const [waited, setWaited] = useState(false);
  const { showToast } = (window as any).fmfToast || { showToast: () => {} };

  // Handle payment success redirect from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (params.get('payment') === 'success') {
      const tier = params.get('tier');
      if (tier && user) {
        updateTier(tier);
      }
      if (showToast) showToast('Payment successful! Welcome to your new plan.', 'success');
      // Clean URL
      window.history.replaceState(null, '', window.location.pathname + '#/profile');
    }
  }, [user]);

  useEffect(() => {
    if (user) return;
    const timer = setTimeout(() => setWaited(true), 2000);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (!user && waited) navigate('/membership?mode=login');
  }, [user, waited, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black">
        <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ProfileDashboard 
      user={user} 
      logout={logout} 
      updateTier={updateTier} 
      showToast={showToast} 
    />
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
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/40">â€” Michael Leggett</p>
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

const mockPosts: Post[] = [
  {
    id: 'p1',
    community_id: '1',
    user_id: 'u1',
    user_name_snapshot: 'Alex Rivera',
    title: 'New PR!',
    content: 'Just hit a new PB on muscle ups! 12 reps clean. The Power Hour system really works if you stay consistent. Who else is training today?',
    likes: ['u2', 'u3'],
    comments: [
      { id: 'c1', user_id: 'u2', user_name_snapshot: 'Sarah', content: 'Insane work Alex! Keep pushing.', created_at: '2026-03-07T10:00:00Z' }
    ],
    tags: ['Progress', 'Calisthenics'],
    created_at: '2026-03-07T09:00:00Z',
    updated_at: '2026-03-07T09:00:00Z'
  },
  {
    id: 'p2',
    community_id: '1',
    user_id: 'u4',
    user_name_snapshot: 'Elena Vance',
    title: 'Morning Flow',
    content: 'Morning mobility flow at the beach. Nothing beats starting the day with movement and the sound of the ocean. #FMF #Lifestyle',
    image_url: 'https://picsum.photos/seed/fmf-post-1/800/600',
    likes: ['u1', 'u5', 'u6'],
    comments: [],
    tags: ['Lifestyle', 'Mobility'],
    created_at: '2026-03-08T07:30:00Z',
    updated_at: '2026-03-08T07:30:00Z'
  }
];

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

const LegacyCommunityPage = () => {
  const { user, addNotification } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'post' | 'comment', postId: string, commentId?: string } | null>(null);

  useEffect(() => {
    // In a real app, we'd fetch from Firestore here
    setPosts(mockPosts);
  }, []);

  const handlePostSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;

    const newPost: Post = {
      id: `p-${Date.now()}`,
      community_id: '1',
      user_id: user.id,
      user_name_snapshot: user.full_name,
      title: 'New Post',
      content: newPostContent,
      likes: [],
      comments: [],
      tags: ['General'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
            user_id: post.user_id,
            type: 'like',
            fromUserId: user.id,
            fromUserName: user.full_name,
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
            {user && (user.role === 'admin' || user.role === 'athlete') ? (
              <div className="card-gradient p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal font-bold text-xs">
                    {user.full_name.charAt(0)}
                  </div>
                  <button 
                    onClick={() => setIsPosting(true)}
                    className="flex-grow text-left px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white/40 text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Share your progress, {user.full_name.split(' ')[0]}...
                  </button>
                </div>
              </div>
            ) : user ? (
              <div className="card-gradient p-8 text-center space-y-4">
                <p className="text-xs text-white/40 uppercase tracking-widest">Only Admins and Athletes can post on the feed. You can still like posts!</p>
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
                        {post.user_name_snapshot.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold uppercase tracking-tight">{post.user_name_snapshot}</h4>
                        </div>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {post.user_id === user?.id && (
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
                    {post.image_url && (
                      <div className="rounded-2xl overflow-hidden border border-white/5">
                        <img src={post.image_url} alt="Post content" className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
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
                              <span className="text-[10px] font-bold uppercase tracking-tight">{comment.user_name_snapshot}</span>
                              <span className="text-[8px] text-white/20 uppercase tracking-widest">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                              {comment.user_id === user?.id && (
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
                  {user && (user.role === 'admin' || user.role === 'athlete') && (
                    <div className="pt-4 flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-brand-teal">
                        {user.full_name.charAt(0)}
                      </div>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const input = form.elements.namedItem('comment') as HTMLInputElement;
                          if (!input.value.trim()) return;
                          
                          const newComment: CommunityComment = {
                            id: `c-${Date.now()}`,
                            user_id: user.id,
                            user_name_snapshot: user.full_name,
                            content: input.value,
                            created_at: new Date().toISOString()
                          };

                          setPosts(posts.map(p => 
                            p.id === post.id ? { ...p, comments: [...p.comments, newComment] } : p
                          ));
                          addNotification({
                            user_id: post.user_id,
                            type: 'comment',
                            fromUserId: user.id,
                            fromUserName: user.full_name,
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

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, toggleFavorite } = useAuth();
  const [video, setVideo] = useState<Video | undefined>(VIDEOS.find(v => v.id === id));
  const [loading, setLoading] = useState(!video);

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
              <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 w-full h-full object-cover -z-10 opacity-40" />
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
                    onClick={() => toggleFavorite(video.id)}
                    className={`p-4 rounded-full backdrop-blur-md transition-all ${
                      user?.favorites?.includes(video.id) 
                        ? 'bg-brand-coral text-white' 
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Heart size={20} className={user?.favorites?.includes(video.id) ? 'fill-white' : ''} />
                  </button>
                  <button className="p-4 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-teal">Key Benefits</h3>
                  <div className="space-y-4">
                    {video.benefits.map((benefit, i) => (
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
                      <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
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
                  <img src={retreat.cover_image} alt={retreat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
                  <div className="absolute top-6 left-6 bg-brand-teal px-4 py-2 text-[10px] uppercase tracking-widest font-bold">{new Date(retreat.start_date).toLocaleDateString()}</div>
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

const MainAppContent = ({ showToast, toast, setToast }: { showToast: (m: string, t?: 'success' | 'error') => void; toast: any; setToast: any }) => {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-brand-black text-brand-white font-sans selection:bg-brand-teal selection:text-white">
        <Navbar />
        
        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/philosophy" element={<Philosophy />} />
              <Route path="/mission" element={<Mission />} />
              <Route path="/run-club" element={<RunClub />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/flexmob305" element={<FlexMob305 showToast={showToast} />} />
              <Route path="/services/personal-training" element={<PersonalTraining showToast={showToast} />} />
              <Route path="/program" element={<ProgramPage />} />
              <Route path="/videos" element={<VideoLibrary />} />
              <Route path="/video/:id" element={<VideoDetail />} />
              <Route path="/athlete-application" element={<AthleteApplication showToast={showToast} />} />
              <Route path="/athletes" element={<Athletes />} />
              <Route path="/membership" element={<Membership showToast={showToast} />} />
              <Route path="/community" element={<CommunityPage user={user} showToast={showToast} />} />
              <Route path="/community/:id" element={<CommunityDetail user={user} showToast={showToast} />} />
              <Route path="/schedule" element={<Schedule showToast={showToast} />} />
              <Route path="/shop" element={<Store />} />
              <Route path="/shop/:category" element={<Store />} />
              <Route path="/shop/product/:id" element={<ProductDetail />} />
              <Route path="/brand/:slug" element={<BrandPage />} />
              <Route path="/profile" element={<ProfileDashboard user={user!} showToast={showToast} />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/recovery" element={<Recovery />} />
              <Route path="/retreats" element={<RetreatPage showToast={showToast} />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={
                user && (user.role === 'admin' || user.role === 'super_admin') ? (
                  <AdminDashboard user={user} logout={logout} showToast={showToast} />
                ) : (
                  <Navigate to="/" replace />
                )
              } />
              <Route path="/athlete/dashboard" element={
                user && user.role === 'athlete' ? (
                  <AthleteDashboard athleteUser={user} showToast={showToast} />
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


