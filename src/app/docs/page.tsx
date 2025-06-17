import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation - Punktual',
  description: 'Complete guide to using Punktual',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete guide to using Punktual
          </p>
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600">
              Comprehensive documentation is being prepared. This will include:
            </p>
            <ul className="text-left mt-4 text-gray-600 space-y-2">
              <li>• Getting started guide</li>
              <li>• API reference</li>
              <li>• Integration examples</li>
              <li>• Troubleshooting tips</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
