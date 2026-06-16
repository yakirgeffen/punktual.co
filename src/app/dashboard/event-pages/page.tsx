'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { Plus, ExternalLink, Globe, FileText, Pencil } from 'lucide-react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { createClientComponentClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { EventPage } from '@/types';

// ---------------------------------------------------------------------------
// Inner component — only rendered when the user is authenticated
// ---------------------------------------------------------------------------

function EventPagesList() {
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  const [pages, setPages] = useState<EventPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('event_pages')
        .select('id, user_id, slug, title, description, location, timezone, feed_token, is_published, created_at, updated_at, accent_color, bg_theme, font_choice, cover_image_url, host_name, host_logo_url, tagline, cta_label, cta_color, og_image_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('[event-pages] fetch error:', dbError);
        setError('Failed to load your event pages. Please try again.');
        return;
      }

      setPages((data ?? []) as EventPage[]);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const togglePublish = async (page: EventPage) => {
    setTogglingId(page.id);
    try {
      const response = await fetch(`/api/event-pages/${page.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !page.is_published }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        console.error('[event-pages] toggle publish failed:', body);
        setError(body.error ?? 'Failed to update publish status.');
        return;
      }

      const updated = await response.json();
      setPages((prev) =>
        prev.map((p) =>
          p.id === page.id ? { ...p, is_published: updated.isPublished } : p
        )
      );
    } catch (err) {
      console.error('[event-pages] toggle publish error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Loading your event pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Event Pages</h1>
            <p className="text-slate-600 mt-1">
              {pages.length === 0
                ? 'No pages yet'
                : `${pages.length} event ${pages.length === 1 ? 'page' : 'pages'}`}
            </p>
          </div>

          <Link href="/create-event-page">
            <Button
              color="primary"
              startContent={<Plus size={18} />}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Create Event Page
            </Button>
          </Link>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {pages.length === 0 && !error && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Globe size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No event pages yet</h2>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Create one to share your event with the world — includes a public page, live calendar feed, and full customization.
            </p>
            <Link href="/create-event-page">
              <Button
                color="primary"
                startContent={<Plus size={18} />}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Create Event Page
              </Button>
            </Link>
          </div>
        )}

        {/* Pages list */}
        {pages.length > 0 && (
          <div className="space-y-3">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Accent color swatch (shows customization at a glance) */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${page.accent_color ?? '#10b981'}20` }}
                >
                  <FileText size={20} style={{ color: page.accent_color ?? '#10b981' }} />
                </div>

                {/* Title + slug */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{page.title}</p>
                  <p className="text-slate-500 text-sm truncate">/e/{page.slug}</p>
                  {page.tagline && (
                    <p className="text-slate-400 text-xs truncate mt-0.5">{page.tagline}</p>
                  )}
                </div>

                {/* Published badge */}
                <div className="flex-shrink-0">
                  {page.is_published ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Draft
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Edit */}
                  <Link
                    href={`/edit-event-page/${page.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>

                  {/* View link — opens public page in new tab */}
                  <a
                    href={`/e/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors"
                  >
                    <ExternalLink size={14} />
                    View
                  </a>

                  {/* Publish / Unpublish toggle */}
                  <button
                    onClick={() => togglePublish(page)}
                    disabled={togglingId === page.id}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      page.is_published
                        ? 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {togglingId === page.id
                      ? '...'
                      : page.is_published
                      ? 'Unpublish'
                      : 'Publish'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page — wraps EventPagesList in ProtectedRoute
// ---------------------------------------------------------------------------

export default function EventPagesPage() {
  return (
    <main>
      <ProtectedRoute redirectTo="/dashboard/event-pages">
        <EventPagesList />
      </ProtectedRoute>
    </main>
  );
}
