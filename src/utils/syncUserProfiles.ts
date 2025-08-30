/**
 * Utility to sync auth.users with user_profiles table
 * This addresses the issue where auth.users has more users than user_profiles
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { logger } from '@/lib/logger';

// These interfaces would be used when implementing server-side sync
// interface AuthUser {
//   id: string;
//   email: string;
//   user_metadata: {
//     full_name?: string;
//     name?: string;
//     avatar_url?: string;
//   };
//   created_at: string;
// }

// interface UserProfile {
//   id: string;
//   user_id: string;
//   email: string;
//   full_name: string;
//   avatar_url: string;
//   plan: string;
//   created_at: string;
// }

export async function syncUserProfiles(): Promise<{
  synced: number;
  errors: string[];
}> {
  const supabase = createClientComponentClient();
  const synced = 0;

  try {
    logger.info('Starting user profile sync', 'SYSTEM');

    // Get all existing user profiles
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id');

    if (profilesError) {
      throw new Error(`Failed to fetch existing profiles: ${profilesError.message}`);
    }

    const existingUserIds = new Set(existingProfiles?.map(p => p.user_id) || []);
    logger.info(`Found ${existingUserIds.size} existing user profiles`, 'SYSTEM');

    // We can't directly access auth.users from client-side
    // This would need to be run from a server-side function or admin context
    // For now, we'll improve the createUserProfile function to be more robust

    return {
      synced,
      errors: ['This function needs to be run from server-side or admin context']
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Sync user profiles error', 'SYSTEM', { error: errorMessage });
    return {
      synced: 0,
      errors: [errorMessage]
    };
  }
}

/**
 * Enhanced createUserProfile that handles edge cases better
 */
export async function createUserProfileRobust(
  userId: string, 
  email: string, 
  metadata: Record<string, unknown> = {}
): Promise<boolean> {
  const supabase = createClientComponentClient();

  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      logger.info(`User profile already exists for user ${userId}`, 'SYSTEM');
      return true;
    }

    // Create new profile with better error handling
    const profileData = {
      user_id: userId,
      email: email,
      full_name: metadata?.full_name || metadata?.name || '',
      avatar_url: metadata?.avatar_url || '',
      plan: 'free',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_profiles')
      .insert([profileData]);

    if (error) {
      logger.error('Failed to create user profile', 'SYSTEM', { 
        userId, 
        email, 
        error: error.message 
      });
      return false;
    }

    logger.info(`Successfully created user profile for ${email}`, 'SYSTEM');
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Create user profile robust error', 'SYSTEM', { 
      userId, 
      email, 
      error: errorMessage 
    });
    return false;
  }
}