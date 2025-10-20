import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Clock, Sparkles } from 'lucide-react';

type BlogHeroProps = {
  totalPosts: number;
  latestPost?: {
    title: string;
    slug: string;
    publishedAt: string;
    readingTimeText: string;
  };
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function BlogHero({ totalPosts, latestPost }: BlogHeroProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 shadow-sm sm:px-10 lg:px-14">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
            <Sparkles className="h-3.5 w-3.5" />
            Punktual Session Logs
          </span>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Shipping notes for teams that learn in public.
            </h1>
            <p className="text-lg text-slate-600">
              We document every iteration—the wins, the near-misses, and the experiments queued
              next—so the entire team (and future-you) can move faster with context.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <CalendarDays className="h-4 w-4 text-emerald-500" />
              {totalPosts} {totalPosts === 1 ? 'session' : 'sessions'} shipped
            </span>
            {latestPost ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <Clock className="h-4 w-4 text-emerald-500" />
                Updated {formatDate(latestPost.publishedAt)}
              </span>
            ) : null}
          </div>
        </div>

        {latestPost ? (
          <div className="relative max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Latest Session
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{latestPost.title}</h2>
            <p className="mt-3 text-sm text-slate-600">
              {formatDate(latestPost.publishedAt)} • {latestPost.readingTimeText}
            </p>
            <Link
              href={`/blog/${latestPost.slug}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              Read session recap
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
