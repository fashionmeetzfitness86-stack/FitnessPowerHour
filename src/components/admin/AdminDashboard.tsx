import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, Trophy, PlayCircle, 
  ListChecks, MapPin, MessageSquare, ShoppingBag as ShoppingBagIcon, 
  ClipboardList, Package as PackageIcon, History, LogOut, ChevronRight,
  ShieldCheck, ArrowUpRight, Plus, Download, Search,
  Edit2, Eye, Ban, Trash2, Check, X, Printer,
  Filter, Activity, TrendingUp, DollarSign, Clock,
  CheckCircle, Video as VideoIcon, UserPlus, Star, 
  Mail, MessageCircle, Heart, Share2, ShieldAlert, AlertCircle, Truck
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../App';
import { 
  UserProfile, Video, Product, Order, Retreat, 
  Community, ActivityLog, Program, Athlete, 
  VideoCategory, ProductCategory, Brand, RetreatApplication,
  CommunityPost, CommunityCategory, CommunityRequest, CommunityMember, Package
} from '../../types';

import { AdminOverview } from './AdminOverview';
import { UsersManager } from './UsersManager';
import { AthleteManager } from './AthleteManager';
import { VideoManager } from './VideoManager';
import { ProgramManager } from './ProgramManager';
import { RetreatManager } from './RetreatManager';
import { CommunityManager } from './CommunityManager';
import { ShopManager } from './ShopManager';
import { OrderManager } from './OrderManager';
import { PackageManager } from './PackageManager';
import { LogManager } from './LogManager';

