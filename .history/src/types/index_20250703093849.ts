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
  buttonStyle?: 'standard' | 'outlined' | 'minimal' | 'pill' | 'gradient' | 'rounded' | 'sharp';
  buttonSize?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg' | 'xl';
  buttonLayout?: 'dropdown' | 'individual';
  buttonShape?: string;
  
  // Colors
  colorTheme?: string;
  textColor?: string;
  colorTheme?: string;
  customBrandColor?: string;
  
  // Features
  showIcons?: boolean;
  responsive?: boolean;
  openInNewTab?: boolean;
  ctaText?: string;
  displayOption?: string;
  
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
  
  // Actions
  updateEvent: (data: Partial<EventData>) => void;
  updateButton: (data: Partial<ButtonData>) => void;
  setOutput: (type: string) => void;
  
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
export type ButtonStyle = 'standard' | 'outlined' | 'minimal' | 'pill';
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