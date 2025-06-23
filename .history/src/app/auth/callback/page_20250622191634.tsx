'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@heroui/react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    console.log('🟡 Callback effect - user:', !!user);
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error_code = urlParams.get('error');
    
    console.log('🟡 URL params - code:', !!code, 'error:', error_code);
    
    if (error_code) {
      console.log('❌ OAuth error, redirecting home');
      router.push('/');
      return;
    }
    
    if (code && user) {
      console.log('✅ Code and user present, redirecting to create');
      router.push('/create');
      return;
    }
    
    if (!code) {
      console.log('❌ No code, redirecting home');
      router.push('/');
      return;
    }
    
    console.log('⏳ Code present but no user yet, waiting...');
    
  }, [user, router]);

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