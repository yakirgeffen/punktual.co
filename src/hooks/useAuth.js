'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const createUserProfile = useCallback(async (user) => {
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

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      console.log('Initializing auth...');
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setUser(null);
        setSession(null);
      } else if (session) {
        console.log('Found existing session:', session.user.email);
        setUser(session.user);
        setSession(session);
        
        // Ensure user profile exists
        await createUserProfile(session.user);
      } else {
        console.log('No existing session found');
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
      console.log('Auth initialization complete');
    }
  }, [supabase.auth, createUserProfile]);

  useEffect(() => {
    // Initialize auth state
    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      setLoading(true);
      
      try {
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          
          // Create user profile if it doesn't exist (for new signups)
          if (event === 'SIGNED_UP' || event === 'SIGNED_IN') {
            await createUserProfile(session.user);
          }
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [initializeAuth, createUserProfile, supabase.auth]);

  const signUp = async (email, password, options = {}) => {
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
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
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
    
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
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

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
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

  const getUserProfile = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  };

  const value = {
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}