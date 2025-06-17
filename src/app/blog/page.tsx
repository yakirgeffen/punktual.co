import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Punktual',
  description: 'Tips, tutorials, and insights about calendar marketing',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Punktual Blog</h1>
          <p className="text-xl text-gray-600 mb-8">
            Tips, tutorials, and insights about calendar marketing
          </p>
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600">
              Our blog is launching soon with helpful content about calendar marketing, 
              event promotion strategies, and technical tutorials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
