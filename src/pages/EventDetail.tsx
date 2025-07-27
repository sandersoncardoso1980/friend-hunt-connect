import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Trophy } from "lucide-react";
import { useState } from "react";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);

  const { data: event, isLoading, refetch } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do evento não encontrado");
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: isParticipant, refetch: refetchParticipant } = useQuery({
    queryKey: ["participant", id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return false;
      
      const { data } = await supabase
        .from("event_participants")
        .select("id")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .single();
      
      return !!data;
    },
    enabled: !!id && !!user?.id,
  });

  const handleJoinEvent = async () => {
    if (!user || !event) return;

    setIsJoining(true);
    try {
      const { error } = await supabase
        .from("event_participants")
        .insert({
          event_id: event.id,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Você se inscreveu no evento.",
      });

      refetch();
      refetchParticipant();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-background border-b p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-6 w-32" />
          </div>
        </header>
        <main className="container mx-auto p-4 space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Evento não encontrado</h2>
          <p className="text-muted-foreground mb-4">O evento que você procura não existe.</p>
          <Button onClick={() => navigate("/")}>Voltar para início</Button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const isFull = event.current_participants >= event.max_participants;
  const canJoin = user && !isParticipant && !isFull;

  return (
    <div className="min-h-screen bg-background pb-20">
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
          <h1 className="text-xl font-semibold">Detalhes do Evento</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Event Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-3">
              <CardTitle className="text-2xl">{event.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{event.sport_type}</Badge>
                <Badge variant="outline">{event.category}</Badge>
                <Badge variant="outline">{event.difficulty_level}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{event.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{eventDate.toLocaleDateString("pt-BR")}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{event.event_time}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>
                  {event.current_participants}/{event.max_participants} participantes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Nível de Dificuldade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="capitalize">{event.difficulty_level}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Faixa Etária</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="capitalize">{event.age_group}</p>
            </CardContent>
          </Card>
        </div>

        {/* Join Button */}
        {user && (
          <Card>
            <CardContent className="pt-6">
              {isParticipant ? (
                <div className="text-center">
                  <Badge variant="default" className="mb-2">
                    ✓ Você está inscrito neste evento
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Você já está participando deste evento!
                  </p>
                </div>
              ) : isFull ? (
                <div className="text-center">
                  <Badge variant="destructive" className="mb-2">
                    Evento lotado
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Este evento já atingiu o número máximo de participantes.
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleJoinEvent}
                  disabled={isJoining}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  size="lg"
                >
                  {isJoining ? "Inscrevendo..." : "Participar do Evento"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                Faça login para participar deste evento
              </p>
              <Button onClick={() => navigate("/auth/signin")}>
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default EventDetail;