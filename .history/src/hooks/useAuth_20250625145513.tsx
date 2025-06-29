'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Spinner } from '@heroui/react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const supabase = createClientComponentClient();

  useEffect(() => {
    console.log('🟡 AuthCallback useEffect started');
    
    const handleAuthCallback = async () => {
      console.log('🟡 handleAuthCallback function called');
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error_code = urlParams.get('error');
        const error_description = urlParams.get('error_description');

        console.log('🟡 Retrieved URL params - code:', !!code, 'error_code:', error_code);

        // Handle OAuth errors
        if (error_code) {
          throw new Error(error_description || 'Authentication failed');
        }

        // Handle missing code
        if (!code) {
          console.log('❌ No code parameter, redirecting to home');
          router.push('/');
          return;
        }

        console.log('🔄 Processing OAuth code...');
        
        // Exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.log('❌ Exchange code error:', exchangeError);
          throw exchangeError;
        }
        
        console.log('✅ OAuth code exchange successful');
        setSuccess(true);
        setLoading(false);
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('❌ Auth callback error:', error);
        setError(errorMessage);
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  // Handle success state countdown and redirect
  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            console.log('🚀 Redirecting to /create');
            router.push('/create');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [success, router]);

  // Handle error state auto-redirect
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        console.log('🔴 Redirecting to home after error');
        router.push('/');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, router]);

  console.log('🟡 Component render - loading:', loading, 'error:', !!error, 'success:', success);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Completing sign-in...
          </h2>
          <p className="mt-2 text-gray-600">
            Please wait while we set up your account
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Home
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Redirecting to home in 5 seconds...
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Punktual!
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been set up successfully. Get ready to create your first calendar event!
          </p>
          <div className="flex items-center justify-center text-emerald-600 mb-4">
            <Spinner size="sm" color="success" />
            <span className="ml-2 text-sm font-medium">
              Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </span>
          </div>
          <button
            onClick={() => router.push('/create')}
            className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors font-medium"
          >
            Continue to Create
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}