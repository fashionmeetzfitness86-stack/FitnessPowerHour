import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, Trophy, PlayCircle, 
  ListChecks, MapPin, MessageSquare, ShoppingBag, 
  ClipboardList, Package as PackageIcon, History, LogOut, ChevronRight,
  ShieldCheck, ArrowUpRight, Plus, Download, Search,
  Edit2, Eye, Ban, Trash2, Check, X, Printer,
  Filter, Activity, TrendingUp, DollarSign, Clock,
  CheckCircle, Video as VideoIcon, UserPlus, Star, 
  Mail, MessageCircle, Heart, Share2, ShieldAlert, AlertCircle, Truck, Calendar
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../App';
import { 
  UserProfile, Video, Product, Order, Retreat, 
  Community, ActivityLog, VideoCategory,
  Brand, RetreatApplication,
  CommunityPost, Package, SiteContent,
  ProgramTemplate, UserProgramAssignment,
  CalendarSession, ServiceRequest, ServiceAvailability
} from '../../types';

import { AdminOverview } from './AdminOverview';
import { UsersManager } from './UsersManager';
import { VideoManager } from './VideoManager';
import { CommunityManager } from './CommunityManager';
import { OrderManager } from './OrderManager';
import { RequestsManager } from './RequestsManager';
import { RetreatManager } from './RetreatManager';
import { AthletesManager } from './AthletesManager';
import { ShopManager } from './ShopManager';

