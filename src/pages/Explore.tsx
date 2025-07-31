import { useState, useEffect } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useGeolocation } from "@/hooks/useGeolocation";
import { EventCard } from "@/components/events/EventCard";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const navigate = useNavigate();
  
  const { city, loading: locationLoading } = useGeolocation();
  const { data: events, isLoading } = useEvents(city || undefined);

  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === "all" || event.sport_type === sportFilter;
    return matchesSearch && matchesSport;
  });

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
          <div>
            <h1 className="text-xl font-semibold">Explorar Eventos</h1>
            {city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {city}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Location Status */}
        {locationLoading && (
          <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Obtendo sua localização...</span>
          </div>
        )}
        
        {city && (
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Eventos próximos em {city}</span>
            </div>
            <Badge variant="secondary">{filteredEvents?.length || 0} eventos</Badge>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, local ou palavras-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os esportes</SelectItem>
                <SelectItem value="futebol">Futebol</SelectItem>
                <SelectItem value="basquete">Basquete</SelectItem>
                <SelectItem value="volei">Vôlei</SelectItem>
                <SelectItem value="tenis">Tênis</SelectItem>
                <SelectItem value="corrida">Corrida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            {searchTerm || sportFilter !== "all" 
              ? `Resultados da busca (${filteredEvents?.length || 0})`
              : city 
                ? `Eventos em ${city} (${filteredEvents?.length || 0})`
                : "Todos os eventos"
            }
          </h2>
          
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : filteredEvents && filteredEvents.length > 0 ? (
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || sportFilter !== "all" 
                  ? "Nenhum evento encontrado com esses filtros."
                  : "Nenhum evento disponível."
                }
              </p>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default Explore;