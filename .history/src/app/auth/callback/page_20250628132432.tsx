// Updated src/app/auth/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Spinner } from '@heroui/react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error || !code) {
        router.replace('/?error=auth_failed');
        return;
      }

      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        router.replace('/?error=session_failed');
        return;
      }

      const redirectTo = localStorage.getItem('authRedirect') || '/create';
      localStorage.removeItem('authRedirect');

      setLoading(false);
      router.replace(redirectTo);
    };

    handleCallback();
  }, [searchParams, router, supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Completing sign-in...
          </h2>
        </div>
      </div>
    );
  }

  return null;
}
