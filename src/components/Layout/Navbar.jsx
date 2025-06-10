'use client';

import { Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
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
            <button className="text-gray-600 hover:text-emerald-500 transition-colors">
              Sign In
            </button>
            <Link 
              href="/create"
              className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-400 transition-colors font-medium"
            >
              Start Free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}