interface AdminDashboardProps {
  user: UserProfile;
  logout: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const AdminDashboard = ({ user, logout, showToast }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [retreatApplications, setRetreatApplications] = useState<RetreatApplication[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  
  // Calendar & Services System
  const [calendarSessions, setCalendarSessions] = useState<CalendarSession[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [athleteProfiles, setAthleteProfiles] = useState<any[]>([]);
  const { logActivity } = useAuth();
  
  const [stats, setStats] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'overview' && !stats.users) {
           const [{ count: uCount }, { count: pCount }, { count: oCount }, { count: cCount }, logsRes, ordersRes] = await Promise.all([
             supabase.from('profiles').select('*', { count: 'exact', head: true }),
             supabase.from('products').select('*', { count: 'exact', head: true }),
             supabase.from('orders').select('*', { count: 'exact', head: true }),
             supabase.from('communities').select('*', { count: 'exact', head: true }),
             supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20),
             supabase.from('orders').select('total_amount').eq('status', 'paid')
           ]);
           
           const totalRevenue = ordersRes.data?.reduce((acc: number, curr: any) => acc + (curr.total_amount || 0), 0) || 0;

           setStats({
             users: uCount || 0,
             products: pCount || 0,
             orders: oCount || 0,
             communities: cCount || 0,
             revenue: totalRevenue.toFixed(2)
           });
        } else if (activeTab === 'users' && users.length === 0) {
           const { data } = await supabase.from('profiles').select('*').limit(50);
           if (data) setUsers(data.map((u: any) => ({ ...u, full_name: u.name || u.full_name || u.email || 'Unknown' })));
        } else if (activeTab === 'content' && videos.length === 0) {
           const [vRes, vcRes] = await Promise.all([
             supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(50),
             supabase.from('video_categories').select('*')
           ]);
           if (vRes.data) setVideos(vRes.data);
           if (vcRes.data) setVideoCategories(vcRes.data);
        } else if ((activeTab === 'orders' || activeTab === 'shop') && products.length === 0) {
           const [pRes, oRes] = await Promise.all([
             supabase.from('products').select('*').limit(50),
             supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50)
           ]);
           if (pRes.data) setProducts(pRes.data);
           if (oRes.data) setOrders(oRes.data);
        } else if (activeTab === 'community' && communities.length === 0) {
           const [cRes, cmRes, pRes] = await Promise.all([
             supabase.from('communities').select('*').limit(20),
             supabase.from('community_members').select('*'),
             supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(50)
           ]);
           if (cRes.data && cmRes.data) {
             setCommunities(cRes.data.map((c: any) => ({
               ...c,
               members: cmRes.data.filter((m: any) => m.community_id === c.id).map((m: any) => m.user_id)
             })));
           }
           if (pRes.data) setPosts(pRes.data);
        } else if (activeTab === 'requests' && serviceRequests.length === 0) {
           const { data } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false }).limit(50);
           if (data) setServiceRequests(data);
         } else if (activeTab === 'retreats' && retreats.length === 0) {
           const [rtRes, raRes] = await Promise.all([
             supabase.from('retreats').select('*').limit(50),
             supabase.from('retreat_applications').select('*').limit(50)
           ]);
           if (rtRes.data) setRetreats(rtRes.data);
           if (raRes.data) setRetreatApplications(raRes.data);
         } else if (activeTab === 'athletes' && athleteProfiles.length === 0) {
           const { data } = await supabase.from('athlete_profiles').select('*, user:users(full_name, profile_image)');
           if (data) setAthleteProfiles(data);
         }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        showToast('System synchronization error', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, activeTab]);

  // Handlers
  const handleSaveCommunity = async (data: Partial<Community>) => {
    try {
      if (data.id) {
        // Update
        const { error } = await supabase.from('communities').update({
          ...data,
          members: undefined // Remove helper from DB update
        }).eq('id', data.id);
        if (error) throw error;
        setCommunities(prev => prev.map(c => c.id === data.id ? { ...c, ...data } as Community : c));
        logActivity('UPDATE_COMMUNITY', 'community', data.id, data);
        showToast('Nexus configuration updated', 'success');
      } else {
        // Create
        const { data: newComm, error } = await supabase.from('communities').insert({
          ...data,
          created_by: user.id,
          created_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        if (newComm) {
          setCommunities(prev => [{ ...newComm, members: [] } as any, ...prev]);
          logActivity('CREATE_COMMUNITY', 'community', newComm.id, newComm);
        }
        showToast('New node initialized in the matrix', 'success');
      }
    } catch (error) {
      console.error('Error saving community:', error);
      showToast('Nexus configuration failed', 'error');
    }
  };

  const handleDeleteCommunity = async (id: string) => {
    try {
      await supabase.from('communities').delete().eq('id', id);
      setCommunities(prev => prev.filter(c => c.id !== id));
      logActivity('DELETE_COMMUNITY', 'community', id);
      showToast('Nexus space collapsed', 'success');
    } catch (error) {
      showToast('Failed to collapse space', 'error');
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await supabase.from('posts').delete().eq('id', id);
      setPosts(prev => prev.filter(p => p.id !== id));
      logActivity('DELETE_POST', 'post', id);
      showToast('Transmission purged', 'success');
    } catch (error) {
      showToast('Failed to purge transmission', 'error');
    }
  };

  const handleDeleteRetreat = async (id: string) => {
    try {
      await supabase.from('retreats').delete().eq('id', id);
      setRetreats(prev => prev.filter(r => r.id !== id));
      logActivity('DELETE_RETREAT', 'retreat', id);
      showToast('Expedition cancelled', 'success');
    } catch (error) {
      showToast('Failed to cancel expedition', 'error');
    }
  };

  const handleReviewRetreatApp = async (id: string, status: 'accepted' | 'declined') => {
    try {
      await supabase.from('retreat_applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      setRetreatApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      logActivity('REVIEW_RETREAT_APP', 'retreat_application', id, { status });
      showToast(`Applicant ${status}`, 'success');
    } catch (error) {
      showToast('Decision transmission failed', 'error');
    }
  };

  const handleSaveVideo = async (data: Partial<Video>) => {
    try {
      if (data.id) {
        const { error } = await supabase.from('videos').update(data).eq('id', data.id);
        if (error) throw error;
        setVideos(prev => prev.map(v => v.id === data.id ? { ...v, ...data } as Video : v));
        logActivity('UPDATE_VIDEO', 'video', data.id, data);
        showToast('Video metadata synchronized', 'success');
      } else {
        const { data: newV, error } = await supabase.from('videos').insert({ ...data, created_by: user.id }).select().single();
        if (error) throw error;
        if (newV) {
          setVideos(prev => [newV, ...prev]);
          logActivity('CREATE_VIDEO', 'video', newV.id, newV);
        }
        showToast('New media asset published', 'success');
      }
    } catch (err) { showToast('Video sync failed', 'error'); }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      const videoToDelete = videos.find(v => v.id === id);
      if (videoToDelete && videoToDelete.video_url) {
        // Extract file path from public URL and clear it from Storage to prevent memory leaks
        const urlParts = videoToDelete.video_url.split('/fmf-media/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          const { error: storageError } = await supabase.storage.from('fmf-media').remove([filePath]);
          if (storageError) console.error('Failed to remove asset from storage:', storageError);
        }
      }

      await supabase.from('videos').delete().eq('id', id);
      setVideos(prev => prev.filter(v => v.id !== id));
      logActivity('DELETE_VIDEO', 'video', id);
      showToast('Media asset purged', 'success');
    } catch (err) { showToast('Purge failed', 'error'); }
  };

  const handleSavePackage = async (data: Partial<Package>) => {
    try {
      if (data.id) {
        const { error } = await supabase.from('packages').update(data).eq('id', data.id);
        if (error) throw error;
        setPackages(prev => prev.map(p => p.id === data.id ? { ...p, ...data } as Package : p));
        logActivity('UPDATE_PACKAGE', 'package', data.id, data);
        showToast('Access tier updated', 'success');
      } else {
        const { data: newP, error } = await supabase.from('packages').insert(data).select().single();
        if (error) throw error;
        if (newP) {
          setPackages(prev => [newP, ...prev]);
          logActivity('CREATE_PACKAGE', 'package', newP.id, newP);
        }
        showToast('New access tier protocol established', 'success');
      }
    } catch (err) { showToast('Package sync failed', 'error'); }
  };

  const handleDeletePackage = async (id: string) => {
    try {
      await supabase.from('packages').delete().eq('id', id);
      setPackages(prev => prev.filter(p => p.id !== id));
      logActivity('DELETE_PACKAGE', 'package', id);
      showToast('Access tier decommissioned', 'success');
    } catch (err) { showToast('Decommissioning failed', 'error'); }
  };

  const handleSaveProduct = async (data: Partial<Product>) => {
    try {
      if (data.id) {
        const { error } = await supabase.from('products').update(data).eq('id', data.id);
        if (error) throw error;
        setProducts(prev => prev.map(p => p.id === data.id ? { ...p, ...data } as Product : p));
        logActivity('UPDATE_PRODUCT', 'product', data.id, data);
        showToast('Product metadata synchronized', 'success');
      } else {
        const { data: newP, error } = await supabase.from('products').insert(data).select().single();
        if (error) throw error;
        if (newP) {
          setProducts(prev => [newP, ...prev]);
          logActivity('CREATE_PRODUCT', 'product', newP.id, newP);
        }
        showToast('New product initialized', 'success');
      }
    } catch (err) { showToast('Product sync failed', 'error'); }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await supabase.from('products').delete().eq('id', id);
      setProducts(prev => prev.filter(p => p.id !== id));
      logActivity('DELETE_PRODUCT', 'product', id);
      showToast('Product decommissioned', 'success');
    } catch (err) { showToast('Decommissioning failed', 'error'); }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      logActivity('UPDATE_USER_PERMISSIONS', 'user', userId, updates);
      showToast('User clearance updated', 'success');
    } catch (error) {
      console.error('Update error:', error);
      showToast('Update failed', 'error');
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('service_requests').update({ status }).eq('id', id);
      if (error) throw error;
      setServiceRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      showToast(`Request marked as ${status}`, 'success');
    } catch (err) {
      showToast('Failed to update request', 'error');
    }
  };

  const handleScheduleRequest = async (req: any) => {
    try {
      // Create Calendar Session
      const { data, error } = await supabase.from('calendar_sessions').insert({
        user_id: req.user_id,
        source_type: 'service',
        related_service_request_id: req.id,
        title: req.service_subtype === 'recovery' ? 'Flex Mob 305 Session' : '1-on-1 Training Session',
        session_date: req.requested_date || new Date().toISOString().split('T')[0],
        session_time: req.requested_time || '12:00:00',
        status: 'approved',
        duration_minutes: 60
      }).select().single();
      
      if (error) throw error;

      // Update Service Request status
      await handleUpdateRequestStatus(req.id, 'scheduled');
      
      // Auto-dispatch notification for the user to see in their Dashboard
      await supabase.from('notifications').insert({
         user_id: req.user_id,
         type: 'service',
         title: 'Session Scheduled',
         message: `Your ${req.service_subtype === 'recovery' ? 'Flex Mob' : 'Training'} session is confirmed for ${req.requested_date}. Check your Schedule.`,
         metadata: { route: '#/profile' }
      });

      showToast('Session scheduled & synced to user dashboard', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to schedule session', 'error');
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'requests', label: 'Requests', icon: Calendar },
    { id: 'content', label: 'Content', icon: PlayCircle },
    { id: 'retreats', label: 'Retreats', icon: MapPin },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'athletes', label: 'Athletes', icon: Trophy },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: PackageIcon },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <div className="w-16 h-16 border-4 border-brand-teal border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(45,212,191,0.2)]" />
        <div className="text-center space-y-2">
          <p className="text-[12px] uppercase tracking-[0.4em] text-white/60 font-black animate-pulse">Syncing Ecosystem...</p>
          <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Verifying encryption & data integrity</p>
        </div>
      </div>
    );

    switch (activeTab) {
      case 'overview': return <AdminOverview stats={stats} />;
      case 'users': return (
        <UsersManager 
          users={users} 
          packages={packages} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          roleFilter={roleFilter} 
          setRoleFilter={setRoleFilter} 
          statusFilter={statusFilter} 
          setStatusFilter={setStatusFilter} 
          onEdit={() => {}} 
          onUpdateUser={handleUpdateUser}
          currentUser={user}
        />
      );
      case 'content': return (
        <VideoManager 
          videos={videos} 
          categories={videoCategories} 
          onUpload={() => handleSaveVideo({ title: 'New Video', visibility_status: 'draft', level: 'Beginner' })} 
          onEdit={handleSaveVideo} 
          onDelete={handleDeleteVideo} 
        />
      );
      case 'requests': return (
        <RequestsManager 
          requests={serviceRequests} 
          onUpdateStatus={handleUpdateRequestStatus} 
          onSchedule={handleScheduleRequest}
          showToast={showToast} 
        />
      );
      case 'retreats': return (
        <RetreatManager
          retreats={retreats}
          applications={retreatApplications}
          onAdd={() => {}}
          onReview={handleReviewRetreatApp}
          onDelete={handleDeleteRetreat}
        />
      );
      case 'athletes': return (
        <AthletesManager 
          athletes={athleteProfiles as any} 
          onEdit={async (athlete: any) => {
            const { profile, ...updates } = athlete;
            if (athlete.id) {
              await supabase.from('athlete_profiles').update(updates).eq('id', athlete.id);
              if (profile && profile.full_name) {
                 await supabase.from('profiles').update(profile).eq('id', athlete.id);
              }
              setAthleteProfiles(prev => prev.map(a => a.id === athlete.id ? { ...a, ...updates, profile: { ...a.profile, ...profile } } : a));
              showToast('Athlete updated', 'success');
            } else {
               showToast('Creation from dashboard requires auth sync. Invite user first.', 'error');
            }
          }}
          onDelete={async (id: string) => {
            await supabase.from('athlete_profiles').delete().eq('id', id);
            setAthleteProfiles(prev => prev.filter(a => a.id !== id));
            showToast('Athlete removed', 'success');
          }}
        />
      );
      case 'shop': return (
        <ShopManager 
          products={products as any} 
          onEdit={(product) => handleSaveProduct(product as any)} 
          onDelete={handleDeleteProduct} 
          memberDiscountValue={0.20}
        />
      );
      case 'community': return (
        <CommunityManager 
          communities={communities} 
          posts={posts} 
          users={users} 
          onAdd={() => {}} 
          onDeleteCommunity={handleDeleteCommunity} 
          onDeletePost={handleDeletePost} 
        />
      );
      case 'orders': return (
        <OrderManager 
          orders={orders} 
          users={users}
          onUpdateStatus={async (id, status) => {
             await supabase.from('orders').update({ status }).eq('id', id);
             setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
             showToast('Updated', 'success');
          }} 
          onViewDetails={() => {}} 
        />
      );
      default: return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8">
          <div className="w-24 h-24 rounded-[2rem] bg-brand-teal/5 flex items-center justify-center text-brand-teal/20 border-2 border-dashed border-white/5 animate-pulse">
            <LayoutDashboard size={48} />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white/80">Quantum State: Build Mode</h3>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold max-w-xs mx-auto leading-relaxed">
              Our engineering team is currently initializing this module. System deployment expected imminently.
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col lg:flex-row">
      {/* 1. FIXED LEFT SIDEBAR (Desktop) / TOP NAV (Mobile) */}
      <aside className="w-full lg:w-80 lg:fixed inset-y-0 left-0 z-[100] border-b lg:border-b-0 lg:border-r border-white/5 bg-brand-black/95 backdrop-blur-xl flex flex-col pt-4 lg:pt-8">
        <div className="px-6 lg:px-8 mb-6 lg:mb-12 flex items-center lg:items-start lg:flex-col justify-between">
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter text-brand-teal uppercase">FPH Command</span>
            <span className="text-[10px] tracking-[0.4em] uppercase text-white/20 font-bold">Super Admin Base</span>
          </Link>

          <div className="hidden lg:flex p-6 bg-brand-teal/5 rounded-3xl border border-brand-teal/20 items-center gap-4 group hover:border-brand-teal/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal font-black text-xl shadow-[0_0_20px_rgba(45,212,191,0.2)]">
              {user.full_name?.[0] || 'A'}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tight truncate w-32">{user.full_name}</p>
              <p className="text-[9px] uppercase tracking-widest text-brand-teal font-black">{user.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <nav className="px-4 lg:px-4 space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-y-auto no-scrollbar flex lg:flex-col pb-4 lg:pb-12 flex-grow">
          <p className="hidden lg:block px-6 text-[9px] uppercase tracking-[0.3em] text-white/20 font-black mb-4">Core Systems</p>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black transition-all ${
                  isActive 
                    ? 'bg-brand-teal text-black shadow-glow-teal' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:flex p-4 border-t border-white/5 space-y-2 flex-col">
           <Link
            to="/profile"
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-brand-teal/5 text-[9px] uppercase tracking-[0.3em] font-black text-brand-teal hover:bg-brand-teal hover:text-black transition-all border border-brand-teal/10"
          >
            <ArrowUpRight size={14} /> Exit to Profile
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[9px] uppercase tracking-[0.3em] font-black text-white/20 hover:bg-brand-coral/10 hover:text-brand-coral transition-all"
          >
            <LogOut size={14} /> Close Terminal
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-80 flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* TOP BAR */}
        <header className="h-auto lg:h-24 py-4 lg:py-0 sticky top-0 z-[90] bg-brand-black/80 backdrop-blur-md border-b border-white/5 flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 lg:px-12 gap-4 lg:gap-0">
          <div className="flex items-center gap-4 lg:gap-8 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-glow-teal" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">Nexus Sync: Active</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-4 text-white/20">
               <ShieldCheck size={16} />
               <span className="text-[10px] uppercase tracking-[0.3em] font-black">Secure Shell Enabled</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-black bg-white/10 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Active Admin" className="w-full h-full object-cover grayscale" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-brand-black bg-brand-teal/20 flex items-center justify-center text-[9px] font-black text-brand-teal">+4</div>
            </div>
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all relative">
              <Mail size={18} className="text-white/40" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-coral rounded-full" />
            </button>
            <div className="h-8 w-px bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-teal">Phase 1.8.4</span>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 lg:p-12 overflow-y-auto overflow-x-hidden w-full max-w-[100vw]">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
             <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter">
                {sidebarItems.find(i => i.id === activeTab)?.label.split(' ')[0]} <span className="text-brand-teal">{sidebarItems.find(i => i.id === activeTab)?.label.split(' ').slice(1).join(' ') || ''}</span>
             </h1>
             <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black mt-4">Module Access: {user.role?.toUpperCase()}</p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
