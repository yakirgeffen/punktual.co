'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar, User, LogOut, Settings, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  DropdownSection,
  Button,
  useDisclosure
} from '@heroui/react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/Auth/AuthModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Navbar() {
  const { user, signOut, loading, initialized } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [authMode, setAuthMode] = useState('login');

  // DEBUG: Log auth state
  useEffect(() => {
    console.log('🔍 Navbar Auth State:', {
      loading,
      initialized,
      user: user?.email || null,
      timestamp: new Date().toISOString()
    });
  }, [loading, initialized, user]);

  // SUPABASE TEST - Add this right after the above useEffect
  useEffect(() => {
    const testSupabase = async () => {
      console.log('🧪 Testing Supabase connection...');
      try {
        const supabase = createClientComponentClient();
        console.log('📦 Supabase client created:', supabase);
        
        const { data, error } = await supabase.auth.getSession();
        console.log('🔐 Session test result:', { 
          hasSession: !!data?.session,
          sessionUser: data?.session?.user?.email || 'no user',
          error: error?.message || 'no error' 
        });
      } catch (err) {
        console.error('❌ Supabase test failed:', err);
      }
    };
    testSupabase();
  }, []); // This runs only once on mount

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    onOpen();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Memoized user display name
  const userDisplayName = useMemo(() => {
    if (!user) return '';
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'User';
  }, [user]);

  // Memoized first name with proper truncation
  const userFirstName = useMemo(() => {
    if (!user) return '';
    
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
    
    if (fullName) {
      // Extract first name (handles "J.R. Smith" → "J.R.")
      const firstName = fullName.trim().split(' ')[0];
      // Truncate if longer than 12 characters
      return firstName.length > 12 ? firstName.substring(0, 12) + '...' : firstName;
    } else if (user.email) {
      // Fallback to first part of email before @
      const emailName = user.email.split('@')[0];
      return emailName.length > 12 ? emailName.substring(0, 12) + '...' : emailName;
    }
    
    return 'User'; // Ultimate fallback
  }, [user]);

  // DEBUG: Add visual indicator of auth state
  const debugInfo = (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded text-xs z-50">
      Loading: {String(loading)} | Initialized: {String(initialized)} | User: {user?.email || 'null'}
    </div>
  );

  return (
    <>
      {/* DEBUG INFO - Remove this in production */}
      {process.env.NODE_ENV === 'development' && debugInfo}
      
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <Image 
                src="/PUNKTUAL-vertical.png" 
                alt="Punktual" 
                width={1024}
                height={256}
                className="h-12 w-auto"
              />
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#problem" className="text-gray-600 hover:text-emerald-500 transition-colors">Why Punktual</a>
              <a href="#pricing" className="text-gray-600 hover:text-emerald-500 transition-colors">Pricing</a>
              <a href="#docs" className="text-gray-600 hover:text-emerald-500 transition-colors">Docs</a>
            </nav>
            
            <div className="flex items-center space-x-3">
              {loading ? (
                // Loading state
                <div className="flex items-center space-x-3">
                  <div className="w-20 h-9 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-24 h-9 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : user ? (
                // Authenticated state
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/create"
                    className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-400 transition-colors font-medium min-h-[42px] flex items-center justify-center"
                  >
                    Create Event
                  </Link>
                  
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button
                        variant="ghost"
                        className="px-4 py-2.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-medium h-auto min-h-[42px] data-[hover=true]:bg-emerald-50 flex items-center gap-2 max-w-32"
                        aria-label={`User menu for ${userFirstName}`}
                      >
                        <User className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          {loading ? 'Loading...' : userFirstName}
                        </span>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="User menu">
                      <DropdownSection title="Account" showDivider>
                        <DropdownItem
                          key="profile"
                          description={user.email}
                          startContent={<User className="w-4 h-4" />}
                        >
                          {userDisplayName}
                        </DropdownItem>
                      </DropdownSection>
                      
                      <DropdownSection title="Manage" showDivider>
                        <DropdownItem
                          key="dashboard"
                          startContent={<Calendar className="w-4 h-4" />}
                          href="/dashboard"
                        >
                          My Events
                        </DropdownItem>
                        <DropdownItem
                          key="settings"
                          startContent={<Settings className="w-4 h-4" />}
                          href="/settings"
                        >
                          Settings
                        </DropdownItem>
                        <DropdownItem
                          key="billing"
                          startContent={<CreditCard className="w-4 h-4" />}
                          href="/billing"
                        >
                          Billing
                        </DropdownItem>
                      </DropdownSection>
                      
                      <DropdownSection>
                        <DropdownItem
                          key="logout"
                          color="danger"
                          startContent={<LogOut className="w-4 h-4" />}
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </DropdownItem>
                      </DropdownSection>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              ) : (
                // Unauthenticated state
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-600 hover:text-emerald-500 transition-colors"
                  >
                    Sign In
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => handleAuthClick('signup')}
                    className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-400 transition-colors font-medium"
                  >
                    Start Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isOpen} 
        onClose={onClose} 
        defaultTab={authMode}
      />
    </>
  );
}