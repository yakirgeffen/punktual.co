/**
 * useUserPlan Hook
 *
 * Fetches and caches the user's plan (free vs pro)
 * Uses existing useAuth hook to avoid duplication
 *
 * Usage:
 *   const { isPro, isFree, plan, loading } = useUserPlan();
 *   if (isPro) { // Show analytics }
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface UseUserPlanReturn {
  plan: 'free' | 'pro' | null;
  isPro: boolean;
  isFree: boolean;
  loading: boolean;
  error: Error | null;
}

export function useUserPlan(): UseUserPlanReturn {
  const { user, getUserProfile, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<'free' | 'pro' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      // If auth is still loading, wait
      if (authLoading) {
        return;
      }

      // If no user, set to null (not logged in)
      if (!user) {
        setPlan(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const profile = await getUserProfile();

        if (profile && profile.plan) {
          setPlan(profile.plan as 'free' | 'pro');
        } else {
          // Default to free if profile doesn't exist or plan is undefined
          setPlan('free');
        }
      } catch (err) {
        console.error('Error fetching user plan:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user plan'));
        // Default to free on error (graceful degradation)
        setPlan('free');
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [user, getUserProfile, authLoading]);

  return {
    plan,
    isPro: plan === 'pro',
    isFree: plan === 'free' || plan === null, // Treat null as free (not logged in)
    loading,
    error
  };
}
