import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useGeolocation } from "@/hooks/useGeolocation";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { city } = useGeolocation();
  const { data: events, isLoading } = useEvents(city || undefined);

  const filteredEvents = events?.filter((event) => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:flex">
      <BottomNavigation />
      <div className="flex-1">
        <header className="bg-background border-b p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Criar Evento</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Create Event Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Plus className="h-8 w-8 text-white" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">Criar Novo Evento</h2>
            <p className="text-muted-foreground text-sm">
              Organize seu evento esportivo e conecte pessoas
            </p>
          </div>
          
          <Button 
            onClick={() => setShowDialog(true)}
            className="w-full max-w-xs"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Evento
          </Button>
        </div>

        {/* Current City Events */}
        {city && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-semibold">Eventos em {city}</h3>
              </div>
              <Badge variant="secondary">{filteredEvents?.length || 0} eventos</Badge>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos existentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="space-y-3">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))
              ) : filteredEvents && filteredEvents.length > 0 ? (
                filteredEvents.slice(0, 10).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => navigate(`/events/${event.id}`)}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? "Nenhum evento encontrado com esse termo."
                      : `Nenhum evento encontrado em ${city}.`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Seja o primeiro a criar um evento!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

        <CreateEventDialog 
          open={showDialog} 
          onOpenChange={setShowDialog}
        />
      </div>
    </div>
  );
};

export default CreateEvent;