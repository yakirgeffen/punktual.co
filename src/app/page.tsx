import Layout from '@/components/Layout/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">EasyCal</h1>
          <p className="text-xl text-gray-600">Create Calendar Buttons in Seconds</p>
          <div className="mt-8">
            <Link 
              href="/create"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-md inline-block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}