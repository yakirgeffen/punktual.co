'use client';

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
  const [loading, setLoading] = useState<boolean>(true); // Start with loading true
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      console.log('🔄 Initializing auth...');
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session error:', error);
        setUser(null);
        setSession(null);
      } else if (session) {
        console.log('✅ Found existing session:', session.user.email);
        setUser(session.user);
        setSession(session);
      } else {
        console.log('ℹ️ No existing session');
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [supabase.auth]);

  useEffect(() => {
    // Initialize auth state on mount
    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state change:', event, session?.user?.email);
      
      setLoading(true);
      
      try {
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          
          // Handle specific events if needed
          if (event === 'SIGNED_IN') {
            console.log('✅ User signed in:', session.user.email);
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 User signed out');
          }
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('❌ Error handling auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [initializeAuth, supabase.auth]);

  const signUp = async (email: string, password: string, options: SignUpOptions = {}): Promise<AuthResponse> => {
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
    try {
      console.log('🔄 Starting Google OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
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
      
      console.log('✅ Google OAuth initiated, redirecting...');
      
      // OAuth will redirect, so we return null
      return { user: null, session: null };
    } catch (error) {
      console.error('❌ Error in signInWithGoogle:', error);
      throw error;
    }
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
      const { error: authError } = await supabase.auth.updateUser({
        data: updates
      });

      if (authError) throw authError;
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