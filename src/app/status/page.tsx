import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Status - Punktual',
  description: 'Punktual service status and uptime',
};

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Service Status</h1>
          <p className="text-xl text-gray-600 mb-8">
            Current status of Punktual services
          </p>
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-600 font-medium">All Systems Operational</span>
            </div>
            <p className="text-gray-600">
              Dedicated status page coming soon with real-time monitoring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
