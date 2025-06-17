import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Punktual',
  description: 'Learn about Punktual and our mission to simplify calendar integration',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Punktual</h1>
          <p className="text-xl text-gray-600 mb-8">
            Making calendar integration simple for everyone
          </p>
          <div className="bg-white rounded-lg shadow p-8 text-left">
            <p className="text-gray-600 mb-4">
              Punktual was created to solve the universal challenge of calendar integration. 
              We believe adding events to calendars should be effortless for both creators and end-users.
            </p>
            <p className="text-gray-600">
              More details about our story and mission coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}