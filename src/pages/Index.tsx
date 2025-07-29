import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
import { AdsCarousel } from "@/components/events/AdsCarousel";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center space-y-8 p-8">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/2c7a07a3-7485-4473-9ef7-fadb019f021d.png" 
              alt="Hunters Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <p className="text-xl text-muted-foreground max-w-md">
            Conecte-se através do esporte. Descubra eventos incríveis na sua cidade.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signin">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
                Entrar
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button variant="outline" size="lg">
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:flex">
      <BottomNavigation />
      <div className="flex-1">
        <header className="bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/2c7a07a3-7485-4473-9ef7-fadb019f021d.png" 
              alt="Hunters Logo" 
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Hunters
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="p-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <AdsCarousel />
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Eventos próximos</h2>
          {eventsLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid gap-4">
              {events.slice(0, 6).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum evento encontrado.</p>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default Index;