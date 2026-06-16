/**
 * Dynamic OG Image — Event Page
 *
 * Generates a 1200×630 social preview image for a Punktual event page.
 *
 * Usage: GET /api/og/event?title=...&tagline=...&host=...&accent=...&theme=...
 *
 * Parameters (all optional):
 *   title   — event title, max 60 chars (truncated with ellipsis if longer)
 *   tagline — short subtitle, max 80 chars
 *   host    — organizer name
 *   accent  — hex color string, e.g. #10b981 (default: Punktual emerald)
 *   theme   — 'white' | 'stone' | 'dark' | 'gradient' (default: 'white')
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

type Theme = 'white' | 'stone' | 'dark' | 'gradient';

interface ThemeConfig {
  bg: string;
  text: string;
  subtext: string;
  badge: string;
  badgeText: string;
}

function getThemeConfig(theme: Theme, accent: string): ThemeConfig {
  switch (theme) {
    case 'dark':
      return {
        bg: '#111827',
        text: '#f9fafb',
        subtext: '#9ca3af',
        badge: accent,
        badgeText: '#ffffff',
      };
    case 'stone':
      return {
        bg: '#f5f5f4',
        text: '#1c1917',
        subtext: '#57534e',
        badge: accent,
        badgeText: '#ffffff',
      };
    case 'gradient':
      return {
        bg: `linear-gradient(135deg, ${accent} 0%, #059669 100%)`,
        text: '#ffffff',
        subtext: 'rgba(255,255,255,0.8)',
        badge: 'rgba(255,255,255,0.2)',
        badgeText: '#ffffff',
      };
    case 'white':
    default:
      return {
        bg: '#ffffff',
        text: '#111827',
        subtext: '#6b7280',
        badge: accent,
        badgeText: '#ffffff',
      };
  }
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}

function sanitizeHex(raw: string): string {
  const cleaned = raw.startsWith('#') ? raw : `#${raw}`;
  // Accept 3 or 6 hex digit colors only; fall back to emerald otherwise
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cleaned)
    ? cleaned
    : '#10b981';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawTitle = searchParams.get('title') || 'Untitled Event';
    const rawTagline = searchParams.get('tagline') || '';
    const rawHost = searchParams.get('host') || '';
    const rawAccent = searchParams.get('accent') || '#10b981';
    const rawTheme = (searchParams.get('theme') || 'white') as Theme;

    const title = truncate(rawTitle, 60);
    const tagline = truncate(rawTagline, 80);
    const host = rawHost;
    const accent = sanitizeHex(rawAccent);
    const theme: Theme = ['white', 'stone', 'dark', 'gradient'].includes(rawTheme)
      ? rawTheme
      : 'white';

    const tc = getThemeConfig(theme, accent);

    // For gradient theme the bg is a CSS gradient string, not a plain color.
    // ImageResponse inline styles support backgroundImage for gradients.
    const isGradient = theme === 'gradient';

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'row',
            fontFamily: 'sans-serif',
            backgroundColor: isGradient ? '#10b981' : tc.bg,
            backgroundImage: isGradient ? tc.bg : undefined,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Left accent band */}
          <div
            style={{
              width: '10px',
              height: '630px',
              backgroundColor: isGradient ? 'rgba(255,255,255,0.3)' : accent,
              flexShrink: 0,
              display: 'flex',
            }}
          />

          {/* Main content area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '56px 64px',
              justifyContent: 'space-between',
            }}
          >
            {/* Top: Punktual wordmark */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {/* Emerald square icon */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: isGradient ? 'rgba(255,255,255,0.9)' : accent,
                  borderRadius: '6px',
                  display: 'flex',
                }}
              />
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: isGradient ? '#ffffff' : tc.subtext,
                  letterSpacing: '-0.3px',
                }}
              >
                Punktual
              </span>
            </div>

            {/* Center: title + tagline + host */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {/* Title */}
              <div
                style={{
                  fontSize: title.length > 40 ? '52px' : '64px',
                  fontWeight: '800',
                  color: tc.text,
                  lineHeight: 1.15,
                  letterSpacing: '-1px',
                  maxWidth: '980px',
                  display: 'flex',
                }}
              >
                {title}
              </div>

              {/* Tagline */}
              {tagline && (
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: '400',
                    color: tc.subtext,
                    lineHeight: 1.4,
                    maxWidth: '860px',
                    display: 'flex',
                  }}
                >
                  {tagline}
                </div>
              )}

              {/* Host */}
              {host && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '20px',
                      color: tc.subtext,
                      display: 'flex',
                    }}
                  >
                    Hosted by
                  </span>
                  <span
                    style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: tc.text,
                      display: 'flex',
                    }}
                  >
                    {host}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom: Event Page badge */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isGradient ? 'rgba(255,255,255,0.2)' : tc.badge,
                  color: tc.badgeText,
                  padding: '10px 20px',
                  borderRadius: '24px',
                  fontSize: '18px',
                  fontWeight: '600',
                }}
              >
                {/* Dot indicator */}
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isGradient ? '#ffffff' : '#ffffff',
                    display: 'flex',
                    flexShrink: 0,
                  }}
                />
                Event Page
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG event image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
