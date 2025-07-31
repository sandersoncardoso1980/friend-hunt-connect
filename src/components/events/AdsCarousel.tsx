import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Importe o plugin de autoplay
import Autoplay from "embla-carousel-autoplay";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
}

export const AdsCarousel = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from("ads_carousel")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-32 sm:h-36 bg-muted animate-pulse rounded-lg"></div>
    );
  }

  // O carrossel não muda automaticamente se houver apenas um item
  if (ads.length <= 1) {
    return (
      <div className="w-full">
        {ads.length > 0 && (
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => ads[0].link_url && window.open(ads[0].link_url, '_blank')}
          >
            <CardContent className="p-0">
              <div className="relative h-32 sm:h-36 overflow-hidden rounded-lg">
                <img
                  src={ads[0].image_url}
                  alt={ads[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-semibold text-lg">{ads[0].title}</h3>
                  {ads[0].description && (
                    <p className="text-white/90 text-sm">{ads[0].description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const handleAdClick = (linkUrl: string | null) => {
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };

  return (
    <div className="w-full">
      <Carousel
        className="w-full"
        // Adicione o plugin diretamente aqui
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
          }),
        ]}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {ads.map((ad) => (
            <CarouselItem key={ad.id}>
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleAdClick(ad.link_url)}
              >
                <CardContent className="p-0">
                  <div className="relative h-32 sm:h-36 overflow-hidden rounded-lg">
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="text-white font-semibold text-lg">{ad.title}</h3>
                      {ad.description && (
                        <p className="text-white/90 text-sm">{ad.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};