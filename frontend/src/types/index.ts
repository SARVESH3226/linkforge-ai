export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  _count?: {
    links: number;
  };
  createdAt: string;
}

export interface Link {
  id: string;
  originalUrl: string;
  shortCode: string;
  title?: string;
  description?: string;
  isActive: boolean;
  isArchived: boolean;
  expiresAt?: string | null;
  createdAt: string;
  categoryId?: string | null;
  category?: Category | null;
  favorites: { id: string }[];
  _count?: {
    analytics: number;
  };
}

export interface AnalyticsItem {
  id: string;
  linkId: string;
  timestamp: string;
  device: string;
  browser: string;
  os: string;
  referrer: string | null;
  country: string | null;
  city: string | null;
  ipHash: string;
  link?: {
    shortCode: string;
    originalUrl: string;
  };
}

export interface ChartData {
  name: string;
  value: number;
}

export interface TimelineData {
  date: string;
  clicks: number;
}

export interface AnalyticsStats {
  totalClicks: number;
  uniqueVisitors: number;
  lastVisited: string | null;
  countries: ChartData[];
  browsers: ChartData[];
  devices: ChartData[];
  osBreakdown: ChartData[];
  recentVisits: AnalyticsItem[];
  timeline: TimelineData[];
}
