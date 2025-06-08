'use client';

import { Calendar } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">EasyCal</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#problem" className="text-gray-600 hover:text-blue-600 transition-colors">Why EasyCal</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#docs" className="text-gray-600 hover:text-blue-600 transition-colors">Docs</a>
          </nav>
          
          <div className="flex items-center space-x-3">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </button>
            <Link 
              href="/create"
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}