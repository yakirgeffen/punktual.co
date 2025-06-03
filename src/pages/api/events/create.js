// src/pages/api/events/create.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { generateCalendarCode } from '@/utils/calendarGenerator'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = createServerSupabaseClient({ req, res })
  
  try {
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { eventData, buttonData } = req.body

    // Validate required fields
    if (!eventData.title || !eventData.startDate) {
      return res.status(400).json({ error: 'Title and start date are required' })
    }

    // Check usage limits
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
    const { data: usageData, error: usageError } = await supabase
      .from('usage_tracking')
      .select('events_created')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single()

    if (usageError && usageError.code !== 'PGRST116') {
      throw usageError
    }

    const currentUsage = usageData?.events_created || 0
    if (currentUsage >= 5) {
      return res.status(429).json({ 
        error: 'Monthly limit reached. Upgrade your plan to create more events.' 
      })
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        user_id: user.id
      }])
      .select()
      .single()

    if (eventError) throw eventError

    // Generate calendar code
    const generatedCode = generateCalendarCode(eventData, buttonData)

    // Save generated button
    const { data: button, error: buttonError } = await supabase
      .from('generated_buttons')
      .insert([{
        event_id: event.id,
        ...buttonData,
        html_code: generatedCode
      }])
      .select()
      .single()

    if (buttonError) throw buttonError

    // Update usage tracking
    await supabase.rpc('increment_usage', {
      user_id: user.id,
      month: currentMonth
    })

    res.status(200).json({
      success: true,
      event,
      button,
      code: generatedCode
    })

  } catch (error) {
    console.error('Error creating event:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
