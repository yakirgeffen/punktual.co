import Link from 'next/link';
import { CalendarX, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Page not found | Punktual',
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
          <CalendarX className="w-8 h-8 text-emerald-600" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-emerald-600 mb-2">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">We couldn&apos;t find that page</h1>
        <p className="text-gray-600 mb-8">
          The link may be broken, or the event page may have been unpublished or moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Create an event
          </Link>
        </div>
      </div>
    </main>
  );
}