interface AdminDashboardProps {
  user: UserProfile;
  logout: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminDashboard = ({ user, logout, showToast }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [retreatApplications, setRetreatApplications] = useState<RetreatApplication[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [communityCategories, setCommunityCategories] = useState<CommunityCategory[]>([]);
  const [communityJoiningRequests, setCommunityJoiningRequests] = useState<CommunityRequest[]>([]);
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
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
        const [
          usersRes, videosRes, videoCatsRes, productsRes, 
          prodCatsRes, brandsRes, retreatsRes, packagesRes, 
          athletesRes, programsRes, communitiesRes, ordersRes, 
          retreatAppsRes, postsRes, logsRes, commCatsRes, commReqsRes, commMembersRes
        ] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('videos').select('*'),
          supabase.from('video_categories').select('*'),
          supabase.from('products').select('*'),
          supabase.from('product_categories').select('*'),
          supabase.from('brands').select('*'),
          supabase.from('retreats').select('*'),
          supabase.from('packages').select('*'),
          supabase.from('athletes').select('*'),
          supabase.from('programs').select('*'),
          supabase.from('communities').select('*'),
          supabase.from('orders').select('*'),
          supabase.from('retreat_applications').select('*'),
          supabase.from('posts').select('*'),
          supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20),
          supabase.from('community_categories').select('*'),
          supabase.from('community_requests').select('*'),
          supabase.from('community_members').select('*')
        ]);

        if (usersRes.data) setUsers(usersRes.data.map((u: any) => ({ ...u, full_name: u.name || u.full_name || u.email || 'Unknown' })));
        if (videosRes.data) setVideos(videosRes.data);
        if (videoCatsRes.data) setVideoCategories(videoCatsRes.data);
        if (productsRes.data) setProducts(productsRes.data);
        if (prodCatsRes.data) setProductCategories(prodCatsRes.data);
        if (brandsRes.data) setBrands(brandsRes.data);
        if (retreatsRes.data) setRetreats(retreatsRes.data);
        if (packagesRes.data) setPackages(packagesRes.data);
        if (athletesRes.data) setAthletes(athletesRes.data);
        if (programsRes.data) setPrograms(programsRes.data);
        if (communitiesRes.data) setCommunities(communitiesRes.data);
        if (ordersRes.data) setOrders(ordersRes.data);
        if (commCatsRes.data) setCommunityCategories(commCatsRes.data);
        if (commReqsRes.data) setCommunityJoiningRequests(commReqsRes.data);
        if (commMembersRes.data) setCommunityMembers(commMembersRes.data);
        
        if (communitiesRes.data && commMembersRes.data) {
          setCommunities(communitiesRes.data.map(c => ({
            ...c,
            members: commMembersRes.data.filter(m => m.community_id === c.id).map(m => m.user_id)
          })));
        }

        if (retreatAppsRes.data) setRetreatApplications(retreatAppsRes.data.map((app: any) => ({
          ...app,
          userName: usersRes.data?.find(u => u.id === app.user_id)?.full_name || 'Unknown',
          userEmail: usersRes.data?.find(u => u.id === app.user_id)?.email || 'Unknown'
        })));
        if (postsRes.data) setPosts(postsRes.data.map((p: any) => ({
          ...p,
          authorName: usersRes.data?.find(u => u.id === p.author_id)?.full_name || 'Unknown'
        })));
        if (logsRes.data) setActivityLogs(logsRes.data);

        setStats({
          users: usersRes.data?.length || 0,
          videos: videosRes.data?.length || 0,
          orders: ordersRes.data?.length || 0,
          revenue: ordersRes.data?.reduce((acc, curr) => acc + curr.total_amount, 0).toFixed(2) || '0.00'
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
        showToast('System synchronization error', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
          setCommunities(prev => [{ ...newComm, members: [] }, ...prev]);
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
      await supabase.from('videos').delete().eq('id', id);
      setVideos(prev => prev.filter(v => v.id !== id));
      logActivity('DELETE_VIDEO', 'video', id);
      showToast('Media asset purged', 'success');
    } catch (err) { showToast('Purge failed', 'error'); }
  };

  const handleSaveAthlete = async (data: Partial<Athlete>) => {
    try {
      if (data.id) {
        const { error } = await supabase.from('athletes').update(data).eq('id', data.id);
        if (error) throw error;
        setAthletes(prev => prev.map(a => a.id === data.id ? { ...a, ...data } as Athlete : a));
        logActivity('UPDATE_ATHLETE', 'athlete', data.id, data);
        showToast('Athlete dossier updated', 'success');
      } else {
        const { data: newA, error } = await supabase.from('athletes').insert(data).select().single();
        if (error) throw error;
        if (newA) {
          setAthletes(prev => [newA, ...prev]);
          logActivity('CREATE_ATHLETE', 'athlete', newA.id, newA);
        }
        showToast('New athlete authorized', 'success');
      }
    } catch (err) { showToast('Athlete sync failed', 'error'); }
  };

  const handleSaveProgram = async (data: Partial<Program>) => {
    try {
      if (data.id) {
        const { error } = await supabase.from('programs').update(data).eq('id', data.id);
        if (error) throw error;
        setPrograms(prev => prev.map(p => p.id === data.id ? { ...p, ...data } as Program : p));
        logActivity('UPDATE_PROGRAM', 'program', data.id, data);
        showToast('System protocol updated', 'success');
      } else {
        const { data: newP, error } = await supabase.from('programs').insert({ ...data, created_by: user.id }).select().single();
        if (error) throw error;
        if (newP) {
          setPrograms(prev => [newP, ...prev]);
          logActivity('CREATE_PROGRAM', 'program', newP.id, newP);
        }
        showToast('New system protocol initialized', 'success');
      }
    } catch (err) { showToast('Protocol sync failed', 'error'); }
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

  const sidebarItems = [
    { id: 'overview', label: 'Ecosystem Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Member Directory', icon: Users },
    { id: 'athletes', label: 'Athlete Roster', icon: Trophy },
    { id: 'content', label: 'Media Vault', icon: PlayCircle },
    { id: 'programs', label: 'System Protocols', icon: ListChecks },
    { id: 'retreats', label: 'Venture Board', icon: MapPin },
    { id: 'community', label: 'Collective Hub', icon: MessageSquare },
    { id: 'shop', label: 'Global Store', icon: ShoppingBagIcon },
    { id: 'orders', label: 'Fulfillment Logic', icon: ClipboardList },
    { id: 'packages', label: 'Access Tiering', icon: PackageIcon, adminOnly: true },
    { id: 'logs', label: 'Quantum Logs', icon: History, adminOnly: true },
  ];

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
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
      case 'athletes': return (
        <AthleteManager 
          athletes={athletes} 
          programs={programs} 
          videos={videos} 
          onAdd={() => {}} 
          onEdit={() => {}} 
          onDelete={() => {}} 
        />
      );
      case 'content': return (
        <VideoManager 
          videos={videos} 
          categories={videoCategories} 
          athletes={athletes} 
          onUpload={() => handleSaveVideo({ title: 'New Transmission', visibility_status: 'draft', level: 'Beginner' })} 
          onEdit={handleSaveVideo} 
          onDelete={handleDeleteVideo} 
        />
      );
      case 'programs': return (
        <ProgramManager 
          programs={programs} 
          athletes={athletes} 
          onAdd={() => handleSaveProgram({ title: 'New Protocol', status: 'draft' })} 
          onEdit={handleSaveProgram} 
          onDelete={() => {}} 
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
      case 'community': return (
        <CommunityManager 
          communities={communities} 
          posts={posts} 
          categories={communityCategories}
          joiningRequests={communityJoiningRequests}
          users={users} 
          onAdd={() => {}} 
          onDeleteCommunity={handleDeleteCommunity} 
          onDeletePost={handleDeletePost} 
          onManageCategories={() => {}}
          onHandleRequest={async (id, status) => {
            try {
              const request = communityJoiningRequests.find(r => r.id === id);
              if (!request) return;

              if (status === 'approved') {
                const community = communities.find(c => c.id === request.community_id);
                if (community) {
                  // Insert into community_members table
                  await supabase.from('community_members').insert({
                    community_id: community.id,
                    user_id: request.user_id,
                    status: 'active',
                    joined_at: new Date().toISOString()
                  });

                  // Update local helper array
                  const newMembers = [...(community.members || []), request.user_id];
                  setCommunities(prev => prev.map(c => c.id === community.id ? { ...c, members: newMembers } : c));
                  
                  // Also add a welcome post
                  await supabase.from('community_posts').insert({
                    community_id: community.id,
                    user_id: 'system',
                    user_name_snapshot: 'System Protocol',
                    title: 'New Member Authorized',
                    content: `Authorized access for candidate ${request.user_name_snapshot}. Welcome to the collective.`,
                    likes: [],
                    comments: [],
                    tags: ['System'],
                    created_at: new Date().toISOString()
                  });
                }
              }

              await supabase.from('community_requests').update({ 
                status 
              }).eq('id', id);
              
              setCommunityJoiningRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
              showToast(`Clearance Signal ${status === 'approved' ? 'Authorized' : 'Denied'}`, 'success');
            } catch (error) {
              console.error('Processing error:', error);
              showToast('Signal processing failed', 'error');
            }
          }}
          onSaveCommunity={handleSaveCommunity}
        />
      );
      case 'shop': return (
        <ShopManager 
          products={products} 
          brands={brands} 
          categories={productCategories} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onAdd={() => {}} 
          onEdit={() => {}} 
          onDelete={() => {}} 
        />
      );
      case 'orders': return (
        <OrderManager 
          orders={orders} 
          onUpdateStatus={() => {}} 
          onViewDetails={() => {}} 
        />
      );
      case 'packages': return (
        <PackageManager 
          packages={packages} 
          onSave={handleSavePackage} 
          onDelete={handleDeletePackage} 
        />
      );
      case 'logs': return (
        <LogManager logs={activityLogs} />
      );
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8">
          <div className="w-24 h-24 rounded-[2rem] bg-brand-teal/5 flex items-center justify-center text-brand-teal/20 border-2 border-dashed border-white/5 animate-pulse">
            <LayoutDashboard size={48} />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white/80">Quantum State: Development</h3>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold max-w-xs mx-auto leading-relaxed">
              This module is currently being modularized and optimized for peak performance.
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="pt-32 pb-32 min-h-screen bg-brand-black text-white relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-brand-teal/5 blur-[120px] -mr-[10vw] -mt-[10vh] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-brand-coral/5 blur-[120px] -ml-[10vw] -mb-[10vh]" />

      <div className="max-w-[1700px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-16 relative z-10">
        {/* Modern Sidebar Column */}
        <aside className="lg:w-80 flex-shrink-0 space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-gradient p-10 space-y-8 border-2 border-brand-teal/10 relative overflow-hidden group rounded-[2.5rem] shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all duration-700 transform rotate-12 group-hover:rotate-0">
              <ShieldCheck size={100} className="text-brand-teal shadow-glow-teal" />
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 border-2 border-brand-teal/30 flex items-center justify-center text-brand-teal font-black text-2xl shadow-[0_0_25px_rgba(45,212,191,0.3)] group-hover:scale-110 transition-transform duration-500">
                  {user.full_name?.[0] || 'A'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-brand-black rounded-full" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter group-hover:text-brand-teal transition-colors">
                  {user.full_name?.split(' ')[0] || 'Admin'} <span className="text-white/40">{user.full_name?.split(' ')[1] || ''}</span>
                </h2>
                <span className="inline-block px-3 py-1 bg-brand-teal text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-lg mt-1.5 shadow-lg">
                  {user.role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-black">
                <span className="text-white/20">System Phase</span>
                <span className="text-emerald-500 flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Synchronized
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-black border-t border-white/5 pt-6">
                <span className="text-white/20">Uptime</span>
                <span className="text-white/80 font-mono tracking-tighter">99.98%</span>
              </div>
            </div>
          </motion.div>

          <nav className="card-gradient p-4 space-y-2 rounded-[2.5rem] border border-white/5">
            {sidebarItems.map((item, i) => {
              if (item.adminOnly && user.role !== 'super_admin') return null;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-6 py-4.5 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black transition-all group relative overflow-hidden ${
                    activeTab === item.id 
                      ? 'bg-brand-teal text-black shadow-[0_15px_30px_rgba(45,212,191,0.3)] scale-[1.05]' 
                      : 'text-white/30 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-5 relative z-10">
                    <Icon size={18} className={`${activeTab === item.id ? 'text-black' : 'text-brand-teal/50 group-hover:text-brand-teal'} group-hover:scale-110 transition-transform`} />
                    {item.label}
                  </div>
                  {activeTab === item.id && <motion.div layoutId="chevron" className="relative z-10"><ChevronRight size={14} /></motion.div>}
                </motion.button>
              );
            })}
          </nav>

          <Link
            to="/profile"
            className="w-full flex items-center justify-center gap-4 px-8 py-6 rounded-[2rem] bg-brand-teal/5 text-[10px] uppercase tracking-[0.3em] font-black text-brand-teal hover:bg-brand-teal hover:text-black transition-all group border border-brand-teal/20"
          >
            <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> User Experience
          </Link>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-4 px-8 py-6 rounded-[2rem] bg-white/5 text-[10px] uppercase tracking-[0.3em] font-black text-white/20 hover:bg-brand-coral hover:text-black transition-all group border border-transparent hover:border-brand-coral/30"
          >
            <LogOut size={16} className="group-hover:rotate-12 transition-transform" /> Sign Out Portal
          </button>
        </aside>

        {/* Main Command Center Layout */}
        <main className="flex-1 min-w-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 flex flex-col md:flex-row justify-between items-end gap-10"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-brand-teal rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                <span className="text-brand-teal text-[11px] uppercase tracking-[0.6em] font-black">Centralized Command</span>
              </div>
              <h1 className="text-6xl lg:text-9xl font-black uppercase tracking-tighter leading-none">
                {sidebarItems.find(i => i.id === activeTab)?.label.split(' ')[0]} <br/>
                <span className="text-brand-teal">{sidebarItems.find(i => i.id === activeTab)?.label.split(' ').slice(1).join(' ') || ''}</span>
              </h1>
            </div>
            
            <div className="hidden lg:flex flex-col items-end gap-3 text-[10px] uppercase tracking-[0.2em] font-black text-white/10 group cursor-default">
              <div className="flex items-center gap-3 group-hover:text-white/40 transition-colors underline decoration-brand-teal/20 underline-offset-8">
                <Clock size={14} /> Last Synchronization: Instant
              </div>
              <div className="flex items-center gap-3 group-hover:text-emerald-500 transition-colors uppercase italic italic-glow-brand-teal">
                <ShieldCheck size={14} /> Encryption Layer: Active
              </div>
            </div>
          </motion.div>

          {/* Module Transition Portal */}
          <div className="relative min-h-[70vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="pb-20"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
