'use client';

import React from 'react';
import { Button, Select, SelectItem } from '@heroui/react';
import { X, ArrowUpDown } from 'lucide-react';

type SortBy = 'created_at' | 'title' | 'last_used_at';
type SortOrder = 'asc' | 'desc';

interface EventFiltersProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
  onClose: () => void;
}

export default function EventFilters({ 
  sortBy, 
  sortOrder, 
  onSortChange, 
  onClose 
}: EventFiltersProps) {

  const sortOptions = [
    { key: 'created_at', label: 'Created Date' },
    { key: 'title', label: 'Title' },
    { key: 'last_used_at', label: 'Last Used' }
  ];

  const handleSortByChange = (value: string) => {
    onSortChange(value as SortBy, sortOrder);
  };

  const handleSortOrderToggle = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="mt-6 pt-6 border-t">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-900">Filters & Sorting</h3>
        <Button
          variant="light"
          size="sm"
          isIconOnly
          onClick={onClose}
        >
          <X size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sort By
          </label>
          <Select
            selectedKeys={[sortBy]}
            onSelectionChange={(keys) => handleSortByChange(Array.from(keys)[0] as string)}
            className="w-full"
          >
            {sortOptions.map((option) => (
              <SelectItem key={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Order
          </label>
          <Button
            variant="bordered"
            onClick={handleSortOrderToggle}
            startContent={<ArrowUpDown size={16} />}
            className="w-full justify-start"
          >
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>

        {/* Future: Add more filters here */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <Select
            placeholder="All Events"
            className="w-full"
            isDisabled
          >
            <SelectItem key="all">All Events</SelectItem>
            <SelectItem key="favorites">Favorites</SelectItem>
            <SelectItem key="recent">Recently Used</SelectItem>
          </Select>
          <p className="text-xs text-slate-500 mt-1">Coming soon</p>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          variant="bordered"
          size="sm"
          onClick={() => onSortChange('created_at', 'desc')}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}