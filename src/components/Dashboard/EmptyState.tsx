'use client';

import React from 'react';
import { Calendar, Plus, Search } from 'lucide-react';
import { Button } from '@heroui/react';
import Link from 'next/link';

interface EmptyStateProps {
  searchQuery?: string;
}

export default function EmptyState({ searchQuery }: EmptyStateProps) {
  
  if (searchQuery?.trim()) {
    // Empty search results
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
          <Search size={24} className="text-slate-400" />
        </div>
        
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          No events found
        </h3>
        
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          No events match your search for &quot;<strong>{searchQuery}</strong>&quot;. 
          Try adjusting your search terms or create a new event.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/create">
            <Button 
              color="primary" 
              startContent={<Plus size={20} />}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Create New Event
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // No events at all
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 bg-emerald-50 rounded-full flex items-center justify-center">
        <Calendar size={32} className="text-emerald-500" />
      </div>
      
      <h3 className="text-2xl font-semibold text-slate-900 mb-4">
        No saved events yet
      </h3>
      
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        Start creating calendar events for your website or app. 
        Once you save events, they&apos;ll appear here for easy management.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/create">
          <Button 
            color="primary" 
            size="lg"
            startContent={<Plus size={20} />}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Create Your First Event
          </Button>
        </Link>
        
        <Link href="/help">
          <Button 
            variant="bordered" 
            size="lg"
          >
            Learn More
          </Button>
        </Link>
      </div>
      
      {/* Feature highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto text-left">
        <div className="bg-white border rounded-lg p-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar size={20} className="text-emerald-600" />
          </div>
          <h4 className="font-semibold text-slate-900 mb-2">Easy Event Creation</h4>
          <p className="text-sm text-slate-600">
            Create events with all the details your users need - dates, times, locations, and descriptions.
          </p>
        </div>
        
        <div className="bg-white border rounded-lg p-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Plus size={20} className="text-blue-600" />
          </div>
          <h4 className="font-semibold text-slate-900 mb-2">Multiple Formats</h4>
          <p className="text-sm text-slate-600">
            Generate buttons, dropdowns, direct links, or full event pages for any platform.
          </p>
        </div>
        
        <div className="bg-white border rounded-lg p-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Search size={20} className="text-purple-600" />
          </div>
          <h4 className="font-semibold text-slate-900 mb-2">Easy Management</h4>
          <p className="text-sm text-slate-600">
            Search, filter, duplicate, and manage all your events from one central dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}