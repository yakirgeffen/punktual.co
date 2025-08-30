import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { CreateShortLinkRequest, CreateShortLinkResponse } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateShortLinkRequest = await request.json();
    const { originalUrl, eventTitle, userId } = body;

    if (!originalUrl) {
      return NextResponse.json(
        { error: 'Original URL is required' },
        { status: 400 }
      );
    }

    // Generate unique short ID
    let shortId: string = '';
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      shortId = generateShortId();
      const { data: existing } = await supabase
        .from('short_links')
        .select('short_id')
        .eq('short_id', shortId)
        .single();
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique ID' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('short_links')
      .insert({
        short_id: shortId,
        original_url: originalUrl,
        event_title: eventTitle,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create short link' },
        { status: 500 }
      );
    }

    const shortUrl = `https://punktual.co/eventid=${data.short_id}`;
    
    const response: CreateShortLinkResponse = {
      success: true,
      shortUrl,
      shortId: data.short_id
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}