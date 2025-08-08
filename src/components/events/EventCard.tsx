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
  const now = new Date();
  const oneHourBeforeEvent = new Date(eventDate.getTime() - 60 * 60 * 1000);
  
  const isFull = event.current_participants >= event.max_participants;
  const isEventSoon = now >= oneHourBeforeEvent;
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2 leading-[1.4]">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-xl line-clamp-2">{event.name}</h3>
          <div className="flex flex-col gap-1 ml-2 shrink-0">
            <Badge variant="secondary">
              {event.sport_type}
            </Badge>
            {isFull && (
              <Badge variant="destructive" className="text-xs">
                Lotado
              </Badge>
            )}
            {isEventSoon && !isFull && (
              <Badge variant="destructive" className="text-xs">
                Encerrado
              </Badge>
            )}
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-base leading-[1.4] text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {format(eventDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
          
          <div className="flex items-center text-base leading-[1.4] text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>
          
          <div className="flex items-center text-base leading-[1.4] text-muted-foreground">
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