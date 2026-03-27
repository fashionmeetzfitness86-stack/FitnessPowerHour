export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: string;
  category_id: string;
  category?: string;
  athlete_id?: string;
  is_premium?: boolean;
  visibility_status: 'published' | 'draft' | 'hidden' | 'archived';
  allowed_packages: string[];
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  source_type?: 'upload' | 'vimeo' | 'youtube' | 'link';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface UserVideoUpload {
  id: string;
  user_id: string;
  media_type: 'photo' | 'video'; // Brief requirement
  file_url: string; // Brief requirement
  thumbnail_url?: string;
  caption?: string; // Brief requirement
  previous_weight?: string; // Brief requirement
  current_weight?: string; // Brief requirement
  media_date?: string; // Brief requirement
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  upload_limit: number;
  content_access_level: string;
  price: number;
  billing_type: string;
  created_at: string;
  updated_at: string;
}

export interface Athlete {
  id: string;
  profile_id: string;
  name: string;
  age: number;
  city: string;
  specialties: string[];
  responsibilities: string;
  training_focus: string;
  bio: string;
  image_url: string;
  social_links?: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    facebook?: string;
  };
  is_active: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  athlete_id?: string;
  title: string;
  description: string;
  type?: string;
  duration_weeks?: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  video_ids: string[];
  sessions?: any[];
  created_by: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ProgramAssignment {
  id: string;
  user_id: string;
  program_id: string;
  assigned_by: string;
  assigned_at: string;
  status: 'active' | 'completed' | 'dropped';
}

export interface Retreat {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  start_date: string;
  end_date: string;
  location: string;
  price?: string;
  is_sold_out?: boolean;
  visibility_status: 'draft' | 'published' | 'hidden' | 'archived';
  access_type: 'package_based' | 'manual';
  allowed_packages: string[];
  allowed_users: string[];
  preview_enabled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  image: string;
  category_id: string;
  city: string;
  access_type: 'public' | 'private';
  required_package: 'basic' | 'premium' | 'elite' | 'custom';
  created_by: string;
  created_at: string;
  status: 'active' | 'hidden' | 'archived';
  // Frontend helpers
  members?: string[]; 
}

export interface CommunityMember {
  id: string;
  user_id: string;
  community_id: string;
  status: 'active' | 'inactive';
  joined_at: string;
}

export interface CommunityRequest {
  id: string;
  user_id: string;
  community_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  // Snapshots for UI
  user_name_snapshot?: string;
  user_email_snapshot?: string;
}

export interface CommunityComment {
  id: string;
  user_id: string;
  user_name_snapshot: string;
  content: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  user_name_snapshot: string;
  title: string;
  content: string;
  image_url?: string;
  likes: string[];
  comments: CommunityComment[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
}

export interface Product {
  id: string;
  brand_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number;
  sku: string;
  inventory_count: number;
  status: 'active' | 'inactive' | 'archived';
  featured_image: string;
  images: string[];
  gallery?: string[];
  sizes?: string[];
  ingredients?: string[];
  benefits?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  status: string;
  updated_at: string;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name_snapshot: string;
  order_number: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillment_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  items: OrderItem[];
  placed_at: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  billing_reminders: boolean;
  payment_confirmations: boolean;
  membership_renewals: boolean;
  workout_reminders: boolean;
  retreat_confirmations: boolean;
  program_updates: boolean;
  order_updates: boolean;
}

export interface UserMembership {
  id: string;
  user_id: string;
  package_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  started_at: string;
  renews_at: string;
  ends_at?: string;
  auto_pay_enabled: boolean;
  payment_method_id?: string;
  last_changed_at?: string;
  next_package_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  auth_user_id?: string; // Matching brief field
  full_name: string;
  email: string;
  phone?: string;
  age?: number;
  city?: string;
  country?: string;
  date_of_birth?: string;
  signup_date: string;
  profile_image?: string;
  role: 'user' | 'admin' | 'super_admin' | 'athlete' | 'flex_mob_admin';
  package_id?: string;
  tier?: string;
  membership_package_id?: string; // Matching brief
  membership_status?: 'active' | 'suspended' | 'banned' | 'archived';
  last_membership_change_at?: string;
  status: 'active' | 'suspended' | 'banned' | 'archived';
  banned_at?: string;
  bio?: string; // Matching brief
  preferences?: {
    notifications: boolean;
    marketing_emails: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  created_at: string;
  updated_at: string;
  profile_images?: string[]; // Up to 10 images
  is_auto_pay?: boolean;
  payment_method_id?: string;
  last_billing_update?: string;

  favorites?: string[];
  streak?: number;
  workoutLogs?: WorkoutLog[];
  personalBests?: PersonalBest[];
  orderHistory?: Order[];

  last_tier_change_date?: string;
  height?: string;
  weight?: string;
  workout_style?: string;
  training_goals?: string;
  preferred_workout_days?: string[];
  preferred_workout_time?: string;
  fitness_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  favorite_training_focus?: string;
  limitations_or_injuries?: string;
  short_bio?: string;
  motivation?: string;
  experience_level?: string;
  notification_preferences?: NotificationPreference;
}

export interface Booking {
  id: string;
  user_id: string;
  user_name: string;
  service_type: 'flex_mob' | 'personal_training';
  service_name: string; // e.g., 'Massage', 'Stretching'
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface FlexMobService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  status: 'sent' | 'read' | 'failed';
  send_at: string;
  created_at: string;
}

export interface RetreatApplication {
  id: string;
  retreat_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface CollaborationBrand {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  link: string;
  buttonText: string;
}

export interface TrainingSession {
  id: string;
  title: string;
  time: string;
  trainer: string;
  spots: number;
  type: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  metadata: any;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  video_id?: string;
  duration: number;
  completed_at: string;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  check_in_image?: string;
}

export interface PersonalBest {
  id: string;
  user_id: string;
  exercise: string;
  value: string;
  date: string;
}

export type Post = CommunityPost;
export type ProgramType = Program;
export type CommunityType = Community;

export interface CalendarSession {
  id: string;
  user_id: string;
  title: string;
  date: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'completed' | 'missed';
  program_id?: string;
  video_ids?: string[];
  time?: string;
  created_at: string;
}

export interface BillingHistory {
  id: string;
  user_id: string;
  amount: number;
  status: 'paid' | 'failed' | 'pending';
  date: string;
  description: string;
  invoice_url?: string;
}
