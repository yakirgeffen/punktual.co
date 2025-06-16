'use client';

import { useState } from 'react';
import { Calendar, Zap, ArrowRight, Shield, Clock } from 'lucide-react';
import { Button, useDisclosure } from '@heroui/react';
import AuthModal from './AuthModal';

/**
 * AuthRequired - Enhanced component with optimized mobile experience
 */
export default function AuthRequired({ 
  redirectTo, 
  title = "Almost there!",
  subtitle = "Create an account to start building calendar buttons that work everywhere."
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [authMode, setAuthMode] = useState('signup');

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    onOpen();
  };

  // Mobile-optimized benefits (shorter text)
  const benefits = [
    {
      icon: Calendar,
      title: "5 free events/month",
      description: "Perfect for getting started",
      mobileTitle: "5 Free Events"
    },
    {
      icon: Zap,
      title: "All calendar platforms",
      description: "Google, Apple, Outlook, Office 365, Yahoo",
      mobileTitle: "All Platforms"
    },
    {
      icon: Shield,
      title: "Custom styling",
      description: "Match your website's design",
      mobileTitle: "Custom Style"
    },
    {
      icon: Clock,
      title: "Instant copy-paste code",
      description: "Ready to use in seconds",
      mobileTitle: "Instant Code"
    }
  ];

  return (
    <>
      {/* Mobile: No min-height, Desktop: Full screen with centered content */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 lg:min-h-screen lg:flex lg:items-center">
        {/* Compact container with optimized spacing */}
        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 w-full">
          <div className="max-w-4xl mx-auto">
            
            {/* Mobile: Single column stack, Desktop: Two columns with reduced gap */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
              
              {/* Main Content - Mobile optimized */}
              <div className="text-center lg:text-left mb-8 lg:mb-0 lg:order-1">
                
                {/* Mobile-optimized icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-4 sm:mb-6 shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <Calendar className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                
                {/* Mobile-optimized heading */}
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 leading-tight px-2 sm:px-0">
                  {title}
                </h1>
                
                {/* Mobile-optimized subtitle */}
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed mb-4 sm:mb-6 px-2 sm:px-0 max-w-md mx-auto lg:max-w-none lg:mx-0">
                  {subtitle}
                </p>
                
                {/* Mobile-optimized trust badge */}
                <div className="flex items-center justify-center lg:justify-start mb-6 sm:mb-8">
                  <div className="flex items-center bg-emerald-100 text-emerald-700 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold">
                    <span className="whitespace-nowrap">Start for free • No credit card</span>
                  </div>
                </div>

                {/* Mobile: Show quick benefits before CTA */}
                <div className="lg:hidden mb-6">
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                    {benefits.slice(0, 4).map((benefit, index) => (
                      <div key={index} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                        <benefit.icon className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                        <div className="text-xs font-medium text-gray-900 leading-tight">
                          {benefit.mobileTitle}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile-optimized CTA buttons */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <Button
                    size="lg"
                    color="primary"
                    className="w-full sm:w-full lg:w-auto lg:min-w-[240px] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 font-bold text-white h-12 sm:h-14 text-base sm:text-lg px-6 sm:px-8 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                    onClick={() => handleAuthClick('signup')}
                    endContent={<ArrowRight className="w-5 h-5" />}
                  >
                    <span className="sm:hidden">Get Started Free</span>
                    <span className="hidden sm:inline lg:hidden">Create Free Account</span>
                    <span className="hidden lg:inline">Create Free Account</span>
                  </Button>
                  
                  <div className="text-center lg:text-left">
                    <button
                      className="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base py-2 px-4 rounded-lg hover:bg-white/50 transition-all duration-200 active:scale-95"
                      onClick={() => handleAuthClick('login')}
                    >
                      Already have an account? <span className="underline underline-offset-2">Sign in</span>
                    </button>
                  </div>
                </div>

                {/* Mobile-optimized trust signals */}
                <div className="hidden sm:flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-6 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full mr-2"></div>
                    <span>30-second setup</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full mr-2"></div>
                    <span>No coding required</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full mr-2"></div>
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>

              {/* Benefits Card - Compact version for desktop */}
              <div className="hidden lg:block lg:order-2">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 backdrop-blur-sm">
                  <div className="text-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      What you get for free
                    </h3>
                    <p className="text-sm text-gray-600">Everything you need to get started</p>
                  </div>

                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <div 
                        key={index}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm mb-0.5">
                            {benefit.title}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upgrade hint - more compact */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">
                        Need more? Upgrade anytime for unlimited events
                      </p>
                      <div className="text-xs text-gray-400">
                        Starting at $9/month
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isOpen} 
        onClose={onClose} 
        defaultTab={authMode}
      />
    </>
  );
}