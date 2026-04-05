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
  Community, ActivityLog, Athlete, VideoCategory,
  Brand, RetreatApplication,
  CommunityPost, Package, SiteContent, AthleteApplication,
  ProgramTemplate, UserProgramAssignment,
  CalendarSession, ServiceRequest, ServiceAvailability
} from '../../types';

import { AdminOverview } from './AdminOverview';
import { AdminCalendarControl } from './AdminCalendarControl';
import { CMSManager } from './CMSManager';
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

import { ServiceManager } from './ServiceManager';
import { NotificationManager } from './NotificationManager';
import { RoleManager } from './RoleManager';
import { SettingsManager } from './SettingsManager';
import { ScannerManager } from './ScannerManager';
import { Settings as SettingsIcon } from 'lucide-react';
import { QrCode } from 'lucide-react';

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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [retreatApplications, setRetreatApplications] = useState<RetreatApplication[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [athleteApplications, setAthleteApplications] = useState<AthleteApplication[]>([]);
  const [programTemplates, setProgramTemplates] = useState<ProgramTemplate[]>([]);
  const [userProgramAssignments, setUserProgramAssignments] = useState<UserProgramAssignment[]>([]);
  
  // Calendar System
  const [calendarSessions, setCalendarSessions] = useState<CalendarSession[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [serviceAvailability, setServiceAvailability] = useState<ServiceAvailability[]>([]);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityCategories, setCommunityCategories] = useState<any[]>([]);
  const [communityJoiningRequests, setCommunityJoiningRequests] = useState<any[]>([]);
  const [communityMembers, setCommunityMembers] = useState<any[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
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
          brandsRes, retreatsRes, packagesRes, 
          athletesRes, programsRes, communitiesRes, ordersRes, 
          retreatAppsRes, postsRes, logsRes, commCatsRes, commReqsRes, commMembersRes,
          bookingsRes, siteContentRes, athleteAppsRes, assignmentsRes,
          calSessionsRes, servReqsRes, servAvailRes
        ] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('videos').select('*'),
          supabase.from('video_categories').select('*'),
          supabase.from('products').select('*'),
          supabase.from('brands').select('*'),
          supabase.from('retreats').select('*'),
          supabase.from('packages').select('*'),
          supabase.from('athletes').select('*'),
          supabase.from('program_templates').select('*'),
          supabase.from('communities').select('*'),
          supabase.from('orders').select('*'),
          supabase.from('retreat_applications').select('*'),
          supabase.from('posts').select('*'),
          supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20),
          supabase.from('community_categories').select('*'),
          supabase.from('community_requests').select('*'),
          supabase.from('community_members').select('*'),
          supabase.from('bookings').select('*').eq('status', 'pending'),
          supabase.from('site_content').select('*'),
          supabase.from('athlete_applications').select('*'),
          supabase.from('user_program_assignments').select('*'),
          supabase.from('calendar_sessions').select('*'),
          supabase.from('service_requests').select('*'),
          supabase.from('service_availability').select('*')
        ]);

        if (usersRes.data) setUsers(usersRes.data.map((u: any) => ({ ...u, full_name: u.name || u.full_name || u.email || 'Unknown' })));
        if (videosRes.data) setVideos(videosRes.data);
        if (videoCatsRes.data) setVideoCategories(videoCatsRes.data);
        if (productsRes.data) setProducts(productsRes.data);
        if (brandsRes.data) setBrands(brandsRes.data);
        if (retreatsRes.data) setRetreats(retreatsRes.data);
        if (packagesRes.data) setPackages(packagesRes.data);
        if (athletesRes.data) setAthletes(athletesRes.data);
        if (programsRes.data) setProgramTemplates(programsRes.data);
        if (assignmentsRes?.data) setUserProgramAssignments(assignmentsRes.data);
        if (communitiesRes.data) setCommunities(communitiesRes.data);
        if (ordersRes.data) setOrders(ordersRes.data);
        if (commCatsRes.data) setCommunityCategories(commCatsRes.data);
        if (commReqsRes.data) setCommunityJoiningRequests(commReqsRes.data);
        if (commMembersRes.data) setCommunityMembers(commMembersRes.data);
        if (bookingsRes.data) setBookingRequests(bookingsRes.data);
        if (siteContentRes.data) setSiteContent(siteContentRes.data);
        if (athleteAppsRes.data) setAthleteApplications(athleteAppsRes.data);
        if (calSessionsRes?.data) setCalendarSessions(calSessionsRes.data);
        if (servReqsRes?.data) setServiceRequests(servReqsRes.data);
        if (servAvailRes?.data) setServiceAvailability(servAvailRes.data);
        
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
          activeMembers: usersRes.data?.filter(u => u.status === 'active' && u.tier && u.tier !== 'Free Access').length || 0,
          athletes: athletesRes.data?.length || 0,
          programs: programsRes.data?.filter(p => p.status === 'published').length || 0,
          products: productsRes.data?.length || 0,
          orders: ordersRes.data?.length || 0,
          communities: communitiesRes.data?.length || 0,
          retreatRequests: retreatAppsRes.data?.filter(a => a.status === 'pending').length || 0,
          serviceRequests: bookingsRes.data?.length || 0,
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

  const handleSaveSiteContent = async (data: Partial<SiteContent>) => {
    try {
      if (data.id) {
        const { error } = await supabase.from('site_content').update({ ...data, last_updated_by: user.id, updated_at: new Date().toISOString() }).eq('id', data.id);
        if (error) throw error;
        setSiteContent(prev => prev.map(c => c.id === data.id ? { ...c, ...data } as SiteContent : c));
        showToast('Content configured', 'success');
      } else {
        const { data: newC, error } = await supabase.from('site_content').insert({ ...data, last_updated_by: user.id }).select().single();
        if (error) throw error;
        if (newC) setSiteContent(prev => [newC, ...prev]);
        showToast('New content block created', 'success');
      }
    } catch (err) { showToast('Content update failed', 'error'); }
  };

  const handleDeleteSiteContent = async (id: string) => {
    try {
      await supabase.from('site_content').delete().eq('id', id);
      setSiteContent(prev => prev.filter(c => c.id !== id));
      showToast('Content node purged', 'success');
    } catch (err) { showToast('Purge failed', 'error'); }
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

  const handleSaveProgramTemplate = async (data: Partial<ProgramTemplate>) => {
    try {
      if (data.id) {
        const { error } = await supabase.from('program_templates').update(data).eq('id', data.id);
        if (error) throw error;
        setProgramTemplates(prev => prev.map(p => p.id === data.id ? { ...p, ...data } as ProgramTemplate : p));
        logActivity('UPDATE_PROGRAM', 'program_template', data.id, data);
        showToast('System protocol updated', 'success');
      } else {
        const { data: newP, error } = await supabase.from('program_templates').insert({ ...data, created_by_user_id: user.id }).select().single();
        if (error) throw error;
        if (newP) {
          setProgramTemplates(prev => [newP, ...prev]);
          logActivity('CREATE_PROGRAM', 'program_template', newP.id, newP);
        }
        showToast('New system template initialized', 'success');
      }
    } catch (err) { showToast('Protocol sync failed', 'error'); }
  };

  const handleAssignProgram = async (userId: string, templateId: string, notes: string) => {
    try {
      const { data: assignment, error } = await supabase.from('user_program_assignments').insert({
        user_id: userId,
        program_template_id: templateId,
        assigned_by_user_id: user.id,
        assigned_by_role: user.role,
        start_date: new Date().toISOString().split('T')[0],
        custom_notes: notes,
        status: 'active'
      }).select().single();
      
      if (error) throw error;
      if (assignment) {
        setUserProgramAssignments(prev => [assignment, ...prev]);
      }
      showToast('Program assigned successfully', 'success');
    } catch (err) {
      showToast('Assignment deployment failed', 'error');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await supabase.from('program_templates').delete().eq('id', id);
      setProgramTemplates(prev => prev.filter(p => p.id !== id));
      showToast('Template purged', 'success');
    } catch (error) {
      showToast('Template purge failed', 'error');
    }
  };

  const handleReviewAthleteApp = async (app: AthleteApplication, status: 'approved' | 'rejected') => {
    try {
      await supabase.from('athlete_applications').update({ status }).eq('id', app.id);
      if (status === 'approved') {
        const { error } = await supabase.from('profiles').update({ role: 'athlete' }).eq('id', app.user_id);
        if (error) throw error;
        
        await supabase.from('athletes').insert({
          user_id: app.user_id,
          name: app.name,
          category: app.category,
          bio: app.bio,
          images: app.images,
          videos: app.videos,
          social_links: app.social_links,
          status: 'active'
        });
        showToast(`${app.name} elevated to Athlete status`, 'success');
      } else {
        showToast(`Application from ${app.name} rejected`, 'info');
      }
      setAthleteApplications(prev => prev.map(a => a.id === app.id ? { ...a, status } : a));
    } catch (err) { showToast('Execution failed', 'error'); }
  };

  const handleRemoveAthleteRole = async (userId: string) => {
    try {
      await supabase.from('profiles').update({ role: 'user' }).eq('id', userId);
      await supabase.from('athletes').update({ status: 'inactive' }).eq('user_id', userId);
      setAthletes(prev => prev.filter(a => a.user_id !== userId));
      showToast('Athlete role revoked', 'success');
    } catch (err) { showToast('Revocation failed', 'error'); }
  };

  const handleDeactivateAthlete = async (id: string) => {
    try {
      const athlete = athletes.find(a => a.id === id);
      const newStatus = athlete?.status === 'active' ? 'inactive' : 'active';
      await supabase.from('athletes').update({ status: newStatus }).eq('id', id);
      setAthletes(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      showToast('Athlete status toggled', 'success');
    } catch (err) { showToast('Status update failed', 'error'); }
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

  const handleUpdateBookingStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      setBookingRequests(prev => prev.filter(b => b.id !== id));
      logActivity('UPDATE_BOOKING', 'booking', id, { status });
      showToast(`Service stream ${status}`, 'success');
    } catch (err) { showToast('Stream sync failed', 'error'); }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Ecosystem Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Member Directory', icon: Users },
    { id: 'athletes', label: 'Athlete Roster', icon: Trophy },
    { id: 'programs', label: 'System Protocols', icon: ListChecks },
    { id: 'calendar', label: 'Ops Calendar', icon: Calendar },
    { id: 'cms', label: 'CMS Engine', icon: Edit2, adminOnly: true },
    { id: 'content', label: 'Media Vault', icon: PlayCircle },
    { id: 'shop', label: 'Global Store', icon: ShoppingBag },
    { id: 'orders', label: 'Fulfillment Logic', icon: ClipboardList },
    { id: 'packages', label: 'Access Tiering', icon: PackageIcon },
    { id: 'community', label: 'Collective Hub', icon: MessageSquare },
    { id: 'retreats', label: 'Venture Board', icon: MapPin },
    { id: 'scanner', label: 'Nexus Scanner', icon: QrCode },
    { id: 'services', label: 'Service Streams', icon: Activity },
    { id: 'notifications', label: 'Comm Signal', icon: Mail },
    { id: 'roles', label: 'Encryption Keys', icon: ShieldAlert, adminOnly: true },
    { id: 'settings', label: 'System Core', icon: SettingsIcon, adminOnly: true },
    { id: 'logs', label: 'Quantum Logs', icon: History, adminOnly: true },
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
      case 'athletes': return (
        <AthleteManager 
          athletes={athletes} 
          applications={athleteApplications}
          programs={programTemplates} 
          videos={videos} 
          onReviewApplication={handleReviewAthleteApp}
          onEditAthlete={(athlete) => { /* To be implemented */ }}
          onRemoveRole={handleRemoveAthleteRole}
          onDeactivate={handleDeactivateAthlete}
        />
      );
      case 'cms': return (
        <CMSManager 
          contentKeys={siteContent}
          onAdd={() => {}}
          onEdit={handleSaveSiteContent}
          onDelete={handleDeleteSiteContent}
          showToast={showToast}
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
          templates={programTemplates} 
          assignments={userProgramAssignments}
          users={users} 
          videos={videos} 
          onAddTemplate={() => handleSaveProgramTemplate({ title: 'New Protocol', status: 'draft' })} 
          onEditTemplate={handleSaveProgramTemplate} 
          onAssignProgram={handleAssignProgram}
          onDeleteTemplate={handleDeleteTemplate} 
        />
      );
      case 'calendar': return (
        <AdminCalendarControl 
          sessions={calendarSessions} 
          requests={serviceRequests} 
          availability={serviceAvailability} 
          users={users} 
          onApproveRequest={async (id) => {
             await supabase.from('service_requests').update({ status: 'approved' }).eq('id', id);
             setServiceRequests(p => p.map(r => r.id === id ? { ...r, status: 'approved' } : r));
             
             // Also insert generic calendar session for visibility
             const req = serviceRequests.find(r => r.id === id);
             if (req) {
                 const { data } = await supabase.from('calendar_sessions').insert({
                     user_id: req.user_id,
                     source_type: 'service',
                     title: req.service_subtype.replace('_', ' '),
                     session_date: req.requested_date,
                     session_time: req.requested_time,
                     status: 'approved'
                 }).select().single();
                 if (data) setCalendarSessions(p => [...p, data]);
             }
             showToast('Service request authorized', 'success');
          }} 
          onRejectRequest={async (id) => {
             await supabase.from('service_requests').update({ status: 'rejected' }).eq('id', id);
             setServiceRequests(p => p.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
             showToast('Request isolated/rejected', 'success');
          }} 
          onAddAvailability={async (data) => {
             const { data: nAvail } = await supabase.from('service_availability').insert(data).select().single();
             if (nAvail) setServiceAvailability(p => [...p, nAvail]);
             showToast('Operational window defined', 'success');
          }} 
          onUpdateSessionStatus={async (id, status) => {
             await supabase.from('calendar_sessions').update({ status }).eq('id', id);
             setCalendarSessions(p => p.map(s => s.id === id ? { ...s, status } : s));
             showToast('Session status overridden', 'success');
          }} 
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
          users={users} 
          onAdd={() => {}} 
          onDeleteCommunity={handleDeleteCommunity} 
          onDeletePost={handleDeletePost} 
        />
      );
      case 'scanner': return <ScannerManager showToast={showToast} />;
      case 'shop': return (
        <ShopManager 
          products={products} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onAdd={() => handleSaveProduct({ name: 'Commercial Node Element', is_active: false, price: 0 })} 
          onEdit={handleSaveProduct} 
          onDelete={handleDeleteProduct} 
        />
      );
      case 'orders': return (
        <OrderManager 
          orders={orders} 
          users={users}
          onUpdateStatus={async (id, status) => {
             await supabase.from('orders').update({ status }).eq('id', id);
             setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
             showToast('Transaction logic updated', 'success');
          }} 
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
      case 'services': return (
        <ServiceManager 
          bookings={bookingRequests} 
          onUpdateStatus={handleUpdateBookingStatus} 
          showToast={showToast} 
        />
      );
      case 'notifications': return <NotificationManager showToast={showToast} />;
      case 'roles': return (
        <RoleManager 
          users={users} 
          onUpdateRole={(id, role) => handleUpdateUser(id, { role: role as any })} 
          showToast={showToast} 
          currentUser={user}
        />
      );
      case 'settings': return <SettingsManager showToast={showToast} />;
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
    <div className="min-h-screen bg-brand-black text-white flex">
      {/* 1. FIXED LEFT SIDEBAR */}
      <aside className="w-80 fixed inset-y-0 left-0 z-[100] border-r border-white/5 bg-brand-black/95 backdrop-blur-xl flex flex-col pt-8">
        <div className="px-8 mb-12">
          <Link to="/" className="flex flex-col leading-none mb-12">
            <span className="text-xl font-black tracking-tighter text-brand-teal uppercase">FPH Command</span>
            <span className="text-[10px] tracking-[0.4em] uppercase text-white/20 font-bold">Super Admin Base</span>
          </Link>

          <div className="p-6 bg-brand-teal/5 rounded-3xl border border-brand-teal/20 flex items-center gap-4 group hover:border-brand-teal/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal font-black text-xl shadow-[0_0_20px_rgba(45,212,191,0.2)]">
              {user.full_name?.[0] || 'A'}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tight truncate w-32">{user.full_name}</p>
              <p className="text-[9px] uppercase tracking-widest text-brand-teal font-black">{user.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-grow px-4 space-y-1 overflow-y-auto no-scrollbar pb-12">
          <p className="px-6 text-[9px] uppercase tracking-[0.3em] text-white/20 font-black mb-4">Core Systems</p>
          {sidebarItems.map((item) => {
            if (item.adminOnly && user.role !== 'super_admin') return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black transition-all ${
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

        <div className="p-4 border-t border-white/5 space-y-2">
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
      <div className="flex-1 ml-80 min-h-screen flex flex-col">
        {/* TOP BAR */}
        <header className="h-24 sticky top-0 z-[90] bg-brand-black/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-12">
          <div className="flex items-center gap-8">
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
        <main className="flex-1 p-12 overflow-y-auto">
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
