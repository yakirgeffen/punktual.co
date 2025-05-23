'use client';
// src/components/Layout/Navbar.jsx
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { CalendarIcon, UserIcon } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <CalendarIcon className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">EasyCal</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Hi, {user.email}</span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button className="btn-primary">
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}