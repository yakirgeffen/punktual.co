'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, MoreVertical, Edit, Copy, Trash2, ExternalLink } from 'lucide-react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from '@heroui/react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
// import Link from 'next/link'; // For future edit functionality
import type { EventData } from '@/types';

interface DatabaseEvent extends EventData {
  id: string;
  user_id: string;
  share_id?: string;
  created_at: string;
  updated_at?: string;
  last_used_at?: string;
}

interface EventCardProps {
  event: DatabaseEvent;
  viewMode: 'grid' | 'list';
  onDelete: () => void;
  onDuplicate: () => void;
  onGenerateCalendar: () => void;
}

export default function EventCard({ 
  event, 
  viewMode, 
  onDelete, 
  onDuplicate, 
  onGenerateCalendar 
}: EventCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatEventDate = (startDate?: string, startTime?: string, isAllDay?: boolean) => {
    if (!startDate) return 'Date not set';
    
    try {
      const date = parseISO(startDate);
      
      if (isAllDay) {
        return format(date, 'MMM d, yyyy');
      }
      
      if (startTime) {
        // Combine date and time for proper formatting
        const [hours, minutes] = startTime.split(':');
        date.setHours(parseInt(hours), parseInt(minutes));
        return format(date, 'MMM d, yyyy at h:mm a');
      }
      
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const handleMenuAction = (key: string) => {
    setIsMenuOpen(false);
    
    switch (key) {
      case 'edit':
        // Navigate to create page with event data
        // For now, we'll just generate calendar
        onGenerateCalendar();
        break;
      case 'duplicate':
        onDuplicate();
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this event?')) {
          onDelete();
        }
        break;
      case 'generate':
        onGenerateCalendar();
        break;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 truncate">
                  {event.title || 'Untitled Event'}
                </h3>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{formatEventDate(event.startDate, event.startTime, event.isAllDay)}</span>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span className="truncate max-w-48">{event.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>Created {getTimeAgo(event.created_at)}</span>
                  </div>
                  
                  {event.last_used_at && (
                    <div className="text-emerald-600">
                      Used {getTimeAgo(event.last_used_at)}
                    </div>
                  )}
                </div>
              </div>
              
              <Dropdown isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownTrigger>
                  <Button 
                    variant="light" 
                    size="sm"
                    isIconOnly
                    className="ml-2"
                  >
                    <MoreVertical size={16} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Event actions"
                  onAction={(key) => handleMenuAction(key.toString())}
                >
                  <DropdownSection title="Actions">
                    <DropdownItem 
                      key="generate"
                      startContent={<ExternalLink size={16} />}
                    >
                      Generate Calendar
                    </DropdownItem>
                    <DropdownItem 
                      key="edit"
                      startContent={<Edit size={16} />}
                    >
                      Edit Event
                    </DropdownItem>
                    <DropdownItem 
                      key="duplicate"
                      startContent={<Copy size={16} />}
                    >
                      Duplicate
                    </DropdownItem>
                  </DropdownSection>
                  <DropdownSection>
                    <DropdownItem 
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<Trash2 size={16} />}
                    >
                      Delete
                    </DropdownItem>
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 truncate pr-2">
          {event.title || 'Untitled Event'}
        </h3>
        
        <Dropdown isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownTrigger>
            <Button 
              variant="light" 
              size="sm"
              isIconOnly
              className="flex-shrink-0"
            >
              <MoreVertical size={16} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Event actions"
            onAction={(key) => handleMenuAction(key.toString())}
          >
            <DropdownSection title="Actions">
              <DropdownItem 
                key="generate"
                startContent={<ExternalLink size={16} />}
              >
                Generate Calendar
              </DropdownItem>
              <DropdownItem 
                key="edit"
                startContent={<Edit size={16} />}
              >
                Edit Event
              </DropdownItem>
              <DropdownItem 
                key="duplicate"
                startContent={<Copy size={16} />}
              >
                Duplicate
              </DropdownItem>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem 
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<Trash2 size={16} />}
              >
                Delete
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>

      {event.description && (
        <p className="text-slate-600 text-sm mb-4 overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
          {event.description}
        </p>
      )}

      <div className="space-y-2 text-sm text-slate-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatEventDate(event.startDate, event.startTime, event.isAllDay)}</span>
        </div>
        
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t">
        <span>Created {getTimeAgo(event.created_at)}</span>
        {event.last_used_at ? (
          <span className="text-emerald-600">Used {getTimeAgo(event.last_used_at)}</span>
        ) : (
          <span>Never used</span>
        )}
      </div>
    </div>
  );
}