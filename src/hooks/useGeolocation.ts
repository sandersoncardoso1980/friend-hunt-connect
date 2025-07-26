import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    city: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: "Geolocalização não é suportada neste navegador.",
      }));
      return;
    }

    const success = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // Usar API de geocoding reverso para obter a cidade
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`
        );
        const data = await response.json();
        
        setLocation({
          latitude,
          longitude,
          city: data.city || data.locality || "Cidade não encontrada",
          loading: false,
          error: null,
        });
      } catch (error) {
        setLocation({
          latitude,
          longitude,
          city: "São Paulo", // Fallback para São Paulo
          loading: false,
          error: null,
        });
      }
    };

    const error = (error: GeolocationPositionError) => {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: "Não foi possível obter sua localização.",
        city: "São Paulo", // Fallback para São Paulo
      }));
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      timeout: 10000,
      maximumAge: 300000, // 5 minutos
    });
  }, []);

  return location;
};