import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <FileQuestion className="h-10 w-10 text-slate-600" />
        </div>

        <h1 className="text-4xl font-semibold text-slate-900">
          Blog not found
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          The blog page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all posts
          </Link>
        </div>

        <div className="mt-12 rounded-lg border border-slate-200 bg-white p-6 text-left">
          <h2 className="text-lg font-semibold text-slate-900">Looking for something specific?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Visit our blog listing to browse all available session logs and guides, or use the
            search feature to find what you need.
          </p>
        </div>
      </div>
    </div>
  );
}
