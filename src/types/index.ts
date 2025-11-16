/**
 * Core type definitions for Punktual
 * These provide IDE support and documentation for the main data structures
 */

// ============================================================================
// EVENT DATA TYPES
// ============================================================================

export interface EventData {
  // Basic Information
  title?: string;
  description?: string;
  location?: string;
  
  // Host Information
  organizer?: string;
  hostName?: string;
  hostEmail?: string;
  
  // Date & Time
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  timezone?: string;
  isAllDay?: boolean;
  
  // Recurrence
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceInterval?: number;
  recurrenceCount?: number;
  recurrenceEndDate?: string;
  
  // Weekly Recurrence
  weeklyDays?: number[]; // 0-6 (Sunday-Saturday)
  
  // Monthly Recurrence
  monthlyOption?: 'date' | 'weekday';
  monthlyWeekday?: number; // 0-6 (Sunday-Saturday)
  monthlyWeekdayOrdinal?: number; // 0-5 (first, second, third, fourth, fifth, last)
  
  // Yearly Recurrence
  yearlyMonth?: number; // 0-11 (January-December)
  
  // Reminders
  reminderTime?: string;
}

// ============================================================================
// BUTTON CUSTOMIZATION TYPES
// ============================================================================

export interface ButtonData {
  // Style Options
  buttonStyle?: 'standard' | 'minimal' | 'pill' | 'gradient' | 'rounded' | 'sharp';
  buttonSize?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg' | 'xl';
  buttonLayout?: 'dropdown' | 'individual' | 'single';
  buttonShape?: 'squared' | 'rounded' | 'pill';
  
  // Colors
  colorTheme?: 'light' | 'dark' | 'brand' | 'original' | string;
  textColor?: string;
  customBrandColor?: string;
  
  // Features
  showIcons?: boolean;
  responsive?: boolean;
  openInNewTab?: boolean;
  ctaText?: string;
  displayOption?: 'names' | 'icons' | 'both';
  
  //CustomText
    customText?: string;

  // Platform Selection
  selectedPlatforms?: {
    google?: boolean;
    apple?: boolean;
    outlook?: boolean;
    office365?: boolean;
    outlookcom?: boolean;
    yahoo?: boolean;
    [key: string]: boolean | undefined;
  };
}

// ============================================================================
// CALENDAR PLATFORM TYPES
// ============================================================================

export interface CalendarPlatform {
  id: string;
  name: string;
  fullName?: string;
  shortName?: string;
  color?: string;
  logo?: string;
  iconPath?: string;
}

export interface CalendarLinks {
  google?: string;
  apple?: string;
  outlook?: string;
  office365?: string;
  outlookcom?: string;
  yahoo?: string;
  [key: string]: string | undefined;
}

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  plan: 'free' | 'pro';
  created_at: string;
  updated_at?: string;
}

// Supabase Auth Types
export interface SupabaseUser {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
    [key: string]: string | number | boolean | string[] | null | undefined;
  };
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: SupabaseUser;
}

export interface AuthResponse {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  error?: {
    message: string;
    status?: number;
  } | null;
}

