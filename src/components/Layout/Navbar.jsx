'use client';

import { useState } from 'react';
import { Calendar, User, LogOut, Settings, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  DropdownSection,
  Avatar,
  Button,
  useDisclosure
} from '@heroui/react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/Auth/AuthModal';

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [authMode, setAuthMode] = useState('login');

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

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'User';
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || null;
  };

  return (
    <>
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
              <a href="#problem" className="text-gray-600 hover:text-emerald-500 transition-colors">Why EasyCal</a>
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
                    className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-400 transition-colors font-medium"
                  >
                    Create Event
                  </Link>
                  
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button
                        variant="ghost"
                        className="p-0 data-[hover=true]:bg-transparent"
                      >
                        <Avatar
                          src={getUserAvatar()}
                          name={getUserDisplayName()}
                          size="sm"
                          className="cursor-pointer"
                        />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="User menu">
                      <DropdownSection title="Account" showDivider>
                        <DropdownItem
                          key="profile"
                          description={user.email}
                          startContent={<User className="w-4 h-4" />}
                        >
                          {getUserDisplayName()}
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