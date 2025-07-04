'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthRequired from './AuthRequired';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute - Conditionally renders children or auth form
 * @param children - Protected content to show when authenticated
 * @param redirectTo - Where to redirect after successful auth
 */
export default function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth();

  // Show loading while auth is initializing (but not if user already exists)
  if ((!initialized && !user) || loading) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 lg:min-h-screen flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the protected content
  if (user) {
    console.log('ProtectedRoute: User authenticated, showing protected content');
    return <>{children}</>;
  }

  // If user is NOT authenticated, show the auth form
  console.log('ProtectedRoute: User not authenticated, showing auth form');
  return <AuthRequired redirectTo={redirectTo} />;
}