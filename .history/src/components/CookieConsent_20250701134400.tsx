"use client";

import React, { useState, useEffect } from 'react';
import { X, Settings, Shield, BarChart3, Cookie } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
}

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false
  });

  useEffect(() => {
    const hasConsent = localStorage.getItem('punktual-cookie-consent');
    if (!hasConsent) {
      setIsVisible(true);
    } else {
      const savedPrefs = JSON.parse(hasConsent);
      setPreferences(savedPrefs);
      
      if (savedPrefs.analytics) {
        initializeAnalytics();
      }
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initializeAnalytics = (): void => {
    if (typeof window !== 'undefined' && !window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-MQD8GRBC4V';
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(...args: unknown[]) {
          window.dataLayer.push(args);
        };
        window.gtag('js', new Date());
        window.gtag('config', 'G-MQD8GRBC4V');
      };
    }
  };

  const savePreferences = (prefs: CookiePreferences): void => {
    localStorage.setItem('punktual-cookie-consent', JSON.stringify(prefs));
    setPreferences(prefs);
    
    if (prefs.analytics) {
      initializeAnalytics();
    }
  };

  const handleAcceptAll = (): void => {
    const allAccepted: CookiePreferences = { essential: true, analytics: true };
    savePreferences(allAccepted);
    setIsVisible(false);
  };

  const handleAcceptEssential = (): void => {
    const essentialOnly: CookiePreferences = { essential: true, analytics: false };
    savePreferences(essentialOnly);
    setIsVisible(false);
  };

  const handleSavePreferences = (): void => {
    savePreferences(preferences);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean): void => {
    if (type === 'essential') return;
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled = false }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
        checked ? 'bg-emerald-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const PreferencesModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Cookie className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Cookie Preferences</h3>
                <p className="text-sm text-gray-600">
                  Choose which cookies you're happy for us to use.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPreferences(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Essential Cookies */}
          <div className="border-2 border-emerald-100 rounded-xl p-6 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Essential Cookies</h4>
                  <p className="text-sm text-gray-600">Required for the site to work</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-200 text-emerald-800 text-sm font-medium rounded-full">
                Always On
              </span>
            </div>
            <div className="text-sm text-gray-700 space-y-2 ml-16">
              <p>• Login and authentication</p>
              <p>• Saving your event drafts</p>
              <p>• Remembering your preferences</p>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">Help us improve the experience</p>
                </div>
              </div>
              <Toggle
                checked={preferences.analytics}
                onChange={(value) => handlePreferenceChange('analytics', value)}
              />
            </div>
            <div className="text-sm text-gray-700 space-y-2 ml-16">
              <p>• Track which calendar buttons are clicked</p>
              <p>• Understand which features are most useful</p>
              <p>• Improve Punktual based on usage patterns</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="space-y-4">
            <button
              onClick={handleSavePreferences}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Save Preferences
            </button>
            <p className="text-xs text-gray-500 text-center">
              Learn more in our{' '}
              <a href="/privacy" className="text-emerald-600 hover:text-emerald-700 underline font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  // Mobile Modal
  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 text-center space-y-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Cookie className="w-6 h-6 text-emerald-600" />
                    <p className="text-emerald-800 font-medium text-center">
                      Chocolate chip cookies still in the oven. These will have to do 🍪
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleAcceptAll}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg"
                    >
                      Accept All
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAcceptEssential}
                        className="flex-1 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        Essential Only
                      </button>
                      <button
                        onClick={() => setShowPreferences(true)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium py-3 px-4 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
                      >
                        <Settings size={18} />
                        Settings
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 -mt-2"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {showPreferences && <PreferencesModal />}
      </>
    );
  }

  // Desktop Bottom Banner
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-emerald-50 to-emerald-100 border-t-2 border-emerald-200 shadow-2xl z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-emerald-600" />
                <p className="text-emerald-800 font-medium text-lg">
                  Chocolate chip cookies still in the oven. These will have to do 🍪
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Accept All
                </button>
                <button
                  onClick={handleAcceptEssential}
                  className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold py-2 px-6 rounded-lg transition-all duration-200"
                >
                  Essential Only
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium py-2 px-4 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
                >
                  <Settings size={16} />
                  Customize
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="text-emerald-600 hover:text-emerald-700 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {showPreferences && <PreferencesModal />}
    </>
  );
};

export default CookieConsent;