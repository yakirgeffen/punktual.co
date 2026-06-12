//src/hooks/useAuth.tsx

'use client';

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { 
  SupabaseUser, 
  SupabaseSession, 
  AuthContextType, 
  AuthResponse, 
  SignUpOptions, 
  UserProfile 
} from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const createUserProfile = useCallback(async (user: SupabaseUser): Promise<void> => {
    console.log('👤 Creating user profile for:', user.email);
    
    try {
      // Check if profile already exists
      console.log('🔍 Checking if profile exists...');
      const { data: existingProfile, error: selectError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is expected for new users
        console.error('❌ Error checking existing profile:', selectError);
        return;
      }

      if (existingProfile) {
        console.log('✅ Profile already exists, skipping creation');
        return;
      }

      console.log('📝 Creating new profile...');
      // Create new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            plan: 'free',
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
        console.error('❌ Error creating user profile:', insertError);
      } else {
        console.log('✅ User profile created successfully');
      }
    } catch (error) {
      console.error('❌ Error in createUserProfile:', error);
    }
  }, [supabase]);

  // Hydrate auth state once on mount, then track changes via the listener.
  //
  // History: a previous "fix" skipped getSession() entirely and relied on the
  // auth state listener alone — with the result that a returning user's valid
  // session cookie was never read into client state, so every page load showed
  // logged-out (QA 2026-06-13, bug #1). getSession() against the shared
  // @supabase/ssr browser client reads the cookie from storage; the old
  // timeout problem belonged to the previous, now-removed client setup.
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (cancelled) return;
        setUser(existingSession?.user ?? null);
        setSession(existingSession ?? null);
      } catch (error) {
        console.error('❌ Error hydrating auth session:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (cancelled) return;

      setUser(newSession?.user ?? null);
      setSession(newSession ?? null);
      setLoading(false);
      setInitialized(true);

      if (newSession?.user && (event === 'SIGNED_IN' || (event as string) === 'SIGNED_UP')) {
        try {
          await createUserProfile(newSession.user);
          if ((event as string) === 'SIGNED_UP' && newSession.user.app_metadata?.provider === 'google') {
            const { trackSignUp } = await import('@/lib/analytics');
            trackSignUp('google');
          }
        } catch (error) {
          console.error('❌ Error in post-sign-in handling:', error);
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // Mount-once by design: `supabase` is a module-level singleton and
    // `createUserProfile` only closes over it. Re-running this effect was the
    // re-init loop the QA report measured at dozens of cycles per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email: string, password: string, options: SignUpOptions = {}): Promise<AuthResponse> => {
    console.log('📝 Signing up user:', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: options.data || {}
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        throw error;
      }

      console.log('✅ Signup successful');

      // Track signup event
      if (typeof window !== 'undefined') {
        const { trackSignUp } = await import('@/lib/analytics');
        trackSignUp('email');
      }

      return { user: data.user, session: data.session };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    console.log('🔐 Signing in user:', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ Signin error:', error);
        throw error;
      }
      
      console.log('✅ Signin successful');
      return { user: data.user, session: data.session };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    console.log('🔗 Starting Google OAuth...');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error('❌ Google OAuth error:', error);
      throw error;
    }

    console.log('✅ Google OAuth redirect initiated');
    return { user: null, session: null };
  };

  const signOut = async (): Promise<void> => {
    console.log('👋 Signing out user...');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Signout error:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      
      console.log('✅ Signout successful, redirecting to home');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    console.log('🔄 Resetting password for:', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    
    if (error) {
      console.error('❌ Password reset error:', error);
      throw error;
    }
    
    console.log('✅ Password reset email sent');
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    console.log('📝 Updating profile for:', user.email);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: updates
      });

      if (authError) {
        console.error('❌ Auth update error:', authError);
        throw authError;
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        throw profileError;
      }
      
      console.log('✅ Profile updated successfully');
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;

    console.log('👤 Getting profile for:', user.email);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
    
    console.log('✅ Profile retrieved successfully');
    return data;
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    getUserProfile
  };



  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}