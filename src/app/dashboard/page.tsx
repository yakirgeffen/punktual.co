import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

// Dynamically import the dashboard to reduce initial bundle size
const Dashboard = dynamic(
  () => import('@/components/Dashboard/Dashboard'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm">Loading your events...</p>
        </div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  return (
    <main>
      <ProtectedRoute redirectTo="/dashboard">
        <Dashboard />
      </ProtectedRoute>
    </main>
  );
}

export const metadata = {
  title: 'My Events - Punktual',
  description: 'Manage your saved calendar events',
};