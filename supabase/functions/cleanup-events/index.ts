import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://qiyjfdgdqqwpkumrvodb.supabase.co'
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseServiceKey!)

Deno.serve(async (req) => {
  try {
    console.log('Starting event cleanup...')
    
    // Calculate 1 hour ago in Brazil timezone (UTC-3)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000) - (3 * 60 * 60 * 1000)); // 1 hour + UTC-3 offset
    const cutoffDate = oneHourAgo.toISOString().split('T')[0]; // YYYY-MM-DD
    const cutoffTime = oneHourAgo.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
    
    console.log(`Cleanup cutoff: ${cutoffDate} ${cutoffTime} (Brazil time)`)
    
    // First, get the events that need to be deleted
    const { data: eventsToDelete, error: selectError } = await supabase
      .from('events')
      .select('id')
      .or(`event_date.lt.${cutoffDate},and(event_date.eq.${cutoffDate},event_time.lt.${cutoffTime})`); // Events that started more than 1 hour ago
    
    if (selectError) {
      console.error('Error selecting events to delete:', selectError)
      return new Response(
        JSON.stringify({ error: 'Failed to select events for cleanup' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    if (!eventsToDelete || eventsToDelete.length === 0) {
      console.log('No events to cleanup')
      return new Response(
        JSON.stringify({ success: true, deletedCount: 0, message: 'No events to cleanup' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Delete event participants first (foreign key constraint)
    const eventIds = eventsToDelete.map(e => e.id);
    await supabase
      .from('event_participants')
      .delete()
      .in('event_id', eventIds);
    
    // Delete the events
    const { data: deletedEvents, error } = await supabase
      .from('events')
      .delete()
      .or(`event_date.lt.${cutoffDate},and(event_date.eq.${cutoffDate},event_time.lt.${cutoffTime})`) // Events that started more than 1 hour ago
      .select()
    
    if (error) {
      console.error('Error deleting expired events:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to cleanup events' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Cleanup completed. Removed ${deletedEvents?.length || 0} events that were more than 1 hour past their start time.`)
    
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