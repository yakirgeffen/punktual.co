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
  // Initialize auth state ONCE
  const initializeAuth = useCallback(async (): Promise<void> => {
    if (initializingRef.current) return; // Prevent multiple initializations
    initializingRef.current = true;
    
    try {
      console.log('Initializing auth...');
      console.log('🟡 Step 1: About to call getSession...');
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🟡 Step 2: getSession completed', { hasSession: !!session, hasError: !!sessionError });
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setUser(null);
        setSession(null);
      } else if (session) {
        console.log('🟡 Step 3: Found session, setting user...');
        setUser(session.user);
        setSession(session);
        
        console.log('🟡 Step 4: About to create user profile...');
        // Ensure user profile exists
        await createUserProfile(session.user);
        console.log('🟡 Step 5: User profile completed');
      } else {
        console.log('🟡 Step 3: No existing session found');
        setUser(null);
        setSession(null);
      }
      
      console.log('🟡 Step 6: Try block completed');
    } catch (error) {
      console.error('🔴 Error initializing auth:', error);
      setUser(null);
      setSession(null);
    } finally {
      console.log('🟡 Step 7: Finally block executing...');
      setLoading(false);
      setInitialized(true);
      console.log('✅ Auth initialization complete');
      console.log('Auth initialization complete - final state:', { user: !!session?.user, hasSession: !!session });
    }
  }, [supabase.auth, createUserProfile]);

  useEffect(() => {
    // Only initialize once
    if (!initialized && !initializingRef.current) {
      initializeAuth();
    }

    // Set up auth state listener ONCE
    if (!subscriptionRef.current) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        // REMOVED: setLoading(true) - Don't show loading on every auth change
        
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
        // REMOVED: finally block with setLoading(false)
      });
      
      subscriptionRef.current = subscription;
    }

    return () => {
      // Cleanup subscription on unmount
      if (subscriptionRef.current) {
        console.log('Cleaning up auth subscription');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [initializeAuth, createUserProfile, supabase.auth, initialized]);

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