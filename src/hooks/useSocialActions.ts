import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSocialActions = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user photos
  const { data: userPhotos, isLoading: photosLoading } = useQuery({
    queryKey: ["userPhotos", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("uploaded_by", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Get connection status
  const { data: connectionStatus } = useQuery({
    queryKey: ["connectionStatus", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      
      const { data, error } = await supabase
        .from("user_connections")
        .select("*")
        .or(`and(follower_id.eq.${auth.user.id},following_id.eq.${userId}),and(follower_id.eq.${userId},following_id.eq.${auth.user.id})`)
        .limit(2);
      
      if (error) throw error;
      
      const following = data.find(c => c.follower_id === auth.user.id && c.following_id === userId);
      const followedBy = data.find(c => c.follower_id === userId && c.following_id === auth.user.id);
      
      return {
        isFollowing: following?.status === 'accepted',
        isFollowedBy: followedBy?.status === 'accepted',
        pendingRequest: following?.status === 'pending',
        hasRequest: followedBy?.status === 'pending',
      };
    },
    enabled: !!userId,
  });

  // Follow/unfollow user
  const followMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Usuário não autenticado");

      // Check if connection already exists
      const { data: existing } = await supabase
        .from("user_connections")
        .select("*")
        .eq("follower_id", auth.user.id)
        .eq("following_id", targetUserId)
        .single();

      if (existing) {
        // Remove connection
        const { error } = await supabase
          .from("user_connections")
          .delete()
          .eq("id", existing.id);
        
        if (error) throw error;
        return { action: "unfollowed" };
      } else {
        // Create connection
        const { error } = await supabase
          .from("user_connections")
          .insert({
            follower_id: auth.user.id,
            following_id: targetUserId,
            status: "accepted", // Auto-accept for now
          });
        
        if (error) throw error;
        return { action: "followed" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", userId] });
      toast({
        title: data.action === "followed" ? "Usuário seguido!" : "Deixou de seguir",
        description: data.action === "followed" ? "Agora você segue este usuário." : "Você não segue mais este usuário.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Like/unlike photo
  const likeMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Usuário não autenticado");

      // Check if like already exists
      const { data: existing } = await supabase
        .from("photo_likes")
        .select("*")
        .eq("photo_id", photoId)
        .eq("user_id", auth.user.id)
        .single();

      if (existing) {
        // Remove like
        const { error } = await supabase
          .from("photo_likes")
          .delete()
          .eq("id", existing.id);
        
        if (error) throw error;
        return { action: "unliked" };
      } else {
        // Add like
        const { error } = await supabase
          .from("photo_likes")
          .insert({
            photo_id: photoId,
            user_id: auth.user.id,
          });
        
        if (error) throw error;
        return { action: "liked" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPhotos", userId] });
    },
  });

  return {
    userPhotos,
    photosLoading,
    connectionStatus,
    followUser: followMutation.mutate,
    likePhoto: likeMutation.mutate,
    isFollowLoading: followMutation.isPending,
    isLikeLoading: likeMutation.isPending,
  };
};