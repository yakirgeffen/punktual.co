'use client';

import { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';
import { useDisclosure } from '@heroui/react';
import AuthModal from '@/components/Auth/AuthModal';

export default function AuthPrompt() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [authMode, setAuthMode] = useState('signup');

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    onOpen();
  };

  return (
    <>
      <div className="card border-2 border-dashed border-gray-300 bg-gray-50">
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-emerald-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sign in to see your recent events
          </h3>
          
          <p className="text-gray-600 text-sm mb-6">
            Keep track of your calendar buttons and reuse them easily
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => handleAuthClick('signup')}
              className="inline-flex items-center justify-center px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-400 transition-colors"
            >
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            
            <button
              onClick={() => handleAuthClick('login')}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isOpen} 
        onClose={onClose} 
        defaultTab={authMode}
      />
    </>
  );
}