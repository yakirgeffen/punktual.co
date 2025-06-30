'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    console.log('🔄 OAuth Callback: Starting auth callback handling...');
    
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
          throw new Error(error_description || 'Authentication failed');
        }

        if (code) {
          console.log('🔄 OAuth Callback: Exchanging code using Supabase SDK...');
          
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout - please try again')), 10000);
          });

          const exchangePromise = supabase.auth.exchangeCodeForSession(code);
          
          const result = await Promise.race([
            exchangePromise,
            timeoutPromise
          ]) as Awaited<ReturnType<typeof supabase.auth.exchangeCodeForSession>>;
          const { data, error: exchangeError } = result;
          
          if (exchangeError) {
            console.error('❌ OAuth Callback: Exchange error:', exchangeError);
            throw exchangeError;
          }

          if (data?.session) {
            console.log('✅ OAuth Callback: Session exchange successful');
            console.log('👤 OAuth Callback: User authenticated:', data.user?.email);
            
            setSuccess(true);
            
            // Simple direct redirect - no waiting
            console.log('🔄 OAuth Callback: Redirecting to /create immediately...');
            router.replace('/create');
            return;
          } else {
            throw new Error('No session received from authentication');
          }
        } else {
          console.log('⚠️ OAuth Callback: No code parameter, redirecting to home');
          router.replace('/');
          return;
        }
      } catch (err: unknown) {
        console.error('❌ OAuth Callback: Error:', err);
        
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        
        console.error('🔴 OAuth Callback: Error details:', {
          message: errorMessage,
          stack: err instanceof Error ? err.stack : null
        });
        
        // Redirect to home with error message
        setTimeout(() => {
          router.replace('/?auth_error=' + encodeURIComponent(errorMessage));
        }, 3000);
      } finally {
        setLoading(false);
        console.log('✅ OAuth Callback: Processing complete');
      }
    };

    handleAuthCallback();
  }, [searchParams, router, supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Completing Google sign-in...
          </h2>
          <p className="text-gray-600 text-lg">
            Please wait while we set up your account
          </p>
          <p className="text-xs text-gray-400 mt-4">
            If this takes more than 10 seconds, we&apos;ll show an error
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Google Sign-in Failed
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            {error}
          </p>
          <details className="text-sm text-gray-500 mb-8">
            <summary className="cursor-pointer">Technical Details</summary>
            <p className="mt-2">
              The Google OAuth callback failed during session establishment. This may be due to an expired authorization code or Supabase configuration issue.
            </p>
          </details>
          <button
            onClick={() => router.replace('/')}
            className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-400 transition-colors"
          >
            Back to Home
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (success) {
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
            Google sign-in successful. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return null;
}