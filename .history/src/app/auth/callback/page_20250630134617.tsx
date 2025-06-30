'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CheckCircle } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    console.log('🔄 OAuth Callback: Starting callback with forced session refresh...');
    
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

        console.log('🔄 Step 1: Force a session refresh to pick up OAuth session...');
        
        // Force refresh the session - this might pick up the OAuth session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        console.log('🔍 Session check result:', {
          hasSession: !!sessionData?.session,
          hasUser: !!sessionData?.session?.user,
          userEmail: sessionData?.session?.user?.email,
          error: sessionError?.message
        });
        console.log('🔍 Raw session data:', sessionData);
        console.log('🔍 Session error:', sessionError);

        if (sessionError) {
          console.error('❌ Error fetching session:', sessionError.message);
          throw sessionError;
        }

        if (sessionData?.session?.user) {
          console.log('✅ Found OAuth session! User:', sessionData.session.user.email);
          
          // Trigger a manual auth state change to force your auth hook to update
          console.log('🔄 Step 2: Manually triggering auth state change...');
          
          // Post a message to trigger auth refresh
          window.postMessage({ type: 'SUPABASE_AUTH_REFRESH' }, window.location.origin);
          
          // Small delay then redirect
          setTimeout(() => {
            console.log('🚀 Step 3: Redirecting to /create...');
            router.replace('/create');
          }, 500);
          
        } else {
          console.log('⚠️ No session found after refresh - trying exchangeCodeForSession...');
          
          // Fallback to the normal flow
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            throw error;
          }
          
          if (data?.session) {
            console.log('✅ Session created via exchangeCodeForSession');
            setTimeout(() => {
              router.replace('/create');
            }, 500);
          } else {
            throw new Error('No session created');
          }
        }

      } catch (err: unknown) {
        console.error('❌ OAuth Callback: Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        router.replace('/?auth_error=' + encodeURIComponent(errorMessage));
      }
    };

    handleAuthCallback();
  }, [searchParams, router, supabase.auth]);

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
          Processing Google sign-in...
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Checking for OAuth session and refreshing auth state
        </p>
        <div className="flex items-center justify-center mt-6">
          <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-500 font-medium">Setting up your account...</span>
        </div>
      </div>
    </div>
  );
}