'use client';
import Link from 'next/link';
import { CalendarIcon } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-gray-900">EasyCal</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}