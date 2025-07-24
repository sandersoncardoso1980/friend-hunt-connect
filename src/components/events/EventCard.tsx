import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Users, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  event: {
    id: string;
    name: string;
    description: string;
    location: string;
    event_date: string;
    event_time: string;
    sport_type: string;
    max_participants: number;
    current_participants: number;
    creator?: {
      full_name?: string;
    } | null;
  };
  onClick?: () => void;
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
  const eventDate = new Date(`${event.event_date}T${event.event_time}`);
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg line-clamp-2">{event.name}</h3>
          <Badge variant="secondary" className="ml-2 shrink-0">
            {event.sport_type}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {format(eventDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {event.current_participants}/{event.max_participants} participantes
          </div>
        </div>
        
        {event.creator?.full_name && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Organizado por <span className="font-medium">{event.creator.full_name}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};