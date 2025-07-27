import { NavLink } from "react-router-dom";
import { Home, Search, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Explorar", path: "/explore" },
  { icon: Plus, label: "Criar", path: "/create-event" },
  { icon: User, label: "Perfil", path: "/profile" },
];

export const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 lg:relative lg:border-t-0 lg:border-r lg:w-64 lg:h-auto lg:flex-col">
      <div className="flex items-center justify-around h-16 lg:flex-col lg:h-auto lg:justify-start lg:space-y-2 lg:p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors lg:flex-row lg:w-full lg:justify-start lg:px-4 lg:py-3 lg:rounded-lg lg:h-auto",
                isActive
                  ? "text-primary bg-primary/10 lg:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )
            }
          >
            <item.icon className="h-5 w-5 lg:mr-3" />
            <span className="text-xs mt-1 lg:text-sm lg:mt-0">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};