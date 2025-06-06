/**
 * Time utility functions for event form handling
 */

/**
 * Rounds a date to the next 15-minute interval
 * @param {Date} date - The date to round (defaults to current time)
 * @returns {Date} - Rounded date
 */
export const roundToNext15Minutes = (date = new Date()) => {
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
 * @param {Date} date - The date to format
 * @returns {string} - Formatted time string (HH:MM)
 */
export const formatTimeForInput = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Adds hours to a time string
 * @param {string} timeStr - Time string in HH:MM format
 * @param {number} hours - Number of hours to add
 * @returns {string} - New time string in HH:MM format
 */
export const addHoursToTime = (timeStr, hours) => {
  const [hourStr, minuteStr] = timeStr.split(':');
  const totalMinutes = parseInt(hourStr) * 60 + parseInt(minuteStr) + hours * 60;
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
};

/**
 * Generates time options for dropdowns in 15-minute intervals
 * @returns {Array} - Array of time option objects with value and label
 */
export const generateTimeOptions = () => {
  const options = [];
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
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @param {Array} allTimeOptions - All available time options
 * @returns {Array} - Filtered time options
 */
export const getFilteredEndTimeOptions = (startTime, startDate, endDate, allTimeOptions) => {
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
 * Filters start time options so past times cannot be selected
 * @param {string} startDate - Selected start date
 * @param {Array} allTimeOptions - All available time options
 * @returns {Array} - Filtered time options
 */
export const getFilteredStartTimeOptions = (startDate, allTimeOptions) => {
  const today = new Date().toISOString().split('T')[0];
  if (startDate !== today) {
    return allTimeOptions;
  }

  const now = new Date();
  const currentTotal = now.getHours() * 60 + now.getMinutes();
  return allTimeOptions.filter(option => {
    const [optionHour, optionMin] = option.value.split(':').map(Number);
    return optionHour * 60 + optionMin >= currentTotal;
  });
};

/**
 * Gets the minimum end date based on start date
 * @param {string} startDate - Start date string
 * @returns {string} - Minimum end date
 */
export const getMinEndDate = (startDate) => {
  const today = new Date().toISOString().split('T')[0];
  if (startDate) {
    return startDate < today ? today : startDate;
  }
  return today;
};
