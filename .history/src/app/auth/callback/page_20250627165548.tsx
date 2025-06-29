'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Spinner } from '@heroui/react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error_code = searchParams.get('error');
      
      console.log('🟡 URL params - code:', !!code, 'error:', error_code);
      
      if (error_code) {
        console.log('❌ OAuth error, redirecting home');
        router.push('/');
        return;
      }
      
      if (!code) {
        console.log('❌ No code, redirecting home');
        router.push('/');
        return;
      }
      
      try {
        console.log('⏳ Processing OAuth code...');
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) throw error;
        
        console.log('✅ Auth successful, redirecting to create');
        router.push('/create');
      } catch (error) {
        console.error('❌ Auth error:', error);
        router.push('/');
      }
    };

    handleCallback();
  }, [searchParams, router, supabase]);

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