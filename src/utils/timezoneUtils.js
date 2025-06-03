/**
 * Timezone and city utilities for enhanced timezone selection
 */

/**
 * Gets current time in a specific timezone
 * @param {string} timezone - IANA timezone identifier
 * @returns {string} - Formatted time (e.g., "3:45 PM")
 */
export const getCurrentTimeInTimezone = (timezone) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date());
  } catch {
    return '';
  }
};

/**
 * Gets timezone offset in hours from UTC
 * @param {string} timezone - IANA timezone identifier
 * @returns {string} - Offset string (e.g., "UTC+3", "UTC-5")
 */
export const getTimezoneOffset = (timezone) => {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString("en-US", { timeZone: timezone }));
    const offsetHours = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
    
    if (offsetHours === 0) return 'UTC';
    const sign = offsetHours > 0 ? '+' : '';
    return `UTC${sign}${Math.round(offsetHours)}`;
  } catch {
    return '';
  }
};

/**
 * Major cities to timezone mapping for enhanced search
 * Includes cities not directly represented in IANA timezone identifiers
 */
export const cityTimezoneMap = {
  // North America - Eastern Time
  'miami': 'America/New_York',
  'orlando': 'America/New_York',
  'atlanta': 'America/New_York',
  'boston': 'America/New_York',
  'philadelphia': 'America/New_York',
  'washington': 'America/New_York',
  'baltimore': 'America/New_York',
  'charlotte': 'America/New_York',
  'jacksonville': 'America/New_York',
  'tampa': 'America/New_York',
  
  // North America - Central Time
  'dallas': 'America/Chicago',
  'houston': 'America/Chicago',
  'austin': 'America/Chicago',
  'san antonio': 'America/Chicago',
  'new orleans': 'America/Chicago',
  'memphis': 'America/Chicago',
  'nashville': 'America/Chicago',
  'milwaukee': 'America/Chicago',
  'minneapolis': 'America/Chicago',
  'kansas city': 'America/Chicago',
  
  // North America - Mountain Time
  'denver': 'America/Denver',
  'salt lake city': 'America/Denver',
  'albuquerque': 'America/Denver',
  'colorado springs': 'America/Denver',
  'billings': 'America/Denver',
  'cheyenne': 'America/Denver',
  
  // North America - Pacific Time
  'los angeles': 'America/Los_Angeles',
  'san francisco': 'America/Los_Angeles',
  'san diego': 'America/Los_Angeles',
  'seattle': 'America/Los_Angeles',
  'portland': 'America/Los_Angeles',
  'las vegas': 'America/Los_Angeles',
  'sacramento': 'America/Los_Angeles',
  'fresno': 'America/Los_Angeles',
  
  // Europe
  'london': 'Europe/London',
  'manchester': 'Europe/London',
  'birmingham': 'Europe/London',
  'glasgow': 'Europe/London',
  'dublin': 'Europe/Dublin',
  'paris': 'Europe/Paris',
  'marseille': 'Europe/Paris',
  'lyon': 'Europe/Paris',
  'berlin': 'Europe/Berlin',
  'munich': 'Europe/Berlin',
  'hamburg': 'Europe/Berlin',
  'cologne': 'Europe/Berlin',
  'madrid': 'Europe/Madrid',
  'barcelona': 'Europe/Madrid',
  'valencia': 'Europe/Madrid',
  'rome': 'Europe/Rome',
  'milan': 'Europe/Rome',
  'naples': 'Europe/Rome',
  'amsterdam': 'Europe/Amsterdam',
  'rotterdam': 'Europe/Amsterdam',
  'brussels': 'Europe/Brussels',
  'vienna': 'Europe/Vienna',
  'zurich': 'Europe/Zurich',
  'geneva': 'Europe/Zurich',
  'stockholm': 'Europe/Stockholm',
  'oslo': 'Europe/Oslo',
  'copenhagen': 'Europe/Copenhagen',
  'helsinki': 'Europe/Helsinki',
  
  // Asia
  'tokyo': 'Asia/Tokyo',
  'osaka': 'Asia/Tokyo',
  'kyoto': 'Asia/Tokyo',
  'yokohama': 'Asia/Tokyo',
  'beijing': 'Asia/Shanghai',
  'shanghai': 'Asia/Shanghai',
  'guangzhou': 'Asia/Shanghai',
  'shenzhen': 'Asia/Shanghai',
  'hong kong': 'Asia/Hong_Kong',
  'singapore': 'Asia/Singapore',
  'kuala lumpur': 'Asia/Kuala_Lumpur',
  'bangkok': 'Asia/Bangkok',
  'jakarta': 'Asia/Jakarta',
  'manila': 'Asia/Manila',
  'seoul': 'Asia/Seoul',
  'mumbai': 'Asia/Kolkata',
  'delhi': 'Asia/Kolkata',
  'bangalore': 'Asia/Kolkata',
  'chennai': 'Asia/Kolkata',
  'kolkata': 'Asia/Kolkata',
  'dubai': 'Asia/Dubai',
  'abu dhabi': 'Asia/Dubai',
  'doha': 'Asia/Qatar',
  'riyadh': 'Asia/Riyadh',
  'tel aviv': 'Asia/Jerusalem',
  'jerusalem': 'Asia/Jerusalem',
  
  // Australia & Oceania
  'sydney': 'Australia/Sydney',
  'melbourne': 'Australia/Melbourne',
  'brisbane': 'Australia/Brisbane',
  'perth': 'Australia/Perth',
  'adelaide': 'Australia/Adelaide',
  'auckland': 'Pacific/Auckland',
  'wellington': 'Pacific/Auckland',
  
  // South America
  'sao paulo': 'America/Sao_Paulo',
  'rio de janeiro': 'America/Sao_Paulo',
  'buenos aires': 'America/Argentina/Buenos_Aires',
  'santiago': 'America/Santiago',
  'lima': 'America/Lima',
  'bogota': 'America/Bogota',
  'caracas': 'America/Caracas',
  
  // Africa
  'cairo': 'Africa/Cairo',
  'lagos': 'Africa/Lagos',
  'johannesburg': 'Africa/Johannesburg',
  'cape town': 'Africa/Johannesburg',
  'nairobi': 'Africa/Nairobi',
  'casablanca': 'Africa/Casablanca',
  'tunis': 'Africa/Tunis',
  'algiers': 'Africa/Algiers'
};

