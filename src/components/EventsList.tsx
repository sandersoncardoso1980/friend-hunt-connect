import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  max_participants: number;
  current_participants: number;
  sport_type: string;
  creator_id: string;
}

export const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("event_participants")
        .insert({
          event_id: eventId,
          user_id: user.user.id,
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Você se inscreveu no evento",
      });

      fetchEvents(); // Refresh the events list
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
        <p className="text-muted-foreground">Seja o primeiro a criar um evento!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl font-bold">{event.name}</CardTitle>
              <Badge variant="secondary">{event.sport_type}</Badge>
            </div>
            <CardDescription>{event.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 leading-[1.4]">
            <div className="flex items-center text-base leading-[1.4] text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(event.event_date).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center text-base leading-[1.4] text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              {event.event_time}
            </div>
            <div className="flex items-center text-base leading-[1.4] text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              {event.location}
            </div>
            <div className="flex items-center text-base leading-[1.4] text-muted-foreground">
              <Users className="w-4 h-4 mr-2" />
              {event.current_participants || 0}/{event.max_participants} participantes
            </div>
            <Button 
              onClick={() => joinEvent(event.id)}
              className="w-full"
              disabled={event.current_participants >= event.max_participants}
            >
              {event.current_participants >= event.max_participants 
                ? "Evento Lotado" 
                : "Participar"
              }
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};