'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@heroui/react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

// ---------------------------------------------------------------------------
// Form state type
// ---------------------------------------------------------------------------

interface FormState {
  title: string;
  description: string;
  location: string;
  timezone: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isAllDay: boolean;
}

const DEFAULT_FORM: FormState = {
  title: '',
  description: '',
  location: '',
  timezone: 'UTC',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  isAllDay: false,
};

// ---------------------------------------------------------------------------
// Inner form — only rendered when user is authenticated
// ---------------------------------------------------------------------------

function CreateEventPageForm() {
  const router = useRouter();
  const { session } = useAuth();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }

    if (!form.timezone.trim()) {
      toast.error('Timezone is required.');
      return;
    }

    setSubmitting(true);

    try {
      // Build ISO 8601 timestamps from separate date+time fields
      let startAt: string | undefined;
      let endAt: string | undefined;

      if (form.startDate) {
        if (form.isAllDay) {
          // For all-day events use noon UTC to avoid date-boundary edge cases
          startAt = new Date(`${form.startDate}T12:00:00Z`).toISOString();
        } else if (form.startTime) {
          startAt = new Date(`${form.startDate}T${form.startTime}:00`).toISOString();
        } else {
          startAt = new Date(`${form.startDate}T00:00:00`).toISOString();
        }
      }

      if (form.endDate) {
        if (form.isAllDay) {
          endAt = new Date(`${form.endDate}T12:00:00Z`).toISOString();
        } else if (form.endTime) {
          endAt = new Date(`${form.endDate}T${form.endTime}:00`).toISOString();
        } else {
          endAt = new Date(`${form.endDate}T00:00:00`).toISOString();
        }
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        timezone: form.timezone.trim(),
        startAt,
        endAt,
        isAllDay: form.isAllDay,
      };

      const response = await fetch('/api/event-pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.error ?? 'Failed to create event page.');
        return;
      }

      toast.success('Event page created!');
      router.push('/dashboard/event-pages');
    } catch (err) {
      console.error('[create-event-page] submit error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create Event Page</h1>
          <p className="text-slate-500 mt-1">
            Fill in the details below. Your page starts as a draft — publish when ready.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Product Launch 2026"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional — describe your event for attendees"
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. 123 Main St, New York or Zoom link"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-slate-700 mb-1">
              Timezone <span className="text-red-500">*</span>
            </label>
            <input
              id="timezone"
              name="timezone"
              type="text"
              value={form.timezone}
              onChange={handleChange}
              placeholder="e.g. America/New_York"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
            <p className="text-slate-400 text-xs mt-1">
              Use an IANA timezone identifier, e.g. America/New_York, Europe/London, Asia/Tokyo
            </p>
          </div>

          {/* All-day toggle */}
          <div className="flex items-center gap-3">
            <input
              id="isAllDay"
              name="isAllDay"
              type="checkbox"
              checked={form.isAllDay}
              onChange={handleChange}
              className="w-4 h-4 accent-emerald-500"
            />
            <label htmlFor="isAllDay" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
              All-day event
            </label>
          </div>

          {/* Date / time fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Start time — hidden when all-day */}
            {!form.isAllDay && (
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-1">
                  Start Time
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            )}

            {/* End date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">
                End Date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>

            {/* End time — hidden when all-day */}
            {!form.isAllDay && (
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-1">
                  End Time
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <Button
              type="submit"
              color="primary"
              isLoading={submitting}
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
            >
              {submitting ? 'Creating...' : 'Create Event Page'}
            </Button>

            <Button
              type="button"
              variant="bordered"
              disabled={submitting}
              onClick={() => router.push('/dashboard/event-pages')}
              className="border-slate-200 text-slate-600"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page — wraps the form in ProtectedRoute
// ---------------------------------------------------------------------------

export default function CreateEventPagePage() {
  return (
    <main>
      <ProtectedRoute redirectTo="/create-event-page">
        <CreateEventPageForm />
      </ProtectedRoute>
    </main>
  );
}
