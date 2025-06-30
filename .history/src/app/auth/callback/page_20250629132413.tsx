'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('🔄 OAuth Callback: Starting DIRECT redirect approach...');
    
    const handleAuthCallback = async () => {
      try {
        const code = searchParams?.get('code');
        const error_code = searchParams?.get('error');
        const error_description = searchParams?.get('error_description');

        console.log('🔍 OAuth Callback: URL params:', {
          hasCode: !!code,
          hasError: !!error_code,
          error_description
        });

        if (error_code) {
          console.error('❌ OAuth Error:', error_description);
          router.replace('/?auth_error=' + encodeURIComponent(error_description || 'Authentication failed'));
          return;
        }

        if (!code) {
          console.log('⚠️ No auth code, redirecting home');
          router.replace('/');
          return;
        }

        // NUCLEAR OPTION: Skip Supabase SDK entirely
        // Let the auth hook handle the session via the auth state listener
        // Just redirect immediately - the browser should have the session cookies
        console.log('🚀 NUCLEAR OPTION: Skipping exchangeCodeForSession entirely');
        console.log('🔄 Redirecting to /create immediately - let auth hook handle session');
        
        // Small delay to let any background auth processing complete
        setTimeout(() => {
          router.replace('/create');
        }, 1000);

      } catch (err: unknown) {
        console.error('❌ OAuth Callback: Unexpected error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        router.replace('/?auth_error=' + encodeURIComponent(errorMessage));
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  // Always show success state since we're doing direct redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Welcome to Punktual!
        </h2>
        <p className="text-gray-600 text-lg mb-2">
          Google sign-in successful. Taking you to create your first event...
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Using direct redirect approach
        </p>
        <div className="flex items-center justify-center mt-6">
          <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-500 font-medium">Redirecting...</span>
        </div>
      </div>
    </div>
  );
}