// src/components/FormSections/BasicDetails.jsx
'use client';

import { useEventContext } from '@/contexts/EventContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ValidationError from '../UI/ValidationError';
import { useState, useRef, useEffect } from 'react';

const calculateDuration = (startTime, endTime, startDate, endDate) => {
  if (!startTime || !endTime || !startDate || !endDate) return '';
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  let diffMs = end - start;
  if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  let res = '';
  if (days > 0) res += `${days}d `;
  if (hours > 0) res += `${hours}h `;
  if (minutes > 0) res += `${minutes}m`;
  return res.trim();
};

const basicDetailsSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().optional(),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().optional(),
  isAllDay: z.boolean().default(false)
});

function TimeDropdown({ value, onChange, options, disabled, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);
  return (
    <div className="relative max-w-xs" style={{ minWidth: 120 }} ref={ref}>
      <button
        type="button"
        className={`input-field w-full text-left pr-8 flex items-center transition-all duration-150 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{lineHeight: '1.6'}}
      >
        {value || <span className="text-gray-400">{placeholder}</span>}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
      </button>
      {open && !disabled && (
        <div
          className="z-50 absolute left-0 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-48 overflow-y-auto text-sm animate-fadein"
          style={{minWidth: 120}}
          role="listbox"
        >
          {options.map(option => (
            <div
              key={option}
              onClick={() => { onChange(option); setOpen(false); }}
              className={`px-4 py-2 cursor-pointer hover:bg-emerald-50 focus:bg-emerald-100 transition-colors duration-100 ${value === option ? 'bg-emerald-100 font-semibold text-emerald-700' : ''}`}
              tabIndex={0}
              role="option"
              aria-selected={value === option}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BasicDetails() {
  const { eventData, updateEvent } = useEventContext();
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: eventData,
    mode: 'onChange',
  });

  const isAllDay = watch('isAllDay');
  const startDate = watch('startDate') || '';
  const endDate = watch('endDate') || '';
  const startTime = watch('startTime') || '';
  const endTime = watch('endTime') || '';

  const handleFieldChange = (field, value) => {
    setValue(field, value);
    if (field === 'startDate' && value) {
      if (eventData.endDate < value) {
        setValue('endDate', value);
        updateEvent({ [field]: value, endDate: value });
      } else {
        updateEvent({ [field]: value });
      }
    } else if (field === 'endDate' && value) {
      if (value < eventData.startDate) {
        setValue('endDate', eventData.startDate);
        updateEvent({ [field]: eventData.startDate });
      } else {
        updateEvent({ [field]: value });
      }
    } else {
      updateEvent({ [field]: value });
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };
  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-3">
      {/* Event Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Title *
        </label>
        <input
          {...register('title')}
          type="text"
          className="input-field"
          placeholder="Enter event title"
          onChange={(e) => handleFieldChange('title', e.target.value)}
        />
        <ValidationError error={errors.title} />
      </div>
      
      {/* Start Row: Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            {...register('startDate')}
            type="date"
            className="input-field w-full"
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
            value={startDate}
          />
          <ValidationError error={errors.startDate} />
        </div>
        <div className={isAllDay ? 'opacity-60 pointer-events-none' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <TimeDropdown
            value={startTime}
            onChange={val => handleFieldChange('startTime', val)}
            options={timeOptions}
            disabled={isAllDay}
            placeholder="Select time"
          />
          <ValidationError error={errors.startTime} />
        </div>
      </div>
      
      {/* End Row: Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date *
          </label>
          <input
            {...register('endDate')}
            type="date"
            className="input-field w-full"
            min={startDate}
            onChange={(e) => handleFieldChange('endDate', e.target.value)}
            value={endDate}
          />
          <ValidationError error={errors.endDate} />
        </div>
        <div className={isAllDay ? 'opacity-60 pointer-events-none' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <TimeDropdown
            value={endTime}
            onChange={val => handleFieldChange('endTime', val)}
            options={timeOptions}
            disabled={isAllDay}
            placeholder="Select time"
          />
          <ValidationError error={errors.endTime} />
          <div className="mt-1 h-4">
            <span className={`text-xs text-gray-500 transition-opacity duration-200 ${startTime && endTime ? 'opacity-100' : 'opacity-0'}`}>
              Duration: {calculateDuration(startTime, endTime, startDate, endDate)}
            </span>
          </div>
        </div>
      </div>
      
      {/* All Day */}
      <div className="mt-2">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            {...register('isAllDay')}
            onChange={e => handleFieldChange('isAllDay', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">All Day</span>
        </label>
      </div>
    </div>
  );
}