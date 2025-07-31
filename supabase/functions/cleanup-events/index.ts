import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://qiyjfdgdqqwpkumrvodb.supabase.co'
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseServiceKey!)

Deno.serve(async (req) => {
  try {
    console.log('Starting event cleanup...')
    
    // Calculate the cutoff time (2 hours after event start time)
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - 2)
    
    // Delete events that are 2 hours past their start time
    const { data: deletedEvents, error } = await supabase
      .from('events')
      .delete()
      .lt('date_time', cutoffTime.toISOString())
      .select()
    
    if (error) {
      console.error('Error deleting expired events:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to cleanup events' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Cleaned up ${deletedEvents?.length || 0} expired events`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount: deletedEvents?.length || 0,
        deletedEvents: deletedEvents 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})