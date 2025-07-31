import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePoints = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const calculateCancellationPenalty = (eventDateTime: string): number => {
    const eventTime = new Date(eventDateTime);
    const now = new Date();
    const hoursUntilEvent = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilEvent <= 5) {
      return 40; // 4x pontos perdidos
    } else if (hoursUntilEvent <= 24) {
      return 20; // 2x pontos perdidos
    } else {
      return 10; // x pontos perdidos
    }
  };

  const awardJoinPoints = async (userId: string, eventId: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("user_points")
        .insert({
          user_id: userId,
          event_id: eventId,
          points: 10,
          reason: "Participação em evento"
        });

      if (error) throw error;

      toast({
        title: "Pontos ganhos!",
        description: "Você ganhou 10 pontos por participar do evento.",
      });
    } catch (error: any) {
      console.error("Erro ao conceder pontos:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const penalizeCancellation = async (userId: string, eventId: string, eventDateTime: string) => {
    setIsProcessing(true);
    try {
      const penaltyPoints = calculateCancellationPenalty(eventDateTime);
      
      const { error } = await supabase
        .from("user_points")
        .insert({
          user_id: userId,
          event_id: eventId,
          points: -penaltyPoints,
          reason: `Cancelamento de participação (${penaltyPoints} pontos perdidos)`
        });

      if (error) throw error;

      const hoursUntilEvent = (new Date(eventDateTime).getTime() - new Date().getTime()) / (1000 * 60 * 60);
      let message = "";
      
      if (hoursUntilEvent <= 5) {
        message = "Você perdeu 40 pontos por cancelar com menos de 5 horas de antecedência.";
      } else if (hoursUntilEvent <= 24) {
        message = "Você perdeu 20 pontos por cancelar com menos de 24 horas de antecedência.";
      } else {
        message = "Você perdeu 10 pontos por cancelar a participação.";
      }

      toast({
        title: "Pontos perdidos",
        description: message,
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Erro ao aplicar penalidade:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    awardJoinPoints,
    penalizeCancellation,
    isProcessing
  };
};