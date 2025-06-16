'use client';

import { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody,
  Button,
  Input,
  Divider,
  Link,
  Spinner
} from '@heroui/react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const { signIn, signUp, signInWithGoogle } = useAuth();

  // Fix: Update activeTab when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await signIn(formData.email, formData.password);
        toast.success('Welcome back!');
        onClose();
      } else {
        // Validation for signup
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }

        await signUp(formData.email, formData.password, {
          data: { full_name: formData.fullName }
        });
        toast.success('Check your email to confirm your account!');
        onClose();
      }
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error(error.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      placement="center"
      backdrop="blur"
      size="sm"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-gray-600">
            {activeTab === 'login' 
              ? 'Sign in to your Punktual account' 
              : 'Get started with Punktual'}
          </p>
        </ModalHeader>
        
        <ModalBody className="pb-6">
          {/* Tab Switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Google Auth Button */}
          <Button
            variant="bordered"
            size="lg"
            startContent={
              loading ? <Spinner size="sm" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )
            }
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full"
          >
            Continue with Google
          </Button>

          <div className="flex items-center gap-4 my-4">
            <Divider className="flex-1" />
            <span className="text-sm text-gray-500">or</span>
            <Divider className="flex-1" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {activeTab === 'signup' && (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                startContent={<User className="w-4 h-4 text-gray-400" />}
                required
              />
            )}

            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              startContent={<Mail className="w-4 h-4 text-gray-400" />}
              required
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className="focus:outline-none"
                >
                  {isVisible ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
              required
            />

            {activeTab === 'signup' && (
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                startContent={<Lock className="w-4 h-4 text-gray-400" />}
                type={isVisible ? "text" : "password"}
                required
              />
            )}

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full bg-emerald-500 hover:bg-emerald-400"
              disabled={loading}
              startContent={loading ? <Spinner size="sm" /> : null}
            >
              {loading ? 'Please wait...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-4">
            {activeTab === 'login' ? (
              <div className="space-y-2">
                <Link href="#" size="sm" className="text-emerald-600">
                  Forgot your password?
                </Link>
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => switchTab('signup')}
                    className="text-emerald-600 hover:text-emerald-500 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => switchTab('login')}
                  className="text-emerald-600 hover:text-emerald-500 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {activeTab === 'signup' && (
            <p className="text-xs text-gray-500 text-center mt-4">
              By creating an account, you agree to our{' '}
              <Link href="/terms" size="sm">Terms of Service</Link>{' '}
              and{' '}
              <Link href="/privacy" size="sm">Privacy Policy</Link>
            </p>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}