/**
 * Gets all available timezones with enhanced city information
 * @returns {Array} - Array of timezone objects with enhanced search data
 */
export const getAllTimezones = () => {
  const timeZones = Intl.supportedValuesOf('timeZone');
  const timezoneObjects = timeZones.map(tz => {
    const parts = tz.split('/');
    const city = parts[parts.length - 1]?.replace(/_/g, ' ') || tz;
    const region = parts[0]?.replace(/_/g, ' ') || '';
    
    let displayName = city;
    if (region && region !== city && parts.length > 1) {
      displayName = `${city}, ${region}`;
    }
    
    // Add current time
    const currentTime = getCurrentTimeInTimezone(tz);
    const offset = getTimezoneOffset(tz);
    
    return {
      value: tz,
      label: displayName,
      city: city.toLowerCase(),
      region: region.toLowerCase(),
      currentTime,
      offset,
      searchTerms: `${tz.toLowerCase()} ${city.toLowerCase()} ${region.toLowerCase()}`
    };
  });
  
  return timezoneObjects.sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Searches for timezones and cities with smart suggestions
 * @param {string} searchTerm - User's search input
 * @param {Array} allTimezones - All available timezones
 * @returns {Array} - Filtered and enhanced results
 */
export const searchTimezonesAndCities = (searchTerm, allTimezones) => {
  if (!searchTerm.trim()) {
    // Return popular timezones when no search
    const popularTimezones = [
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'America/Toronto', 'America/Vancouver', 'Europe/London', 'Europe/Paris',
      'Europe/Berlin', 'Europe/Madrid', 'Asia/Tokyo', 'Asia/Shanghai',
      'Asia/Singapore', 'Asia/Dubai', 'Australia/Sydney', 'UTC'
    ];
    const popular = allTimezones.filter(tz => popularTimezones.includes(tz.value));
    const others = allTimezones.filter(tz => !popularTimezones.includes(tz.value));
    return [...popular, ...others];
  }
  
  const searchLower = searchTerm.toLowerCase().trim();
  const results = [];
  
  // First, check if it's a known city in our mapping
  const mappedTimezone = cityTimezoneMap[searchLower];
  if (mappedTimezone) {
    const timezoneObj = allTimezones.find(tz => tz.value === mappedTimezone);
    if (timezoneObj) {
      // Create a special result showing the city mapping
      const cityName = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase();
      results.push({
        ...timezoneObj,
        label: `${cityName} → ${timezoneObj.label}`,
        isCityMapping: true,
        originalCity: cityName
      });
    }
  }
  
  // Then search through all timezones
  const directMatches = allTimezones.filter(tz => 
    tz.searchTerms.includes(searchLower) && 
    !results.some(r => r.value === tz.value)
  );
  
  results.push(...directMatches);
  
  // If no results, find closest geographic matches
  if (results.length === 0) {
    const partialMatches = allTimezones.filter(tz => 
      tz.city.includes(searchLower) || 
      tz.region.includes(searchLower) ||
      tz.label.toLowerCase().includes(searchLower)
    );
    results.push(...partialMatches.slice(0, 10)); // Limit to 10 closest matches
  }
  
  return results;
};

/**
 * Formats timezone display with current time
 * @param {Object} timezone - Timezone object
 * @returns {string} - Formatted display string
 */
export const formatTimezoneDisplay = (timezone) => {
  if (!timezone) return '';
  
  const time = timezone.currentTime || getCurrentTimeInTimezone(timezone.value);
  const offset = timezone.offset || getTimezoneOffset(timezone.value);
  
  if (timezone.isCityMapping) {
    return `${timezone.originalCity} → ${timezone.city} (${offset}) - ${time}`;
  }
  
  return `${timezone.label} (${offset}) - ${time}`;
};
