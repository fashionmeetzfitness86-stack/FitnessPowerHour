export interface Video {
  id: string;
  title: string;
  category: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  description: string;
  benefits: string[];
  videoUrl?: string;
  sourceType?: 'youtube' | 'upload' | 'link';
  isPremium?: boolean;
  instructor?: string;
  instructorImage?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  collection: string;
  image: string;
  description?: string;
  ingredients?: string[];
  benefits?: string[];
}

export interface TrainingSession {
  id: string;
  title: string;
  time: string;
  trainer: string;
  spots: number;
  type: string;
}

export interface Retreat {
  id: string;
  title: string;
  location: string;
  date: string;
  price: string;
  image: string;
  description: string;
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

export interface Order {
  id: string;
  date: string;
  total: number;
  items: string[];
  status: 'Processing' | 'Shipped' | 'Delivered';
}

export interface WorkoutLog {
  id: string;
  date: string;
  sessionTitle: string;
  duration: number;
  type: string;
}

export interface PersonalBest {
  exercise: string;
  value: string;
  date: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: string;
  joinedAt: string;
  orderHistory?: Order[];
  workoutLogs?: WorkoutLog[];
  personalBests?: PersonalBest[];
  streak?: number;
  favorites?: string[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorTier: string;
  content: string;
  imageUrl?: string;
  likes: string[]; // Array of user IDs
  comments: Comment[];
  createdAt: string;
  tags: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment';
  fromUserId: string;
  fromUserName: string;
  postId: string;
  postContent: string;
  createdAt: string;
  isRead: boolean;
}
