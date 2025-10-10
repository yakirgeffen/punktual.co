import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  try {
    const { shortId } = await params;

    if (!shortId) {
      return NextResponse.json(
        { error: 'Short ID is required' },
        { status: 400 }
      );
    }

    // Create service role client for this operation
    // (public redirect endpoint, no user auth required)
    const supabase = createServiceRoleClient();

    // Look up the short link
    const { data, error } = await supabase
      .from('short_links')
      .select('original_url, is_active, click_count')
      .eq('short_id', shortId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Short link not found' },
        { status: 404 }
      );
    }

    // Increment click count (fire and forget - no await)
    supabase
      .from('short_links')
      .update({
        click_count: (data.click_count || 0) + 1
      })
      .eq('short_id', shortId)
      .then();

    // Redirect to original URL
    return NextResponse.redirect(data.original_url, 302);

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}