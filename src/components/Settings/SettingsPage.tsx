'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, LogOut, Trash2, AlertCircle } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Input, Divider, Spinner } from '@heroui/react';
import { useAuth } from '@/hooks/useAuth';
import { useCheckEventQuota } from '@/hooks/useCheckEventQuota';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import type { UserProfile } from '@/types';

export default function SettingsPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { checkQuota } = useCheckEventQuota();
  const supabase = createClientComponentClient();

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotaStatus, setQuotaStatus] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete account modal
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Load user profile and quota data
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          logger.error('Failed to load profile', 'SETTINGS', { error: profileError.message });
        } else if (profileData) {
          setProfile(profileData);
          setEditedName(profileData.full_name || '');
        }

        // Get quota status
        const quota = await checkQuota();
        if (quota) {
          setQuotaStatus(quota);
        }
      } catch (error) {
        logger.error('Error loading settings data', 'SETTINGS', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, supabase, checkQuota]);

  const handleUpdateName = async () => {
    if (!user || !editedName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);

      // Update Supabase profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editedName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, full_name: editedName.trim() } : null);
      setIsEditing(false);

      logger.info('Profile updated', 'SETTINGS', { userId: user.id });
      toast.success('Profile updated successfully');
    } catch (error) {
      logger.error('Failed to update profile', 'SETTINGS', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    // Verify confirmation text
    if (deleteConfirm !== user.email) {
      toast.error('Please type your email correctly');
      return;
    }

    try {
      setIsDeleting(true);

      // Delete user profile first
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      if (authError) throw authError;

      logger.info('Account deleted', 'SETTINGS', { userId: user.id });
      toast.success('Account deleted successfully');

      // Sign out and redirect
      await signOut();
    } catch (error) {
      logger.error('Failed to delete account', 'SETTINGS', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      logger.info('User signed out', 'SETTINGS', { userId: user?.id });
    } catch (error) {
      logger.error('Sign out error', 'SETTINGS', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to sign out');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner color="success" />
          <p className="text-slate-600 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <CardBody className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-slate-600">You must be signed in to access settings.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const accountCreatedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  const quotaResetDate = quotaStatus?.quotaResetDate
    ? new Date(quotaStatus.quotaResetDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 border border-slate-200">
          <CardHeader className="flex gap-3 border-b border-slate-100">
            <User className="w-5 h-5 text-emerald-500" />
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-slate-900">Profile</p>
              <p className="text-sm text-slate-600">Your personal information</p>
            </div>
          </CardHeader>
          <CardBody className="gap-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <div className="px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-600">{user.email}</p>
              </div>
              <p className="text-xs text-slate-500">Your email address cannot be changed</p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              {isEditing ? (
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    color="primary"
                    onClick={handleUpdateName}
                    isLoading={isSaving}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="bordered"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(profile?.full_name || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 flex-1">
                    <p className="text-slate-600">{profile?.full_name || 'Not set'}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="text-emerald-500"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Account Info Card */}
        <Card className="mb-6 border border-slate-200">
          <CardHeader className="flex gap-3 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-slate-900">Account Info</p>
              <p className="text-sm text-slate-600">Your subscription and usage</p>
            </div>
          </CardHeader>
          <CardBody className="gap-6">
            {/* Plan */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Current Plan</p>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                {profile?.plan === 'pro' ? 'Professional' : 'Free'}
              </div>
            </div>

            {/* Event Quota */}
            {quotaStatus && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Monthly Events</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {quotaStatus.eventsCreated} of {quotaStatus.eventsRemaining === Infinity ? '∞' : 3} used
                    </span>
                    <span className="text-emerald-600 font-medium">
                      {quotaStatus.eventsRemaining === Infinity ? '∞' : quotaStatus.eventsRemaining} remaining
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        quotaStatus.isAtLimit ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${quotaStatus.eventsRemaining === Infinity ? 100 : Math.min(100, (quotaStatus.eventsCreated / 3) * 100)}%`
                      }}
                    />
                  </div>
                  {profile?.plan === 'free' && (
                    <p className="text-xs text-slate-500">
                      Quota resets on {quotaResetDate}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Account Created */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Account Created</p>
              <p className="text-slate-600">{accountCreatedDate}</p>
            </div>
          </CardBody>
        </Card>

        {/* Danger Zone Card */}
        <Card className="border border-red-200 bg-red-50/30">
          <CardHeader className="flex gap-3 border-b border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-slate-900">Danger Zone</p>
              <p className="text-sm text-slate-600">Irreversible actions</p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="space-y-3">
              <Button
                variant="bordered"
                color="danger"
                startContent={<LogOut className="w-4 h-4" />}
                onClick={handleSignOut}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Sign Out
              </Button>

              <Divider className="bg-red-200" />

              <div>
                <p className="text-sm text-slate-700 mb-3">
                  Deleting your account will permanently remove all your data and cannot be undone.
                </p>
                <Button
                  variant="bordered"
                  color="danger"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onClick={onDeleteOpen}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Delete Account Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isDismissable={false}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Delete Account</ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">⚠️ This action cannot be undone</p>
              </div>
              <p className="text-sm text-slate-600">
                To confirm deletion, please type your email address below:
              </p>
              <Input
                placeholder={user?.email}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                type="email"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onClick={onDeleteClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
              disabled={deleteConfirm !== user?.email}
            >
              Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
