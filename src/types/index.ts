export interface AccountGroup {
  id: string;
  name: string;
  color: string;
}

export interface Account {
  id: string;
  name: string;
  avatar: string;
  groupId: string;
  followers: number;
  weeklyPosts: number;
  status: 'active' | 'warning' | 'inactive';
  description: string;
  trend: number[];
}

export interface KPIData {
  totalFollowers: number;
  weeklyViews: number;
  avgOpenRate: number;
  conversions: number;
  followersChange: number;
  viewsChange: number;
  openRateChange: number;
  conversionsChange: number;
}

export interface AccountKPI {
  accountId: string;
  followers: number;
  weeklyViews: number;
  avgOpenRate: number;
  conversions: number;
  trend: number[];
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  accountId: string;
  category: string;
  status: 'draft' | 'writing' | 'review' | 'scheduled' | 'published' | 'archived';
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  publishDate?: string;
  dueDate?: string;
  createdAt?: string;
  views?: number;
  likes?: number;
  shares?: number;
  conversions?: number;
  goldenQuotes?: string[];
  tags?: string[];
}

export interface Task {
  id: string;
  title: string;
  articleId: string;
  assignee: string;
  status: 'todo' | 'writing' | 'review' | 'scheduled' | 'published' | 'archived';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  progress?: number;
  accountId?: string;
}

export interface Material {
  id: string;
  type: 'image' | 'copy' | 'quote' | 'competitor';
  title: string;
  content?: string;
  url?: string;
  thumbnail?: string;
  tags: string[];
  createdAt: string;
  source?: string;
  views?: number;
  author?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export interface ReviewComment {
  id: string;
  articleId: string;
  content: string;
  author: string;
  authorAvatar: string;
  type: 'general' | 'inline' | 'brand';
  lineNumber?: number;
  resolved: boolean;
  createdAt: string;
  replies?: ReviewComment[];
}

export interface PublishRecord {
  id: string;
  articleId: string;
  articleTitle: string;
  accountId: string;
  status: 'success' | 'failed' | 'pending';
  scheduledAt: string;
  publishedAt?: string;
  retryCount: number;
  errorMessage?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'editor' | 'reviewer';
}

export type MaterialType = 'image' | 'copy' | 'quote' | 'competitor';
