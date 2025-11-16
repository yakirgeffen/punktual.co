/**
 * Not Found Page for Event Landing
 * Shown when event with given shareId doesn't exist
 */

import Link from 'next/link';

export default function EventNotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12">
          <div className="text-6xl mb-4">📅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Event Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The event you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link
            href="/create"
            className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Create Your Own Event
          </Link>
        </div>
      </div>
    </main>
  );
}
