import { useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Trophy, Calendar, Settings, LogOut, Edit3, Camera, Heart, Users, Grid } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useSocialActions } from "@/hooks/useSocialActions";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useEffect } from "react";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useParams();
  const profileUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;
  const { city: currentCity, loading: locationLoading } = useGeolocation();

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["profile", profileUserId],
    queryFn: async () => {
      if (!profileUserId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", profileUserId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileUserId,
  });

  // Update user's current city when geolocation is available and it's own profile
  useEffect(() => {
    const updateUserCity = async () => {
      if (!currentCity || !isOwnProfile || !user?.id || locationLoading) return;
      
      // Only update if current city is different from profile city
      if (profile?.city !== currentCity) {
        try {
          await supabase
            .from("profiles")
            .update({ city: currentCity })
            .eq("user_id", user.id);
          
          // Refetch profile to get updated data
          refetchProfile();
        } catch (error) {
          console.error("Error updating user city:", error);
        }
      }
    };

    updateUserCity();
  }, [currentCity, isOwnProfile, user?.id, locationLoading, profile?.city, refetchProfile]);

  const { data: userEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["userEvents", profileUserId],
    queryFn: async () => {
      if (!profileUserId) return [];
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("creator_id", profileUserId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileUserId,
  });

  const { 
    userPhotos, 
    photosLoading, 
    connectionStatus, 
    followUser, 
    likePhoto,
    isFollowLoading 
  } = useSocialActions(profileUserId);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-background border-b p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">Perfil</h1>
          </div>
        </header>
        <main className="container mx-auto p-4 space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </main>
        <BottomNavigation />
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">Perfil</h1>
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
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || "Foto do usuário"} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">
                    {profile?.full_name || user?.email?.split('@')[0] || "Usuário"}
                  </h2>
                  {isOwnProfile ? (
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  ) : (
                    <Button 
                      variant={connectionStatus?.isFollowing ? "outline" : "default"} 
                      size="sm"
                      onClick={() => profileUserId && followUser(profileUserId)}
                      disabled={isFollowLoading}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {connectionStatus?.isFollowing ? "Seguindo" : "Seguir"}
                    </Button>
                  )}
                </div>
                
                {profile?.bio && (
                  <p className="text-sm text-muted-foreground mb-2">{profile.bio}</p>
                )}
                
                {(profile?.city || (isOwnProfile && currentCity)) && (
                  <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {isOwnProfile ? (currentCity || profile?.city || "Localizando...") : profile?.city}
                    {isOwnProfile && locationLoading && !currentCity && (
                      <span className="text-xs"> (obtendo localização...)</span>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{userEvents?.length || 0}</div>
                    <div className="text-muted-foreground">Eventos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{profile?.followers_count || 0}</div>
                    <div className="text-muted-foreground">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{profile?.following_count || 0}</div>
                    <div className="text-muted-foreground">Seguindo</div>
                  </div>
                   <div className="text-center">
                     <div className="font-semibold">{userPhotos?.length || 0}</div>
                     <div className="text-muted-foreground">Fotos</div>
                   </div>
                   <div className="text-center">
                     <div className="font-semibold text-primary">{profile?.total_points || 0}</div>
                     <div className="text-muted-foreground">Pontos</div>
                   </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Sobre
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-3 gap-1">
              {photosLoading ? (
                [...Array(9)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))
              ) : userPhotos && userPhotos.length > 0 ? (
                userPhotos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square group cursor-pointer">
                    <img 
                      src={photo.url} 
                      alt={photo.caption || "Foto"} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <div className="flex items-center space-x-4 text-white">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{photo.likes_count || 0}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likePhoto(photo.id)}
                          className="text-white hover:text-red-500"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {isOwnProfile ? "Você ainda não postou nenhuma foto." : "Nenhuma foto ainda."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            {eventsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : userEvents && userEvents.length > 0 ? (
              <div className="space-y-3">
                {userEvents.map((event) => (
                  <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/events/${event.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.event_date).toLocaleDateString("pt-BR")} • {event.location}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {event.sport_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.current_participants}/{event.max_participants}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Você ainda não criou nenhum evento." : "Nenhum evento criado ainda."}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Trophy className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Esporte Favorito</p>
                    <p className="text-sm text-muted-foreground">{profile?.favorite_sport || "Futebol"}</p>
                  </div>
                </div>
                
                {(profile?.city || (isOwnProfile && currentCity)) && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Localização Atual</p>
                      <p className="text-sm text-muted-foreground">
                        {isOwnProfile ? (currentCity || profile?.city || "Obtendo localização...") : profile?.city}
                      </p>
                    </div>
                  </div>
                )}
                
                {profile?.age && (
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Idade</p>
                      <p className="text-sm text-muted-foreground">{profile.age} anos</p>
                    </div>
                  </div>
                )}
                
                {isOwnProfile && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => toast({ title: "Em breve", description: "Configurações em desenvolvimento." })}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Profile;