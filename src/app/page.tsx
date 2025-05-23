import Layout from '@/components/Layout/Layout';
import { AuthProvider } from '@/hooks/useAuth';

export default function Home() {
  return (
    <AuthProvider>
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">EasyCal</h1>
            <p className="text-xl text-gray-600">Create Calendar Buttons in Seconds</p>
            <div className="mt-8">
              <button className="btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </AuthProvider>
  );
}