import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(true);

  const handleClose = () => {
    setShowDialog(false);
    navigate(-1);
  };

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
          <h1 className="text-xl font-semibold">Criar Evento</h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-3xl">🏃‍♂️</span>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Organize seu evento esportivo</h2>
            <p className="text-muted-foreground">
              Preencha os detalhes abaixo para criar um novo evento e conectar pessoas através do esporte.
            </p>
          </div>
        </div>
      </main>

      <CreateEventDialog 
        open={showDialog} 
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) handleClose();
        }}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default CreateEvent;