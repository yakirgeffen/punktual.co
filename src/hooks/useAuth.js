'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    getProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      // if (session) {
      //   setUser(session.user);
      //   setSession(session);
        
      //   // Create user profile if it doesn't exist (for new signups)
      //   if (event === 'SIGNED_UP' || event === 'SIGNED_IN') {
      //     await createUserProfile(session.user);
      //   }
      // } else {
      //   setUser(null);
      //   setSession(null);
      // }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const { data: { user }, data: { session } } = await supabase.auth.getUser();
      setUser(user);
      setSession(session);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createUserProfile(user) {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)  // Correct: query by user_id
        .single();

      if (existingProfile) return;

      // Create new profile
      const { error } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: user.id,  // Correct: insert user_id
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            plan: 'free',  // Correct: your table uses 'plan', not 'subscription_plan'
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error creating user profile:', error);
        alert(JSON.stringify(error, null, 2)); // This will show the full error
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  }

  const signUp = async (email, password, options = {}) => {
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
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push('/');
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');

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
      .eq('user_id', user.id);  // Correct: query by user_id

    if (profileError) throw profileError;
  };

  const getUserProfile = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)  // Correct: query by user_id
      .single();

    if (error) throw error;
    return data;
  };

  const value = {
    user,
    session,
    loading,
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