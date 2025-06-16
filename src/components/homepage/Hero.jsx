'use client';

import { useState } from 'react';
import { Calendar, Zap, ArrowRight, Play, Check, Copy, Users, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Hero() {
  const [copiedCode, setCopiedCode] = useState(false);
  const { user, loading } = useAuth();

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section className="pt-16 pb-24 bg-gradient-to-br from-green-250 via-white to-emerald-350 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-emerald-50 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Finally, calendar buttons that work everywhere
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                One button.
              </span> <br />
              <span className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Zero friction.
              </span> <br />
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200">
                Every calendar.
              </span>
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/create"
                className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-400 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-100"
              >
                {loading ? (
                  'Loading...'
                ) : user ? (
                  'Create your new event'
                ) : (
                  'Create an event now'
                )}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                5 buttons free
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                No credit card
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                Works everywhere
              </div>
            </div>
          </div>
          
          {/* Right Column - Visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Product Launch Event</h3>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    Live Preview
                  </div>
                </div>
                
                {/* Event Details */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">June 15, 2025 at 2:00 PM PST</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">Virtual Event • Zoom Link Included</span>
                  </div>
                </div>
                
                {/* Calendar Button */}
                <div className="border-t pt-6">
                  <div className="relative group">
                    <button className="w-full bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-400 transition-colors flex items-center justify-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Add to Calendar
                    </button>
                    
                    {/* Dropdown simulation */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="p-2 space-y-1">
                        {['Google Calendar', 'Apple Calendar', 'Outlook', 'Office 365', 'Yahoo'].map((platform, i) => (
                          <div key={i} className="px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700 cursor-pointer">
                            {platform}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Code Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">Generated HTML</span>
                    <button 
                      onClick={handleCopyCode}
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors flex items-center"
                    >
                      {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <code className="text-xs text-gray-600 block">
                    &lt;button class="Punktual-btn"&gt;Add to Calendar&lt;/button&gt;
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}