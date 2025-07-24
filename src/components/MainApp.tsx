import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { EventsList } from "@/components/EventsList";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { Header } from "@/components/Header";
import { AdsCarousel } from "@/components/AdsCarousel";

interface MainAppProps {
  user: User;
}

export const MainApp = ({ user }: MainAppProps) => {
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onCreateEvent={() => setShowCreateEvent(true)} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <AdsCarousel />
        <EventsList />
      </main>

      <CreateEventDialog 
        open={showCreateEvent} 
        onOpenChange={setShowCreateEvent}
      />
    </div>
  );
};