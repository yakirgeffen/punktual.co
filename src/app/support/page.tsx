import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support - Punktual',
  description: 'Report bugs and get technical support',
};

export default function SupportPage() {
  return (
    <div className="min-h-auto bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bug Reports & Support</h1>
          <p className="text-xl text-gray-600 mb-8">
            Report issues and get technical assistance
          </p>
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600 mb-4">
              Found a bug or need technical help? We&apos;re here to assist!
            </p>
            <p className="text-gray-600">
              Support ticketing system coming soon. For now, email us at:
            </p>
            <p className="text-lg font-medium text-emerald-600 mt-2">
              hello@punktual.co
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
