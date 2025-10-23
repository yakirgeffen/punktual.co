import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import SettingsPage from '@/components/Settings/SettingsPage';

export const metadata = {
  title: 'Settings - Punktual',
  description: 'Manage your account settings and preferences',
};

export default function Page() {
  return (
    <main>
      <ProtectedRoute redirectTo="/settings">
        <SettingsPage />
      </ProtectedRoute>
    </main>
  );
}
