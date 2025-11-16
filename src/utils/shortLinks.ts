import type { CreateShortLinkRequest, CreateShortLinkResponse } from '@/types';

/**
 * Creates a short link for a given URL
 * @param originalUrl - The URL to shorten
 * @param eventTitle - Optional event title for metadata
 * @param userId - Optional user ID
 * @param authToken - Optional authentication token (Bearer token or access token)
 */
export async function createShortLink(
  originalUrl: string,
  eventTitle?: string,
  userId?: string,
  authToken?: string
): Promise<CreateShortLinkResponse> {
  try {
    // Get CSRF token for this request
    const csrfResponse = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });

    if (!csrfResponse.ok) {
      throw new Error('Failed to get CSRF token');
    }

    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.token;

    const requestBody: CreateShortLinkRequest = {
      originalUrl,
      eventTitle,
      userId
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,  // Include CSRF token in header for validation
    };

    // Add authorization header if token is provided
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch('/api/create-short-link', {
      method: 'POST',
      headers,
      credentials: 'include',  // Send HTTP-only cookies (sb-access-token, __csrf_token)
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create short link');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Generates short links for all calendar platforms from calendar links
 * @param calendarLinks - Map of platform names to calendar URLs
 * @param eventTitle - Optional event title for metadata
 * @param userId - Optional user ID
 * @param authToken - Optional authentication token for API calls
 */
export async function createCalendarShortLinks(
  calendarLinks: Record<string, string>,
  eventTitle?: string,
  userId?: string,
  authToken?: string
): Promise<Record<string, string>> {
  const shortLinks: Record<string, string> = {};

  for (const [platform, url] of Object.entries(calendarLinks)) {
    if (url) {
      // Skip creating short links for data URIs (e.g., Apple Calendar ICS files)
      // These are too long and should remain as-is
      if (url.startsWith('data:')) {
        shortLinks[platform] = url;
        continue;
      }

      try {
        const shortLinkResponse = await createShortLink(
          url,
          `${eventTitle} - ${platform}`,
          userId,
          authToken
        );
        shortLinks[platform] = shortLinkResponse.shortUrl;
      } catch (error) {
        console.error(`Failed to create short link for ${platform}:`, error);
        // Fallback to original URL if short link creation fails
        shortLinks[platform] = url;
      }
    }
  }

  return shortLinks;
}

/**
 * Utility function to check if a URL is already a short link
 */
export function isShortLink(url: string): boolean {
  return url.includes('punktual.co/eventid=');
}

/**
 * Extracts the short ID from a short link URL
 */
export function extractShortId(shortUrl: string): string | null {
  const match = shortUrl.match(/eventid=([A-Z0-9]+)/);
  return match ? match[1] : null;
}