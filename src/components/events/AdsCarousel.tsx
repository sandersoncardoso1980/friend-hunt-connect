import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const AdsCarousel = () => {
  const { data: ads, isLoading } = useQuery({
    queryKey: ["ads-carousel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads_carousel")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Parceiros</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {ads.map((ad) => (
          <Card 
            key={ad.id} 
            className="min-w-[300px] cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => ad.link_url && window.open(ad.link_url, '_blank')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                {ad.image_url && (
                  <img 
                    src={ad.image_url} 
                    alt={ad.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-medium">{ad.title}</h3>
                  {ad.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {ad.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};