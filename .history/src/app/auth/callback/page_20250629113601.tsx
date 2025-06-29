'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    console.log('🔄 OAuth Callback: Starting direct fetch auth callback handling...');
    
    const handleAuthCallback = async () => {
      try {
        // Get the code from URL parameters
        const code = searchParams.get('code');
        const error_code = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        console.log('🔍 OAuth Callback: URL params:', {
          hasCode: !!code,
          hasError: !!error_code,
          error_description
        });

        if (error_code) {
          throw new Error(error_description || 'Authentication failed');
        }

        if (code) {
          console.log('🔄 OAuth Callback: Exchanging code using direct fetch...');
          
          // Use direct fetch instead of Supabase client
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          
          const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=authorization_code`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey!,
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
              auth_code: code,
              code_verifier: '', // Not needed for Google OAuth
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ OAuth Callback: Direct fetch error:', errorData);
            throw new Error(errorData.msg || `HTTP ${response.status}`);
          }

          const sessionData = await response.json();
          console.log('✅ OAuth Callback: Direct fetch session exchange successful');

          // Store the session data (you might want to trigger a custom event here)
          if (sessionData.user) {
            console.log('👤 OAuth Callback: User data received:', sessionData.user.email);
          }

          setSuccess(true);
          
          // Redirect to the create page after successful auth
          console.log('🔄 OAuth Callback: Redirecting to /create in 2 seconds...');
          setTimeout(() => {
            router.push('/create');
          }, 2000);
        } else {
          // No code parameter, redirect to home
          console.log('⚠️ OAuth Callback: No code parameter, redirecting to home');
          router.push('/');
        }
      } catch (error: any) {
        console.error('❌ OAuth Callback: Error:', error);
        setError(error.message || 'Authentication failed');
        
        // Redirect to home after error
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } finally {
        setLoading(false);
        console.log('✅ OAuth Callback: Processing complete');
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Completing sign-in...
          </h2>
          <p className="text-gray-600 text-lg">
            Please wait while we set up your account
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Using direct fetch method...
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
            Authentication Failed
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            {error}
          </p>
          <details className="text-sm text-gray-500 mb-8">
            <summary className="cursor-pointer">Technical Details</summary>
            <p className="mt-2">
              The OAuth callback failed during the direct fetch approach. 
              This suggests the Supabase JavaScript client has specific timeout issues.
            </p>
          </details>
          <button
            onClick={() => router.push('/')}
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
            Your Google account has been connected successfully using direct fetch.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Taking you to create your first calendar event...
          </p>
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-gray-500 font-medium">Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}