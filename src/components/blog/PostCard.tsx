import Link from 'next/link';
import { ArrowUpRight, Clock, User } from 'lucide-react';
import type { BlogPostSummary } from '@/utils/blog';

type PostCardProps = {
  post: BlogPostSummary;
  accentIndex: number;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
          <span>{formatDate(post.publishedAt)}</span>
          <span className="h-px w-6 bg-slate-200" />
          <span>{post.readingTimeText}</span>
        </div>

        <h2 className="relative mt-5 text-2xl font-semibold text-slate-900 transition group-hover:text-emerald-600">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>

        <p className="mt-4 text-base leading-relaxed text-slate-600">{post.excerpt}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-500" />
            {post.author}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500" />
            {post.category}
          </span>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-white"
        >
          Read recap
          <ArrowUpRight className="h-4 w-4" />
        </Link>
    </article>
  );
}
