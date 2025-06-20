import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API - Punktual',
  description: 'Punktual API information and documentation',
};

export default function ApiInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">API</h1>
          <p className="text-xl text-gray-600 mb-8">
            Programmatic access to Punktual features
          </p>
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600">
              Our API is in development. Soon you&apos;ll be able to:
            </p>
            <ul className="text-left mt-4 text-gray-600 space-y-2">
              <li>• Generate calendar buttons programmatically</li>
              <li>• Integrate with your existing systems</li>
              <li>• Automate event creation</li>
              <li>• Access analytics data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
