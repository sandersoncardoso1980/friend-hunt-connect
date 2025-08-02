import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useEvents = (city?: string) => {
  return useQuery({
    queryKey: ["events", city],
    queryFn: async () => {
      // Calculate current time in Brazil timezone (UTC-3)
      const now = new Date();
      const brazilTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // UTC-3
      const today = brazilTime.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentTime = brazilTime.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

      let query = supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true });

      if (city) {
        query = query.ilike("location", `%${city}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Filter out events that have passed by more than 1 hour
      const filteredData = data?.filter(event => {
        const eventDateTime = new Date(`${event.event_date}T${event.event_time}`);
        const eventDateTimeBrazil = new Date(eventDateTime.getTime() - (3 * 60 * 60 * 1000)); // Convert to Brazil time
        const oneHourAfterEvent = new Date(eventDateTimeBrazil.getTime() + (60 * 60 * 1000)); // Add 1 hour
        
        return brazilTime < oneHourAfterEvent; // Only show events that haven't passed 1 hour yet
      }) || [];

      return filteredData;
    },
  });
};