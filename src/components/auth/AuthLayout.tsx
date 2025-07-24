import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Hunters
            </h1>
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-secondary/10 items-center justify-center p-8">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-3xl">🏃‍♂️</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            Conecte-se através do esporte
          </h3>
          <p className="text-muted-foreground max-w-md">
            Descubra eventos esportivos na sua cidade, faça novos amigos e viva experiências incríveis.
          </p>
        </div>
      </div>
    </div>
  );
};