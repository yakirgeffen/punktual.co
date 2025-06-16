/**
 * Time utility functions for event form handling
 */

import type { TimeOption } from '@/types';

/**
 * Rounds a date to the next 15-minute interval
 */
export const roundToNext15Minutes = (date: Date = new Date()): Date => {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  const newDate = new Date(date);
  if (roundedMinutes >= 60) {
    newDate.setHours(newDate.getHours() + 1);
    newDate.setMinutes(0);
  } else {
    newDate.setMinutes(roundedMinutes);
  }
  newDate.setSeconds(0, 0);
  return newDate;
};

/**
 * Formats a date object to HH:MM string for input fields
 */
export const formatTimeForInput = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Adds hours to a time string
 */
export const addHoursToTime = (timeStr: string, hours: number): string => {
  const [hourStr, minuteStr] = timeStr.split(':');
  const totalMinutes = parseInt(hourStr) * 60 + parseInt(minuteStr) + hours * 60;
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
};

/**
 * Generates time options for dropdowns in 15-minute intervals
 */
export const generateTimeOptions = (): TimeOption[] => {
  const options: TimeOption[] = [];
  for (let hour = 1; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      const amTime24 = hour === 12 ? `00:${minuteStr}` : `${hourStr}:${minuteStr}`;
      const amLabel = `${hourStr}:${minuteStr} AM`;
      options.push({ value: amTime24, label: amLabel });
      const pmTime24 = hour === 12 ? `12:${minuteStr}` : `${(hour + 12).toString().padStart(2, '0')}:${minuteStr}`;
      const pmLabel = `${hourStr}:${minuteStr} PM`;
      options.push({ value: pmTime24, label: pmLabel });
    }
  }
  return options.sort((a, b) => {
    const [aHour, aMin] = a.value.split(':').map(Number);
    const [bHour, bMin] = b.value.split(':').map(Number);
    return aHour * 60 + aMin - (bHour * 60 + bMin);
  });
};

/**
 * Filters end time options based on start time
 */
export const getFilteredEndTimeOptions = (
  startTime: string, 
  startDate: string, 
  endDate: string, 
  allTimeOptions: TimeOption[]
): TimeOption[] => {
  if (!startTime || startDate !== endDate) {
    return allTimeOptions;
  }
  const [startHour, startMin] = startTime.split(':').map(Number);
  const startTotal = startHour * 60 + startMin;
  return allTimeOptions.filter(option => {
    const [optionHour, optionMin] = option.value.split(':').map(Number);
    return optionHour * 60 + optionMin > startTotal;
  });
};

/**
 * Gets the minimum end date based on start date
 */
export const getMinEndDate = (startDate?: string): string => startDate || '';