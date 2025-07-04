'use client';

import { useState, useEffect, createContext, useContext, useCallback, ReactNode, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { Subscription, AuthChangeEvent } from '@supabase/supabase-js';
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
  
  // Prevent multiple initializations
  const initializingRef = useRef<boolean>(false);
  const subscriptionRef = useRef<Subscription | null>(null);

  const createUserProfile = useCallback(async (user: SupabaseUser): Promise<void> => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) return;

      // Create new profile
      const { error } = await supabase
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

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  }, [supabase]);

  // Initialize auth state ONCE
  const initializeAuth = useCallback(async (): Promise<void> => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    
    try {
      console.log('Initializing auth...');
      
      // Try getSession with timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('getSession timeout')), 3000)
      );
      
      try {
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise, 
          timeoutPromise
        ]);
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setUser(null);
          setSession(null);
        } else if (session) {
          console.log('Found existing session:', session.user.email);
          setUser(session.user);
          setSession(session);
          await createUserProfile(session.user);
        } else {
          console.log('No existing session found');
          setUser(null);
          setSession(null);
        }
      } catch (timeoutError: unknown) {
        console.log('getSession timed out, will rely on auth listener');
        setUser(null);
        setSession(null);
      }
      
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
      setInitialized(true);
      console.log('✅ Auth initialization complete');
    }
  }, [supabase.auth, createUserProfile]);

  // Effect 1: Initialize auth once
  useEffect(() => {
    if (!initialized && !initializingRef.current) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  // Effect 2: Set up auth listener once and keep it alive
  useEffect(() => {
    if (!subscriptionRef.current) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        try {
          if (session?.user) {
            setUser(session.user);
            setSession(session);
            
            // Create user profile if it doesn't exist (for new signups and sign-ins)
            if (event === 'SIGNED_IN') {
              await createUserProfile(session.user);
            }
          } else {
            setUser(null);
            setSession(null);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        }
      });
      
      subscriptionRef.current = subscription;
    }

    // Only cleanup on component unmount
    return () => {
      if (subscriptionRef.current) {
        console.log('Cleaning up auth subscription');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps intentional - runs once, cleans up only on unmount

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