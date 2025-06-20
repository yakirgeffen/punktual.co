'use client';

import { useState, useEffect, createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
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
  
  // ✅ Memoize Supabase client to prevent infinite re-renders
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);
  const router = useRouter();

  // Test function to verify Supabase client is working
  const testSupabaseConnection = useCallback(async () => {
    try {
      
      // Try a simple query to test the connection
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      return { success: !error, error };
    } catch (error) {
      console.error('Test query failed:', error);
      return { success: false, error };
    }
  }, [supabase]);

  const createUserProfile = useCallback(async (user: SupabaseUser): Promise<void> => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: selectError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (selectError) {
        console.error('Error checking existing profile:', selectError);
        // If it's a "not found" error, that's expected for new users
        if (selectError.code !== 'PGRST116') {
          return; // Don't proceed if there's a real error
        }
      }

      if (existingProfile) {
        return;
      }

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
        console.error('Error creating user profile:', insertError);
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  }, [supabase]);

  // Initialize auth state
  const initializeAuth = useCallback(async (): Promise<void> => {
    try {
      
      // Test Supabase connection first
      await testSupabaseConnection();
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setUser(null);
        setSession(null);
      } else if (session) {
        setUser(session.user);
        setSession(session);
        
        // Ensure user profile exists
        await createUserProfile(session.user);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [supabase.auth, testSupabaseConnection, createUserProfile]);

  useEffect(() => {
    let mounted = true;

    // Initialize auth state once
    const initialize = async () => {
      if (initialized || !mounted) return;

      try {
        // Test Supabase connection first
        await testSupabaseConnection();
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError) {
          setUser(null);
          setSession(null);
        } else if (session) {
          setUser(session.user);
          setSession(session);
          
          // Ensure user profile exists
          await createUserProfile(session.user);
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initialize();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setLoading(true);
      
      try {
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          
          // Create user profile if it doesn't exist (for new signups)
          if (String(event) === 'SIGNED_UP' || String(event) === 'SIGNED_IN') {
            await createUserProfile(session.user);
          }
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, testSupabaseConnection, createUserProfile, initialized]);

  const signUp = async (email: string, password: string, options: SignUpOptions = {}): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/create`,
          data: options.data || {}
        }
      });
      
      if (error) throw error;
      return { user: data.user, session: data.session };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { user: data.user, session: data.session };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/create`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) throw error;
    return { user: null, session: null }; // OAuth redirects, so no immediate user/session
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    setLoading(true);
    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: updates
      });

      if (authError) throw authError;

      // Update user profile table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
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
