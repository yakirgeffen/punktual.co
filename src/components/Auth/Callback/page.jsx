'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Spinner } from '@heroui/react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from URL parameters
        const code = searchParams.get('code');
        const error_code = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        if (error_code) {
          throw new Error(error_description || 'Authentication failed');
        }

        if (code) {
          // Exchange the code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            throw error;
          }

          setSuccess(true);
          
          // Redirect to the create page after successful auth
          setTimeout(() => {
            router.push('/create');
          }, 2000);
        } else {
          // No code parameter, redirect to home
          router.push('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError(error.message);
        
        // Redirect to home after error
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, router, supabase.auth]);

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
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Punktual!
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been set up successfully. Redirecting you to create your first calendar event...
          </p>
          <div className="flex items-center justify-center">
            <Spinner size="sm" color="primary" />
            <span className="ml-2 text-sm text-gray-500">Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}