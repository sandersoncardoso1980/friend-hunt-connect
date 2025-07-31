import { useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Trophy, Calendar, Settings, LogOut, Edit3, Camera, Heart, Users, Grid } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useSocialActions } from "@/hooks/useSocialActions";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useEffect, useState } from "react";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useParams();
  const profileUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;
  const { city: currentCity, loading: locationLoading } = useGeolocation();

  // Estados para edição de perfil
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    bio: "",
    favorite_sport: "",
    age: "",
    avatar_url: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Preencher formulário quando perfil for carregado
  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        favorite_sport: profile.favorite_sport || "",
        age: profile.age?.toString() || "",
        avatar_url: profile.avatar_url || ""
      });
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    setIsUpdating(true);
    try {
      const updateData = {
        full_name: editForm.full_name,
        bio: editForm.bio,
        favorite_sport: editForm.favorite_sport,
        age: editForm.age ? parseInt(editForm.age) : null,
        avatar_url: editForm.avatar_url
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      setIsEditDialogOpen(false);
      refetchProfile();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
      <div className="flex-1 max-w-full overflow-x-hidden">
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

      <main className="container mx-auto p-4 space-y-6 max-w-full">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Avatar className="w-20 h-20 mx-auto sm:mx-0">
                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || "Foto do usuário"} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-2 space-y-2 sm:space-y-0">
                  <h2 className="text-xl font-semibold text-center sm:text-left">
                    {profile?.full_name || user?.email?.split('@')[0] || "Usuário"}
                  </h2>
                  {isOwnProfile ? (
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar Perfil</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="full_name">Nome Completo</Label>
                            <Input
                              id="full_name"
                              value={editForm.full_name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                              placeholder="Seu nome completo"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={editForm.bio}
                              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                              placeholder="Conte um pouco sobre você..."
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="favorite_sport">Esporte Favorito</Label>
                            <Select
                              value={editForm.favorite_sport}
                              onValueChange={(value) => setEditForm(prev => ({ ...prev, favorite_sport: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione seu esporte favorito" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Futebol">Futebol</SelectItem>
                                <SelectItem value="Basquete">Basquete</SelectItem>
                                <SelectItem value="Vôlei">Vôlei</SelectItem>
                                <SelectItem value="Tênis">Tênis</SelectItem>
                                <SelectItem value="Natação">Natação</SelectItem>
                                <SelectItem value="Corrida">Corrida</SelectItem>
                                <SelectItem value="Ciclismo">Ciclismo</SelectItem>
                                <SelectItem value="Musculação">Musculação</SelectItem>
                                <SelectItem value="Outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="age">Idade</Label>
                            <Input
                              id="age"
                              type="number"
                              value={editForm.age}
                              onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                              placeholder="Sua idade"
                              min="13"
                              max="120"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="avatar_url">URL do Avatar</Label>
                            <Input
                              id="avatar_url"
                              value={editForm.avatar_url}
                              onChange={(e) => setEditForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                              placeholder="https://exemplo.com/sua-foto.jpg"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            disabled={isUpdating}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleUpdateProfile}
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button 
                      variant={connectionStatus?.isFollowing ? "outline" : "default"} 
                      size="sm"
                      onClick={() => profileUserId && followUser(profileUserId)}
                      disabled={isFollowLoading}
                      className="w-full sm:w-auto"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {connectionStatus?.isFollowing ? "Seguindo" : "Seguir"}
                    </Button>
                  )}
                </div>
                
                {profile?.bio && (
                  <p className="text-sm text-muted-foreground mb-2 text-center sm:text-left">{profile.bio}</p>
                )}
                
                {(profile?.city || (isOwnProfile && currentCity)) && (
                  <div className="flex items-center justify-center sm:justify-start gap-1 mb-3 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {isOwnProfile ? (currentCity || profile?.city || "Localizando...") : profile?.city}
                    {isOwnProfile && locationLoading && !currentCity && (
                      <span className="text-xs"> (obtendo localização...)</span>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{userEvents?.length || 0}</div>
                    <div className="text-muted-foreground text-xs">Eventos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{profile?.followers_count || 0}</div>
                    <div className="text-muted-foreground text-xs">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{profile?.following_count || 0}</div>
                    <div className="text-muted-foreground text-xs">Seguindo</div>
                  </div>
                   <div className="text-center">
                     <div className="font-semibold">{userPhotos?.length || 0}</div>
                     <div className="text-muted-foreground text-xs">Fotos</div>
                   </div>
                   <div className="text-center">
                     <div className="font-semibold text-primary">{profile?.total_points || 0}</div>
                     <div className="text-muted-foreground text-xs">Pontos</div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
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
                <div className="col-span-2 sm:col-span-3 text-center py-12">
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