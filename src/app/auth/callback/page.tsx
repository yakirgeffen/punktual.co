'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initialized } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 OAuth Callback: Starting callback...');
    
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
          setError(error_description || 'Authentication failed');
          setTimeout(() => {
            router.replace('/?auth_error=' + encodeURIComponent(error_description || 'Authentication failed'));
          }, 3000);
          return;
        }

        if (!code) {
          console.log('⚠️ No auth code, redirecting home');
          router.replace('/');
          return;
        }

        console.log('✅ OAuth code found, exchanging for session...');
        
        // Import supabase client
        const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
        const supabase = createClientComponentClient();
        
        // Exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('❌ Error exchanging code:', exchangeError);
          setError(exchangeError.message);
          return;
        }
        
        console.log('✅ Code exchanged successfully, waiting for auth state update...');

      } catch (err: unknown) {
        console.error('❌ OAuth Callback: Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setTimeout(() => {
          router.replace('/?auth_error=' + encodeURIComponent(errorMessage));
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  // Separate timeout effect that can be properly cleaned up
  useEffect(() => {
    if (hasRedirected) return;
    
    const timeoutId = setTimeout(() => {
      if (!hasRedirected) {
        console.log('⏰ Timeout reached, redirecting home');
        router.replace('/?auth_error=' + encodeURIComponent('Authentication timeout'));
      }
    }, 15000);

    return () => {
      console.log('🧹 Clearing timeout');
      clearTimeout(timeoutId);
    };
  }, [hasRedirected, router]);

  // Watch for auth state changes and redirect when user is authenticated
  useEffect(() => {
    if (initialized && user && !hasRedirected) {
      console.log('✅ User authenticated, redirecting to /create...', user.email);
      setHasRedirected(true);
      
      setTimeout(() => {
        router.replace('/create');
      }, 500);
    }
  }, [user, initialized, hasRedirected, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Authentication Failed
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            {error}
          </p>
          <button
            onClick={() => router.replace('/')}
            className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors"
          >
            Back to Home
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Welcome to Punktual!
        </h2>
        <p className="text-gray-600 text-lg mb-2">
          Processing Google sign-in...
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Waiting for authentication to complete
        </p>
        <div className="flex items-center justify-center mt-6">
          <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-500 font-medium">Setting up your account...</span>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          {initialized ? 'Authentication system ready' : 'Initializing authentication system...'}
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span className="text-gray-500 font-medium">Loading...</span>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}