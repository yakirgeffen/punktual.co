'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Spinner } from '@heroui/react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');
        
        console.log('🔍 Auth callback params:', {
          hasCode: !!code,
          error: error,
          error_description: error_description
        });
        
        // Handle OAuth errors
        if (error) {
          console.error('❌ OAuth error:', error, error_description);
          // You might want to show an error message to the user
          router.push('/?error=auth_failed');
          return;
        }
        
        // Check if we have a code
        if (!code) {
          console.log('⚠️ No authorization code found');
          router.push('/');
          return;
        }
        
        // Exchange the code for a session
        console.log('🔄 Exchanging code for session...');
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (sessionError) {
          console.error('❌ Session exchange error:', sessionError);
          router.push('/?error=session_failed');
          return;
        }
        
        console.log('✅ Session established:', data.session?.user?.email);
        
        // Get the intended redirect URL from localStorage (if you stored it)
        const redirectTo = localStorage.getItem('authRedirect') || '/create';
        localStorage.removeItem('authRedirect'); // Clean up
        
        // Small delay to ensure session is properly set
        setTimeout(() => {
          console.log('🚀 Redirecting to:', redirectTo);
          router.push(redirectTo);
        }, 100);
        
      } catch (error) {
        console.error('❌ Unexpected error in auth callback:', error);
        router.push('/?error=unexpected');
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, router, supabase.auth]);

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