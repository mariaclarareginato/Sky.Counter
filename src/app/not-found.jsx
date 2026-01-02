"use client";

import { Button } from "./components/ui/button";
import { Navigation } from "lucide-react";
import { SiteFooter } from "./components/site-footer";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div>
    <div className="flex flex-col items-center justify-center h-screen text-center p-6 bg-background text-foreground">
    
     
      {/* Texto principal */}
      <h1 className="mt-10 text-9xl font-extrabold drop-shadow-lg animate-bounce">404</h1>
      <h2 className="text-4xl font-bold mt-4">Página não encontrada</h2>
      <p className="mt-10 text-2xl font-semibold">
        Poxa! Parece que você se perdeu, ou não tem acesso a essa página.
      </p>

      {/* Botão de voltar */}
      <Button
        onClick={() => router.push("/")}
        className="m-10 p-10 rounded-2xl text-lg font-semibold transition-colors duration-200"
      >
        <p className="text-xl font-bold">Voltar para a página inicial</p>
      </Button>
     
    </div>

    <SiteFooter></SiteFooter>
    </div>
     
  );
}
