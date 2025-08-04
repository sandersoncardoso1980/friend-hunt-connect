import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateEventDialog = ({ open, onOpenChange }: CreateEventDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    event_date: "",
    event_time: "",
    max_participants: "",
    sport_type: "Esportes e Atividades Físicas"
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("events")
        .insert({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          event_date: formData.event_date,
          event_time: formData.event_time,
          max_participants: parseInt(formData.max_participants),
          sport_type: formData.sport_type,
          creator_id: user.user.id,
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Evento criado com sucesso",
      });

      setFormData({
        name: "",
        description: "",
        location: "",
        event_date: "",
        event_time: "",
        max_participants: "",
        sport_type: "Esportes e Atividades Físicas"
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Evento</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo evento esportivo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Evento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date">Data</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="event_time">Horário</Label>
              <Input
                id="event_time"
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_participants">Máx. Participantes</Label>
              <Input
                id="max_participants"
                type="number"
                min="2"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="sport_type">Categoria</Label>
              <Select value={formData.sport_type} onValueChange={(value) => setFormData({ ...formData, sport_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Esportes e Atividades Físicas">Esportes e Atividades Físicas</SelectItem>
                  <SelectItem value="Arte e Cultura">Arte e Cultura</SelectItem>
                  <SelectItem value="Educação e Desenvolvimento Pessoal">Educação e Desenvolvimento Pessoal</SelectItem>
                  <SelectItem value="Profissional e Network">Profissional e Network</SelectItem>
                  <SelectItem value="Entretenimentos e Jogos">Entretenimentos e Jogos</SelectItem>
                  <SelectItem value="Bem-estar e Estilo de Vida">Bem-estar e Estilo de Vida</SelectItem>
                  <SelectItem value="Família e Comunidade">Família e Comunidade</SelectItem>
                  <SelectItem value="Relacionamento e Vida Social">Relacionamento e Vida Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};