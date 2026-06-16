'use client';

/**
 * Edit Event Page — /edit-event-page/[id]
 *
 * Organizer edit flow for an existing event page. Renders a two-column layout:
 *   Left  — tabbed form (Details | Style | Sharing)
 *   Right — live phone-frame preview that updates as the organizer types
 *
 * All customization fields are wired to a single useEventPageEditor hook
 * that manages local state + debounced auto-save via PATCH /api/event-pages/[id].
 *
 * Image uploads target the 'event-page-assets' Supabase Storage bucket.
 * The upload path is: [user_id]/[event_page_id]/[filename]
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@heroui/react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@/lib/supabase/client';
import type { EventPage, EventPageBgTheme, EventPageFontChoice } from '@/types';

// ---------------------------------------------------------------------------
// Constants / config
// ---------------------------------------------------------------------------

const ACCENT_DEFAULT = '#10b981';
const BG_THEME_DEFAULT: EventPageBgTheme = 'white';
const FONT_DEFAULT: EventPageFontChoice = 'nunito';
const CTA_LABEL_DEFAULT = 'Subscribe to this event';
const STORAGE_BUCKET = 'event-page-assets';

const FONT_OPTIONS: { value: EventPageFontChoice; label: string; sample: string; fontFamily: string }[] = [
  { value: 'nunito', label: 'Friendly and Round', sample: 'Abc', fontFamily: '"Nunito", "Varela Round", sans-serif' },
  { value: 'inter', label: 'Clean and Modern', sample: 'Abc', fontFamily: '"Inter", system-ui, sans-serif' },
  { value: 'lora', label: 'Elegant and Considered', sample: 'Abc', fontFamily: '"Lora", Georgia, serif' },
];

interface BgThemeOption {
  value: EventPageBgTheme;
  label: string;
  bg: string;
  text: string;
  border: string;
  secondaryText: string;
  previewStyle: React.CSSProperties;
}

const BG_THEME_OPTIONS: BgThemeOption[] = [
  {
    value: 'white',
    label: 'Clean White',
    bg: '#ffffff',
    text: '#111827',
    border: '#e5e7eb',
    secondaryText: '#6b7280',
    previewStyle: { background: '#ffffff' },
  },
  {
    value: 'stone',
    label: 'Warm Stone',
    bg: '#faf7f4',
    text: '#1c1917',
    border: '#e7e5e4',
    secondaryText: '#78716c',
    previewStyle: { background: '#faf7f4' },
  },
  {
    value: 'dark',
    label: 'Dark',
    bg: '#0f172a',
    text: '#f8fafc',
    border: '#1e293b',
    secondaryText: '#94a3b8',
    previewStyle: { background: '#0f172a' },
  },
  {
    value: 'gradient',
    label: 'Soft Gradient',
    bg: '#ffffff',
    text: '#111827',
    border: '#e5e7eb',
    secondaryText: '#6b7280',
    previewStyle: { background: 'linear-gradient(135deg, #10b98112 0%, #ffffff 60%)' },
  },
];

// Derive theme tokens from selection + accent color
function getThemeTokens(theme: EventPageBgTheme, accentColor: string): BgThemeOption {
  const base = BG_THEME_OPTIONS.find(t => t.value === theme) ?? BG_THEME_OPTIONS[0];
  if (theme === 'gradient') {
    // Derive gradient tint from accent color (7% opacity via hex alpha)
    const accent6 = accentColor.replace('#', '').slice(0, 6);
    return {
      ...base,
      previewStyle: { background: `linear-gradient(135deg, #${accent6}12 0%, #ffffff 60%)` },
    };
  }
  return base;
}

// ---------------------------------------------------------------------------
// Form state type
// ---------------------------------------------------------------------------

interface EditFormState {
  // Details
  title: string;
  description: string;
  location: string;
  timezone: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isAllDay: boolean;
  // Style
  tagline: string;
  hostName: string;
  hostLogoUrl: string;
  coverImageUrl: string;
  accentColor: string;
  bgTheme: EventPageBgTheme;
  fontChoice: EventPageFontChoice;
  ctaLabel: string;
  // Sharing
  ogImageUrl: string;
}

function pageToFormState(page: EventPage): EditFormState {
  // Convert timestamptz → local date+time strings
  const tz = page.timezone || 'UTC';
  let startDate = '';
  let startTime = '';
  let endDate = '';
  let endTime = '';

  if (page.start_at) {
    const d = new Date(page.start_at);
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    startDate = fmt.format(d);
    if (!page.is_all_day) {
      const tf = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
      startTime = tf.format(d).replace(/\s/g, '');
    }
  }
  if (page.end_at) {
    const d = new Date(page.end_at);
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    endDate = fmt.format(d);
    if (!page.is_all_day) {
      const tf = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
      endTime = tf.format(d).replace(/\s/g, '');
    }
  }

  return {
    title: page.title ?? '',
    description: page.description ?? '',
    location: page.location ?? '',
    timezone: page.timezone ?? 'UTC',
    startDate,
    startTime,
    endDate,
    endTime,
    isAllDay: page.is_all_day ?? false,
    tagline: page.tagline ?? '',
    hostName: page.host_name ?? '',
    hostLogoUrl: page.host_logo_url ?? '',
    coverImageUrl: page.cover_image_url ?? '',
    accentColor: page.accent_color ?? ACCENT_DEFAULT,
    bgTheme: (page.bg_theme as EventPageBgTheme) ?? BG_THEME_DEFAULT,
    fontChoice: (page.font_choice as EventPageFontChoice) ?? FONT_DEFAULT,
    ctaLabel: page.cta_label ?? CTA_LABEL_DEFAULT,
    ogImageUrl: page.og_image_url ?? '',
  };
}

function formStateToPatch(form: EditFormState, tz: string) {
  let startAt: string | null = null;
  let endAt: string | null = null;

  if (form.startDate) {
    if (form.isAllDay) {
      startAt = new Date(`${form.startDate}T12:00:00Z`).toISOString();
    } else if (form.startTime) {
      startAt = new Date(`${form.startDate}T${form.startTime}:00`).toISOString();
    }
  }
  if (form.endDate) {
    if (form.isAllDay) {
      endAt = new Date(`${form.endDate}T12:00:00Z`).toISOString();
    } else if (form.endTime) {
      endAt = new Date(`${form.endDate}T${form.endTime}:00`).toISOString();
    }
  }

  return {
    title: form.title,
    description: form.description || null,
    location: form.location || null,
    timezone: form.timezone,
    start_at: startAt,
    end_at: endAt,
    is_all_day: form.isAllDay,
    tagline: form.tagline || null,
    host_name: form.hostName || null,
    host_logo_url: form.hostLogoUrl || null,
    cover_image_url: form.coverImageUrl || null,
    accent_color: form.accentColor || ACCENT_DEFAULT,
    bg_theme: form.bgTheme,
    font_choice: form.fontChoice,
    cta_label: form.ctaLabel || CTA_LABEL_DEFAULT,
    og_image_url: form.ogImageUrl || null,
  };
}

// ---------------------------------------------------------------------------
// Live Preview component (phone-frame)
// ---------------------------------------------------------------------------

interface PreviewProps {
  form: EditFormState;
  slug: string;
}

function LivePreview({ form, slug }: PreviewProps) {
  const theme = getThemeTokens(form.bgTheme, form.accentColor);
  const accent = form.accentColor || ACCENT_DEFAULT;
  const fontFamily = FONT_OPTIONS.find(f => f.value === form.fontChoice)?.fontFamily
    ?? '"Nunito", "Varela Round", sans-serif';

  const isDark = form.bgTheme === 'dark';
  const titleColor = theme.text;
  const metaColor = theme.secondaryText;
  const borderColor = theme.border;
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const cardBorder = isDark ? '#334155' : borderColor;

  return (
    <div className="sticky top-6 flex flex-col items-center">
      <p className="text-slate-400 text-xs mb-3 font-medium tracking-wide uppercase">Live Preview</p>

      {/* Phone frame */}
      <div
        className="relative mx-auto overflow-hidden"
        style={{
          width: 320,
          height: 580,
          borderRadius: 32,
          border: '10px solid #1e293b',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.08)',
          background: '#1e293b',
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 90,
            height: 22,
            background: '#1e293b',
            borderRadius: '0 0 16px 16px',
            zIndex: 20,
          }}
        />

        {/* Screen */}
        <div
          style={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            borderRadius: 22,
            fontFamily,
            ...theme.previewStyle,
          }}
        >
          {/* Cover image */}
          {form.coverImageUrl && (
            <div style={{ width: '100%', height: 120, overflow: 'hidden', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.coverImageUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Hero content */}
          <div style={{ padding: '20px 16px 12px', fontFamily }}>
            {/* Host row */}
            {form.hostName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                {form.hostLogoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.hostLogoUrl} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <span style={{ fontSize: 11, color: metaColor, fontWeight: 500 }}>
                  Hosted by {form.hostName}
                </span>
              </div>
            )}

            {/* Title — display font */}
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: titleColor,
              lineHeight: 1.3,
              marginBottom: 4,
              fontFamily,
            }}>
              {form.title || 'Your Event Title'}
            </div>

            {/* Tagline — display font */}
            {form.tagline && (
              <div style={{ fontSize: 12, color: metaColor, marginBottom: 8, fontFamily }}>
                {form.tagline}
              </div>
            )}

            {/* Date placeholder */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span style={{ fontSize: 11, color: titleColor, fontWeight: 600 }}>
                {form.startDate || 'Date coming soon'}
              </span>
            </div>

            {/* Location placeholder */}
            {form.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ fontSize: 11, color: titleColor, fontWeight: 500 }}>{form.location}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: isDark ? '#1e293b' : '#f3f4f6', margin: '0 16px' }} />

          {/* Calendar CTA card */}
          <div style={{ margin: 16 }}>
            <div style={{
              background: cardBg,
              borderRadius: 10,
              border: `1px solid ${cardBorder}`,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 12px 6px', borderBottom: `1px solid ${cardBorder}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: titleColor, fontFamily }}>
                  Add this event to your calendar
                </div>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Google', 'Apple', 'Outlook'].map(cal => (
                    <div key={cal} style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '5px 2px',
                      borderRadius: 6,
                      border: `1px solid ${cardBorder}`,
                      fontSize: 9,
                      color: titleColor,
                      fontWeight: 500,
                    }}>{cal}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subscribe CTA */}
          <div style={{ margin: '0 16px 16px' }}>
            <div style={{
              background: isDark ? `${accent}22` : `${accent}14`,
              borderRadius: 10,
              border: `1px solid ${accent}40`,
              padding: '10px 12px',
            }}>
              <div style={{
                display: 'inline-block',
                background: accent,
                color: '#fff',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 10,
                fontWeight: 600,
                width: '100%',
                textAlign: 'center',
              }}>
                {form.ctaLabel || CTA_LABEL_DEFAULT}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '8px', textAlign: 'center', borderTop: `1px solid ${borderColor}` }}>
            <span style={{ fontSize: 9, color: metaColor }}>Powered by Punktual</span>
          </div>
        </div>
      </div>

      {/* Preview link */}
      <a
        href={`/e/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-xs text-slate-400 hover:text-emerald-500 transition-colors"
      >
        Open full page preview
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Color picker input
// ---------------------------------------------------------------------------

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [hex, setHex] = useState(value);

  useEffect(() => { setHex(value); }, [value]);

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setHex(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      onChange(v);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer overflow-hidden"
            style={{ background: value }}
          >
            <input
              type="color"
              value={value}
              onChange={e => { setHex(e.target.value); onChange(e.target.value); }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
        <input
          type="text"
          value={hex}
          onChange={handleHexInput}
          placeholder="#10b981"
          maxLength={7}
          className="w-28 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          {['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6'].map(preset => (
            <button
              key={preset}
              type="button"
              title={preset}
              onClick={() => { setHex(preset); onChange(preset); }}
              className="w-6 h-6 rounded-full border-2 transition-all"
              style={{
                background: preset,
                borderColor: value === preset ? '#1e293b' : 'transparent',
                boxShadow: value === preset ? '0 0 0 1px white inset' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image upload field
// ---------------------------------------------------------------------------

function ImageField({
  label,
  hint,
  value,
  onChange,
  onUpload,
  uploading,
  accept = 'image/jpeg,image/png,image/webp',
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string | null>;
  uploading: boolean;
  accept?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onUpload(file);
    if (url) onChange(url);
    // reset so same file can be re-uploaded
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {hint && <p className="text-slate-400 text-xs mb-2">{hint}</p>}

      {value && (
        <div className="mb-2 relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-16 w-auto rounded-lg border border-slate-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-700 text-white rounded-full text-xs flex items-center justify-center"
            title="Remove image"
          >
            x
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mt-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          {uploading ? 'Uploading...' : 'Upload image'}
        </button>
        <span className="text-slate-400 text-xs">or</span>
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste URL"
          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>
      <input ref={fileRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main editor component
// ---------------------------------------------------------------------------

type Tab = 'details' | 'style' | 'sharing';

function EditEventPageForm({ pageId }: { pageId: string }) {
  const router = useRouter();
  const { user, session } = useAuth();
  const supabase = createClientComponentClient();

  const [page, setPage] = useState<EventPage | null>(null);
  const [form, setForm] = useState<EditFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>('details');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingHostLogo, setUploadingHostLogo] = useState(false);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);

  // Load the page
  useEffect(() => {
    if (!pageId || !session) return;

    (async () => {
      try {
        const res = await fetch(`/api/event-pages/${pageId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) {
          toast.error('Could not load event page.');
          router.push('/dashboard/event-pages');
          return;
        }
        const { page: loaded } = await res.json();
        setPage(loaded as EventPage);
        setForm(pageToFormState(loaded as EventPage));
      } catch {
        toast.error('Could not load event page.');
      } finally {
        setLoading(false);
      }
    })();
  }, [pageId, session, router]);

  const setField = useCallback(<K extends keyof EditFormState>(key: K, value: EditFormState[K]) => {
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
  }, []);

  // Image upload helper
  const uploadImage = useCallback(async (
    file: File,
    folder: string,
    onUploading: (v: boolean) => void
  ): Promise<string | null> => {
    if (!user || !pageId) return null;

    const maxMB = folder === 'cover' ? 5 : 2;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`File too large. Max ${maxMB}MB.`);
      return null;
    }

    onUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${user.id}/${pageId}/${folder}-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.error('[upload] error:', error);
        toast.error('Upload failed. Please try again.');
        return null;
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

      return urlData?.publicUrl ?? null;
    } finally {
      onUploading(false);
    }
  }, [user, pageId, supabase]);

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form || !page || !session) return;

    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }

    setSaving(true);
    try {
      const patch = formStateToPatch(form, form.timezone);

      const res = await fetch(`/api/event-pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? 'Failed to save changes.');
        return;
      }

      toast.success('Changes saved.');
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Loading / error states
  // -------------------------------------------------------------------------

  if (loading || !form || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Loading event page...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      tab === t
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/event-pages" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-slate-900 truncate max-w-xs sm:max-w-sm">{form.title || 'Edit Event Page'}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              page.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${page.is_published ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {page.is_published ? 'Live' : 'Draft'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/e/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View page
            </a>

            <Button
              type="button"
              color="primary"
              size="sm"
              isLoading={saving}
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Left — Form */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button type="button" className={tabClass('details')} onClick={() => setTab('details')}>Details</button>
            <button type="button" className={tabClass('style')} onClick={() => setTab('style')}>Page Style</button>
            <button type="button" className={tabClass('sharing')} onClick={() => setTab('sharing')}>Sharing</button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">

            {/* ============================================================ */}
            {/* TAB: Details                                                   */}
            {/* ============================================================ */}
            {tab === 'details' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setField('title', e.target.value)}
                    placeholder="e.g. Product Launch 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setField('description', e.target.value)}
                    placeholder="Describe your event for attendees"
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setField('location', e.target.value)}
                    placeholder="e.g. 123 Main St or Zoom link"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Timezone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.timezone}
                    onChange={e => setField('timezone', e.target.value)}
                    placeholder="e.g. America/New_York"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                  <p className="text-slate-400 text-xs mt-1">IANA timezone identifier</p>
                </div>

                {/* All-day toggle */}
                <div className="flex items-center gap-3">
                  <input
                    id="isAllDay"
                    type="checkbox"
                    checked={form.isAllDay}
                    onChange={e => setField('isAllDay', e.target.checked)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <label htmlFor="isAllDay" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                    All-day event
                  </label>
                </div>

                {/* Date/time grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                  {!form.isAllDay && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                      <input type="time" value={form.startTime} onChange={e => setField('startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input type="date" value={form.endDate} onChange={e => setField('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                  {!form.isAllDay && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                      <input type="time" value={form.endTime} onChange={e => setField('endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB: Style                                                     */}
            {/* ============================================================ */}
            {tab === 'style' && (
              <div className="space-y-6">
                {/* Page Identity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                  <h2 className="text-base font-semibold text-slate-900">Page Identity</h2>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={e => setField('tagline', e.target.value)}
                      placeholder="e.g. Annual team gathering for Q3"
                      maxLength={120}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                    <p className="text-slate-400 text-xs mt-1">Appears below the event title. Leave empty to hide.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Host Name</label>
                    <input
                      type="text"
                      value={form.hostName}
                      onChange={e => setField('hostName', e.target.value)}
                      placeholder="e.g. Acme Corp or Jane Smith"
                      maxLength={60}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                    <p className="text-slate-400 text-xs mt-1">Shown as "Hosted by [name]". Leave empty to hide.</p>
                  </div>

                  <ImageField
                    label="Host Logo"
                    hint="Circular, 48px. JPG, PNG or WebP, max 2MB."
                    value={form.hostLogoUrl}
                    onChange={v => setField('hostLogoUrl', v)}
                    onUpload={f => uploadImage(f, 'host-logo', setUploadingHostLogo)}
                    uploading={uploadingHostLogo}
                  />
                </div>

                {/* Cover Image */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                  <h2 className="text-base font-semibold text-slate-900">Cover Image</h2>
                  <ImageField
                    label="Cover / hero image"
                    hint="Displayed full-width above the event title. JPG, PNG or WebP, max 5MB. Leave empty for a clean text-only header."
                    value={form.coverImageUrl}
                    onChange={v => setField('coverImageUrl', v)}
                    onUpload={f => uploadImage(f, 'cover', setUploadingCover)}
                    uploading={uploadingCover}
                  />
                </div>

                {/* Page Appearance */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                  <h2 className="text-base font-semibold text-slate-900">Page Appearance</h2>

                  {/* Accent color */}
                  <ColorField
                    label="Accent color"
                    value={form.accentColor}
                    onChange={v => setField('accentColor', v)}
                  />

                  {/* Background theme */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Background</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {BG_THEME_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setField('bgTheme', opt.value)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            form.bgTheme === opt.value
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className="w-full h-10 rounded-lg border border-slate-200 overflow-hidden"
                            style={opt.previewStyle}
                          >
                            {/* Small text sample in the swatch */}
                            <div style={{ padding: '4px 6px', fontSize: 7, color: opt.text, fontWeight: 600 }}>
                              Abc
                            </div>
                          </div>
                          <span className="text-xs font-medium text-slate-700">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font choice */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Font</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {FONT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setField('fontChoice', opt.value)}
                          className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all text-left ${
                            form.fontChoice === opt.value
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span style={{ fontFamily: opt.fontFamily, fontSize: 22, color: '#111827', lineHeight: 1.2 }}>
                            {opt.sample}
                          </span>
                          <span className="text-xs font-medium text-slate-600">{opt.label}</span>
                          <span style={{ fontFamily: opt.fontFamily, fontSize: 10, color: '#6b7280' }}>
                            The quick brown fox
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                  <h2 className="text-base font-semibold text-slate-900">Call to Action</h2>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subscribe button label</label>
                    <input
                      type="text"
                      value={form.ctaLabel}
                      onChange={e => setField('ctaLabel', e.target.value)}
                      placeholder={CTA_LABEL_DEFAULT}
                      maxLength={80}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {['Follow this event', 'Stay updated', 'Subscribe to updates', 'Get calendar updates'].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setField('ctaLabel', s)}
                          className="px-2.5 py-1 text-xs rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB: Sharing                                                   */}
            {/* ============================================================ */}
            {tab === 'sharing' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 mb-1">Social Share Preview</h2>
                  <p className="text-slate-500 text-sm">
                    Controls how your event looks when shared on WhatsApp, iMessage, or social media.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Auto-generated preview image</p>
                  {/* Preview of what the OG image will look like */}
                  <div
                    className="w-full aspect-[1200/630] rounded-lg overflow-hidden flex items-center justify-center relative"
                    style={{ background: `linear-gradient(135deg, ${form.accentColor} 0%, ${form.accentColor}cc 100%)` }}
                  >
                    <div className="text-center px-8">
                      <div className="text-white text-xs font-medium mb-3 opacity-70">Punktual</div>
                      <div className="text-white font-bold text-lg leading-tight mb-2">
                        {form.title || 'Your Event Title'}
                      </div>
                      {form.tagline && (
                        <div className="text-white text-sm opacity-80">{form.tagline}</div>
                      )}
                    </div>
                    {/* Decorative dots */}
                    <div className="absolute bottom-4 right-6 text-white opacity-30 text-xs">punktual.co</div>
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    This image is auto-generated when no custom OG image is set. It uses your accent color and event title.
                  </p>
                </div>

                <ImageField
                  label="Custom OG image (optional)"
                  hint="Upload a custom image to use instead. Ideal size: 1200 x 630px. JPG, PNG or WebP, max 2MB."
                  value={form.ogImageUrl}
                  onChange={v => setField('ogImageUrl', v)}
                  onUpload={f => uploadImage(f, 'og-image', setUploadingOgImage)}
                  uploading={uploadingOgImage}
                />

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-500 text-sm font-medium mb-1">Your event page link</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg truncate">
                      {typeof window !== 'undefined' ? window.location.origin : 'https://punktual.co'}/e/{page.slug}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://punktual.co'}/e/${page.slug}`;
                        navigator.clipboard?.writeText(url);
                        toast.success('Link copied!');
                      }}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Right — Live Preview */}
        <div className="lg:col-span-2 hidden lg:block">
          <LivePreview form={form} slug={page.slug} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

export default function EditEventPagePage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  return (
    <main>
      <ProtectedRoute redirectTo={`/edit-event-page/${id}`}>
        <EditEventPageForm pageId={id} />
      </ProtectedRoute>
    </main>
  );
}
