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
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Helper function to create a timeout promise
  const createTimeoutPromise = (ms: number) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    });
  };

  const createUserProfile = useCallback(async (user: SupabaseUser): Promise<void> => {
    console.log('👤 Creating user profile for:', user.email);
    
    try {
      // Check if profile already exists (with timeout)
      console.log('🔍 Checking if profile exists...');
      const { data: existingProfile, error: selectError } = await Promise.race([
        supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single(),
        createTimeoutPromise(5000)
      ]) as any;

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('❌ Error checking existing profile:', selectError);
        return;
      }

      if (existingProfile) {
        console.log('✅ Profile already exists, skipping creation');
        return;
      }

      console.log('📝 Creating new profile...');
      // Create new profile (with timeout)
      const { error: insertError } = await Promise.race([
        supabase
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
          ]),
        createTimeoutPromise(5000)
      ]) as any;

      if (insertError && insertError.code !== '23505') {
        console.error('❌ Error creating user profile:', insertError);
      } else {
        console.log('✅ User profile created successfully');
      }
    } catch (error) {
      console.error('❌ Error in createUserProfile:', error);
    }
  }, [supabase]);

  // Initialize auth state with timeout handling
  const initializeAuth = useCallback(async (): Promise<void> => {
    console.log('🚀 Starting auth initialization...');
    
    try {
      // Get current session with timeout
      console.log('🔍 Getting current session...');
      
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        createTimeoutPromise(10000) // 10 second timeout
      ]).catch((error) => {
        console.warn('⚠️ Session timeout or error:', error);
        return { data: { session: null }, error: null };
      });

      const { data: { session }, error: sessionError } = sessionResult as any;
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        setUser(null);
        setSession(null);
      } else if (session) {
        console.log('✅ Found existing session for:', session.user.email);
        setUser(session.user);
        setSession(session);
        
        // Ensure user profile exists (but don't block on it)
        console.log('👤 Ensuring user profile exists...');
        createUserProfile(session.user).catch(error => {
          console.warn('⚠️ Profile creation failed but continuing:', error);
        });
      } else {
        console.log('ℹ️ No existing session found');
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      setUser(null);
      setSession(null);
    } finally {
      console.log('✅ Setting loading=false and initialized=true');
      setLoading(false);
      setInitialized(true);
      console.log('🎉 Auth initialization complete!');
    }
  }, [supabase.auth, createUserProfile]);

  useEffect(() => {
    console.log('🔄 useEffect: Setting up auth...');
    
    // Initialize auth state
    initializeAuth();

    // Set up auth state listener
    console.log('👂 Setting up auth state listener...');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email || 'no user');
      
      setLoading(true);
      
      try {
        if (session?.user) {
          console.log('✅ Session user found, updating state...');
          setUser(session.user);
          setSession(session);
          
          // Create user profile if it doesn't exist (for new signups)
          if ((event as string) === 'SIGNED_UP' || (event as string) === 'SIGNED_IN') {
            console.log('👤 New signup/signin, creating profile...');
            createUserProfile(session.user).catch(error => {
              console.warn('⚠️ Profile creation failed:', error);
            });
          }
        } else {
          console.log('❌ No session user, clearing state...');
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('❌ Error handling auth state change:', error);
      } finally {
        setLoading(false);
        console.log('✅ Auth state change processing complete');
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [initializeAuth, createUserProfile, supabase.auth]);

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

  // Debug current state
  useEffect(() => {
    console.log('📊 Auth State Update:', {
      user: user?.email || 'none',
      loading,
      initialized,
      timestamp: new Date().toISOString()
    });
  }, [user, loading, initialized]);

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