import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center - Punktual',
  description: 'Get help with creating calendar buttons and events',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">
            Get help with creating calendar buttons and managing your events
          </p>
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600 mb-4">
              This page is coming soon! In the meantime, feel free to contact us directly.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}