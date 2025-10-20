"use client";

import { useCallback } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { EventData } from '@/types';

const MAX_JSON_BYTES = 10_000;

type GenerateButtonProps = {
  title: string;
  summary: string;
  slug: string;
};

function sanitizeEventTemplate(template: Partial<EventData>): Partial<EventData> {
  const sanitized: Partial<EventData> = {};

  if (template.title) {
    sanitized.title = String(template.title).slice(0, 200);
  }

  if (template.description) {
    sanitized.description = String(template.description).slice(0, 1200);
  }

  if (template.location) {
    sanitized.location = String(template.location).slice(0, 200);
  }

  if (template.startDate) {
    const parsed = new Date(String(template.startDate));
    if (!Number.isNaN(parsed.getTime())) {
      sanitized.startDate = parsed.toISOString().slice(0, 10);
    }
  }

  if (template.endDate) {
    const parsed = new Date(String(template.endDate));
    if (!Number.isNaN(parsed.getTime())) {
      sanitized.endDate = parsed.toISOString().slice(0, 10);
    }
  }

  if (template.reminderTime) {
    sanitized.reminderTime = String(template.reminderTime).slice(0, 50);
  }

  return sanitized;
}

export function GenerateButton({ title, summary, slug }: GenerateButtonProps) {
  const handleClick = useCallback(() => {
    if (typeof window === 'undefined') return;

    const template = sanitizeEventTemplate({
      title: `${title} Webinar`,
      description: `${summary}\n\nCaptured from punktual.co/blog/${slug}`,
      reminderTime: '30',
    });

    const payload = JSON.stringify(template);
    if (payload.length > MAX_JSON_BYTES) {
      console.warn('[blog] Prefill payload too large, skipping localStorage write');
      return;
    }

    try {
      window.localStorage.setItem('prefill_event', payload);
    } catch (error) {
      console.error('[blog] Failed to store prefill_event:', error);
      return;
    }

    window.location.href = '/create';
  }, [summary, title, slug]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-emerald-50"
    >
      Build this campaign in Punktual
      <ArrowUpRight className="h-4 w-4" />
    </button>
  );
}
