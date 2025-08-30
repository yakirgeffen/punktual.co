import type { CreateShortLinkRequest, CreateShortLinkResponse } from '@/types';

/**
 * Creates a short link for a given URL
 */
export async function createShortLink(
  originalUrl: string,
  eventTitle?: string,
  userId?: string
): Promise<CreateShortLinkResponse> {
  const requestBody: CreateShortLinkRequest = {
    originalUrl,
    eventTitle,
    userId
  };

  const response = await fetch('/api/create-short-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create short link');
  }

  return response.json();
}

/**
 * Generates short links for all calendar platforms from calendar links
 */
export async function createCalendarShortLinks(
  calendarLinks: Record<string, string>,
  eventTitle?: string,
  userId?: string
): Promise<Record<string, string>> {
  const shortLinks: Record<string, string> = {};
  
  for (const [platform, url] of Object.entries(calendarLinks)) {
    if (url) {
      try {
        const shortLinkResponse = await createShortLink(
          url,
          `${eventTitle} - ${platform}`,
          userId
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