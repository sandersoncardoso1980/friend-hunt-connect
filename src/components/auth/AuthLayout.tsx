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
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/2c7a07a3-7485-4473-9ef7-fadb019f021d.png" 
                alt="Hunters Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
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
          <div className="w-32 h-32 mx-auto flex items-center justify-center">
            <img 
              src="/lovable-uploads/2c7a07a3-7485-4473-9ef7-fadb019f021d.png" 
              alt="Hunters Logo" 
              className="w-24 h-24 object-contain"
            />
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