export interface SignUpOptions {
  data?: {
    full_name?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
  emailRedirectTo?: string;
}

export interface AuthContextType {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getUserProfile: () => Promise<UserProfile | null>;
}

// ============================================================================
// TIMEZONE TYPES
// ============================================================================

export interface TimezoneData {
  value: string;
  label: string;
  city?: string;
  region?: string;
  currentTime?: string;
  offset?: string;
  searchTerms?: string;
  isCityMapping?: boolean;
  originalCity?: string;
}

// ============================================================================
// FORM & UI TYPES
// ============================================================================

export interface TimeOption {
  value: string;
  label: string;
}

export interface ReminderOption {
  value: string;
  label: string;
}

export interface SelectOption {
  key: string;
  label: string;
  value?: string;
  description?: string;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface EventContextType {
  // Data
  eventData: EventData;
  buttonData: ButtonData;
  outputType: string;
  generatedCode: string;
  calendarLinks: CalendarLinks;
  savedShortLinks: CalendarLinks | null;
  
  // Actions
  updateEvent: (data: Partial<EventData>) => void;
  updateButton: (data: Partial<ButtonData>) => void;
  setOutput: (type: string) => void;
  setSavedShortLinks: (links: CalendarLinks) => void;
  clearShortLinks: () => void;
  
  // State
  isLoading: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface CodeGenerationOptions {
  minified?: boolean;
  includeCss?: boolean;
  includeJs?: boolean;
  format?: 'html' | 'react' | 'css' | 'js';
}

export type OutputType = 'button' | 'links' | 'direct' | 'page';

export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonStyle = 'standard' | 'minimal' | 'pill';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type MonthlyOption = 'date' | 'weekday';
export type PlatformId = 'google' | 'apple' | 'outlook' | 'office365' | 'outlookcom' | 'yahoo';

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export interface FormSectionProps extends BaseComponentProps {
  title?: string;
  description?: string;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export commonly used combinations
export type EventFormData = EventData;
export type ButtonFormData = ButtonData;
export type FullEventData = EventData & {
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Export platform-related types
export type PlatformSelection = ButtonData['selectedPlatforms'];
export type CalendarPlatformLinks = CalendarLinks;

// ============================================================================
// GOOGLE ANALYTICS TYPES
// ============================================================================

type GtagCommand = 'config' | 'set' | 'event' | 'js';

type GtagConfigParams = {
  page_title?: string;
  page_location?: string;
  send_page_view?: boolean;
  [key: string]: string | number | boolean | undefined;
};

type GtagEventParams = {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
};

interface GtagFunction {
  (command: 'config', targetId: string, config?: GtagConfigParams): void;
  (command: 'set', config: { [key: string]: string | number | boolean }): void;
  (command: 'event', eventName: string, eventParams?: GtagEventParams): void;
  (command: 'js', date: Date): void;
  (command: GtagCommand, ...args: unknown[]): void;
}

declare global {
  interface Window {
    gtag: GtagFunction;
    dataLayer: unknown[];
  }
}

// ============================================================================
// SHORT LINK TYPES
// ============================================================================

export interface ShortLink {
  id: string;
  short_id: string;
  original_url: string;
  created_at: string;
  click_count: number;
  user_id?: string;
  event_id?: string; // Links back to the parent event for analytics
  event_title?: string;
  is_active: boolean;
}

export interface CreateShortLinkRequest {
  originalUrl: string;
  eventTitle?: string;
  userId?: string;
}

export interface CreateShortLinkResponse {
  success: boolean;
  shortUrl: string;
  shortId: string;
}

// ============================================================================
// BLOG TYPES
// ============================================================================

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  featured?: boolean;
  image?: string;

  // SEO & AI Optimization
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
  };

  // AI Citation Optimization
  aiOptimization?: {
    directAnswer?: string;
    keyFacts?: string[];
    relatedQueries?: string[];
    technicalDetails?: string;
  };

  // Content Classification
  contentType?: 'tutorial' | 'guide' | 'comparison' | 'case-study' | 'news' | 'opinion';
  targetAudience?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime?: number;

  // Interactive Features
  hasLiveDemo?: boolean;
  hasCodeSamples?: boolean;
  hasCalculator?: boolean;

  // Analytics
  publishedAt?: string;
  updatedAt?: string;
  version?: string;

  // NEW: Custom Images (Spotify-style)
  heroImage?: string;        // Full-width hero image for post page (1920x800px)
  thumbnailImage?: string;   // Thumbnail for blog cards (800x600px)

  // NEW: TL;DR Section
  tldr?: string[];           // 3-5 key takeaway bullet points

  // NEW: FAQ Section
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
  readingTime: {
    text: string;
    minutes: number;
    words: number;
  };
  excerpt?: string;
}

export interface BlogMetadata {
  title: string;
  description: string;
  slug: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  featured?: boolean;
  image?: string;
  readingTime: string;
  heroImage?: string;
  thumbnailImage?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

export interface BlogAuthor {
  name: string;
  bio?: string;
  avatar?: string;
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

// Analytics for blog interactions
export interface BlogAnalyticsEvent {
  eventType: 'code_copy' | 'demo_interaction' | 'calculator_use' | 'link_click' | 'share';
  postSlug: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: string;
  userId?: string;
}

// ============================================================================
// EVENT ANALYTICS TYPES
// ============================================================================

export interface EventAnalytics {
  eventId: string;
  totalClicks: number;
  platformBreakdown: {
    platform: string;
    clicks: number;
  }[];
  lastClickedAt?: string;
}

export interface PlatformAnalytics {
  platform: string;
  displayName: string;
  clicks: number;
  percentage: number;
}