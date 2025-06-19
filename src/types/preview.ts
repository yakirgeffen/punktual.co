/**
 * Types for Preview Components
 * Extends the existing types from types/index.ts
 */

import type { EventData, ButtonData, CalendarLinks } from './index';

// Base props for all preview components
export interface BasePreviewProps {
  eventData: EventData;
  buttonData: ButtonData;
  calendarLinks: CalendarLinks;
  isComplete: boolean;
  selectedPlatforms: string[];
  platformInfo: PlatformInfo;
}

// Platform information structure
export interface PlatformInfo {
  [key: string]: {
    name: string;
    logo: string;
  };
}

// Email Links specific types
export interface EmailLinksPreviewProps extends BasePreviewProps {
  onCopy: (text: string, label?: string) => Promise<void>;
}

export type EmailFormat = 'platform-links' | 'button-embed';

export interface EmailFormatOption {
  id: EmailFormat;
  label: string;
  description: string;
  icon: string;
}

// Button Widget specific types  
export interface ButtonWidgetPreviewProps extends BasePreviewProps {
  onCopy: (text: string, label?: string) => Promise<void>;
  activeTab: ButtonWidgetTab;
  onTabChange: (tab: ButtonWidgetTab) => void;
}

export type ButtonWidgetTab = 'button' | 'links' | 'code';

export interface CodeOptions {
  isMinified: boolean;
  codeFormat: 'html' | 'react' | 'css' | 'js';
  includeCss: boolean;
  includeJs: boolean;
}

// Direct Links specific types
export interface DirectLinksPreviewProps extends BasePreviewProps {
  onCopy: (text: string, label?: string) => Promise<void>;
}

// Event Page specific types
export interface EventPagePreviewProps extends BasePreviewProps {
  isComingSoon?: boolean;
}
// Event page will have its own specific props when implemented


// Copy state management
// export interface EventPagePreviewProps extends BasePreviewProps {
//   isComingSoon?: boolean;
// }

// Common preview utilities
export interface PreviewUtils {
  formatDateTime: () => string;
  copyToClipboard: (text: string, label?: string) => Promise<void>;
}