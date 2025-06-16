'use client';

import { useState } from 'react';
import { Calendar, MapPin, Copy, Trash2, MoreVertical, Clock } from 'lucide-react';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Button,
  useDisclosure
} from '@heroui/react';
import toast from 'react-hot-toast';

export default function EventCard({ event, onDelete, onDuplicate }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Format date for display
  const formatEventDate = () => {
    if (!event.startDate) return 'No date set';
    
    const date = new Date(event.startDate);
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    if (event.isAllDay) {
      return `${dateStr} (All day)`;
    }
    
    if (!event.startTime) return dateStr;
    
    const [hours, minutes] = event.startTime.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const timeStr = `${hour12}:${minutes} ${ampm}`;
    
    return `${dateStr} at ${timeStr}`;
  };

  // Format last used time
  const formatLastUsed = () => {
    if (!event.last_used_at) return 'Never used';
    
    const date = new Date(event.last_used_at);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleDuplicate = async () => {
    if (isDuplicating) return;
    
    setIsDuplicating(true);
    try {
      await onDuplicate();
      toast.success('Event duplicated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to duplicate event');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    if (!confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDelete();
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Event Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate mb-1">
            {event.title || 'Untitled Event'}
          </h4>
          
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{formatEventDate()}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-2 flex-shrink-0" />
              <span>Last used: {formatLastUsed()}</span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="ml-2"
              aria-label="Event actions"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Event actions">
            <DropdownItem
              key="duplicate"
              startContent={<Copy className="w-4 h-4" />}
              onPress={handleDuplicate}
              isDisabled={isDuplicating}
            >
              {isDuplicating ? 'Duplicating...' : 'Duplicate'}
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Trash2 className="w-4 h-4" />}
              onPress={handleDelete}
              isDisabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}