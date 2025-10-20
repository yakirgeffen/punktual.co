'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
          <AlertCircle className="h-10 w-10 text-rose-600" />
        </div>

        <h1 className="text-4xl font-semibold text-slate-900">
          Something went wrong
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          We encountered an error while loading the blog. This might be a temporary issue with our
          content management system.
        </p>

        {error.message && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-left">
            <p className="text-sm font-medium text-slate-700">Error details:</p>
            <p className="mt-2 text-sm text-slate-600">{error.message}</p>
            {error.digest && (
              <p className="mt-2 text-xs text-slate-500">Error ID: {error.digest}</p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
        </div>

        <div className="mt-12 rounded-lg border border-slate-200 bg-white p-6 text-left">
          <h2 className="text-lg font-semibold text-slate-900">What can I do?</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-emerald-500">•</span>
              <span>Try refreshing the page using the button above</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500">•</span>
              <span>Check if our Strapi backend is running (developers only)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500">•</span>
              <span>Return to the blog listing and try a different post</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500">•</span>
              <span>If the issue persists, contact our support team</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}