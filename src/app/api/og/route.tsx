/**
 * Dynamic OG Image Generation
 * Generates Open Graph images for blog posts
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Punktual Blog';
    const category = searchParams.get('category') || '';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage:
              'radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          {/* Emerald Gradient Background */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              opacity: 0.9,
              display: 'flex',
            }}
          />

          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              zIndex: 1,
            }}
          >
            {/* Category Badge */}
            {category && (
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '12px 24px',
                  borderRadius: '24px',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: '600',
                  marginBottom: '32px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {category}
              </div>
            )}

            {/* Title */}
            <div
              style={{
                display: 'flex',
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: '1000px',
                marginBottom: '40px',
                textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              {title}
            </div>

            {/* Punktual Logo/Text */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  display: 'flex',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                Punktual
              </div>
            </div>
          </div>

          {/* Bottom Decoration */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'white',
              display: 'flex',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
