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
  tags?: string[];
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
  description?: string;
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

export interface AthleteApplication {
  id: string;
  user_id: string;
  name: string;
  email: string;
  category: string;
  bio: string;
  experience: string;
  social_links: {
    instagram?: string;
    tiktok?: string;
  };
  images: string[];
  videos: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Athlete {
  id: string;
  user_id: string;
  name: string;
  category: string;
  bio: string;
  images: string[];
  videos: string[];
  social_links?: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    facebook?: string;
  };
  training_style?: string;
  status: 'active' | 'inactive';
  created_at: string;
}


export interface ProgramTemplate {
  id: string;
  created_by_user_id: string;
  title: string;
  description: string;
  phase: string;
  difficulty: string;
  category: string;
  duration_days: number;
  sessions_per_week: number;
  training_focus: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  athlete_id?: string;
}

export interface ProgramTemplateVideo {
  id: string;
  program_template_id: string;
  video_id: string;
  sort_order: number;
  day_number?: number;
  week_number?: number;
  instruction_text?: string;
  created_at: string;
}

export interface UserProgramAssignment {
  id: string;
  user_id: string;
  program_template_id: string;
  assigned_by_user_id: string;
  assigned_by_role: string;
  start_date: string;
  end_date?: string;
  custom_notes?: string;
  completion_percent: number;
  status: 'assigned' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  program_template?: ProgramTemplate; // Embedded for frontend ease
}

export interface ProgramAssignmentNote {
  id: string;
  user_program_assignment_id: string;
  author_user_id: string;
  author_role: string;
  note_text: string;
  created_at: string;
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

export interface Community {
  id: string;
  name: string;
  description: string;
  image_url: string;
  members: string[];
  status: 'active' | 'hidden' | 'archived';
  required_package?: string;
  image?: string;
  access_type?: 'public' | 'package_required' | 'invite_only' | 'private';
  created_at: string;
  updated_at: string;
}

export interface CommunityCategory {
  id: string;
  name: string;
  description: string;
}

export interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'image_url' | 'link';
  description?: string;
  last_updated_by?: string;
  updated_at: string;
}

export interface CommunityRequest {
  id: string;
  community_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
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
  name: string;
  description: string;
  price: number;
  category?: string;
  images: string[];
  video_url?: string;
  external_link?: string;
  is_recommended?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  brand_id?: string;
  category_id?: string;
  ingredients?: string[];
  featured_image?: string;
  gallery?: string[];
  sizes?: string[];
  slug?: string;
  compare_at_price?: number;
  sku?: string;
  status?: string;
  inventory_count?: number;
  benefits?: string[];
}

export type Program = ProgramTemplate;
export type ProductCategory = { id: string; name: string };
export type ProgramAssignment = UserProgramAssignment;

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
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at?: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  shipping_address?: any;
  created_at: string;
  items?: OrderItem[];
  customer_name_snapshot?: string;
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
  onboarding_completed?: boolean;
  profile_images?: string[]; // Up to 10 images
  is_auto_pay?: boolean;
  payment_method_id?: string;
  last_billing_update?: string;

  favorites?: string[];
  streak_count?: number;
  last_checkin?: string;
  referral_code?: string;
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
  streak?: number;
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
  video_id: string;
  duration: number;
  completed_at: string;
  status?: 'completed' | 'pending' | 'failed';
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
export type ProgramType = ProgramTemplate;
export type CommunityType = Community;

export interface CalendarSession {
  id: string;
  user_id: string;
  source_type: 'workout' | 'service' | 'training' | 'manual';
  related_service_request_id?: string;
  related_program_assignment_id?: string;
  title: string;
  session_date: string;
  session_time?: string;
  duration_minutes: number;
  status: 'pending' | 'approved' | 'completed' | 'missed' | 'cancelled';
  assigned_provider_user_id?: string;
  created_by_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  service_type: 'flex_mob' | 'personal_training';
  service_subtype: 'massage' | 'stretching' | 'recovery' | 'training_session' | 'training_monthly';
  requested_date: string;
  requested_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  assigned_provider_user_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceAvailability {
  id: string;
  service_type: 'global' | 'flex_mob' | 'personal_training';
  provider_user_id?: string;
  available_date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'blocked' | 'full';
  created_at: string;
  updated_at: string;
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
