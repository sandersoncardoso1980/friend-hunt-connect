import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useEvents = (city?: string) => {
  return useQuery({
    queryKey: ["events", city],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          *,
          profiles:creator_id (
            full_name
          )
        `)
        .order("event_date", { ascending: true });

      if (city) {
        query = query.ilike("location", `%${city}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};