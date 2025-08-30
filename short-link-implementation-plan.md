# Short Link System Implementation Plan

## Goal
Create a short link generator that converts long Google Calendar links to punktual.co/eventid=xxxxxxxx format.

## Current Tech Stack
- TypeScript
- Next.js (hosted on Vercel)
- Supabase (database)
- GitHub for version control

## Database Schema
CREATE TABLE short_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_id VARCHAR(8) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  click_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id), -- optional if you have user auth
  event_title VARCHAR(255), -- helpful for your own tracking
  is_active BOOLEAN DEFAULT true -- for future expiration feature
);

-- Add index for faster lookups
CREATE INDEX idx_short_links_short_id ON short_links(short_id);
CREATE INDEX idx_short_links_user_id ON short_links(user_id);


-- Enable RLS
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active short links (for redirects)
CREATE POLICY "Allow public read of active short links" ON short_links
FOR SELECT USING (is_active = true);

-- Allow authenticated users to insert their own links
CREATE POLICY "Allow users to create short links" ON short_links
FOR INSERT WITH CHECK (auth.uid() = user_id);

## API Endpoints Needed
1. POST /api/create-short-link - generates short links
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { CreateShortLinkRequest, CreateShortLinkResponse } from '../../types/short-links'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateShortLinkResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { originalUrl, eventTitle, userId }: CreateShortLinkRequest = req.body

  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' })
  }

  try {
    // Generate unique short ID
    let shortId: string
    let isUnique = false
    let attempts = 0
    
    while (!isUnique && attempts < 10) {
      shortId = generateShortId()
      const { data: existing } = await supabase
        .from('short_links')
        .select('short_id')
        .eq('short_id', shortId)
        .single()
      
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique ID' })
    }

    const { data, error } = await supabase
      .from('short_links')
      .insert({
        short_id: shortId!,
        original_url: originalUrl,
        event_title: eventTitle,
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to create short link' })
    }

    const shortUrl = `https://punktual.co/eventid=${data.short_id}`
    
    res.status(200).json({
      success: true,
      shortUrl,
      shortId: data.short_id
    })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

2. GET /api/[shortId] - handles redirects
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { shortId } = req.query

  try {
    // Look up the short link and increment click count
    const { data, error } = await supabase
      .from('short_links')
      .select('original_url, is_active')
      .eq('short_id', shortId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Short link not found' })
    }

    // Increment click count (fire and forget)
    supabase
      .from('short_links')
      .update({ click_count: supabase.sql`click_count + 1` })
      .eq('short_id', shortId)
      .then()

    // Redirect to original URL
    res.redirect(302, data.original_url)

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

## Type Definitions Needed
export interface ShortLink {
  id: string
  short_id: string
  original_url: string
  created_at: string
  click_count: number
  user_id?: string
  event_title?: string
  is_active: boolean
}

export interface CreateShortLinkRequest {
  originalUrl: string
  eventTitle?: string
  userId?: string
}

export interface CreateShortLinkResponse {
  success: boolean
  shortUrl: string
  shortId: string
}

## Implementation Steps
1. Create database table in Supabase
2. Add TypeScript types
3. Create API endpoints
4. Integrate with existing event creation flow
5. Add analytics tracking

## Questions for Claude Code
- How to best integrate this with our existing event creation workflow?
- Should we add any additional error handling or validation?
- Best practices for the redirect URL structure?