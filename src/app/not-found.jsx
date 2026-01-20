"use client";

import { Button } from "./components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col relative">
      
      {/* IMAGEM DE FUNDO FULLSCREEN */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/banner.png"
          alt="Fundo 404"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay com leve escurecimento */}
      <div className="absolute inset-0 bg-black/20 -z-10"></div>

      <div className="flex-1 flex items-center justify-center p-6">
        
        {/* CARD PRINCIPAL */}
        <div className="
          backdrop-blur-md
          shadow-2xl rounded-3xl
          p-10 md:p-14
          max-w-2xl w-full
          flex flex-col items-center text-center
          border
        ">

          {/* 404 grande */}
          <h1 className="
            text-9xl text-muted-foreground font-extrabold animate-bounce
          ">
            404
          </h1>

          <h2 className="text-4xl text-muted-foreground font-extrabold mt-4">
            Página não encontrada
          </h2>

          <p className="mt-6 text-muted-foreground text-2xl font-semibold max-w-md">
           Poxa… parece que você se perdeu no caminho ou tentou acessar uma página que não existe.
          </p>

          {/* Botão de voltar */}
          <Button
            onClick={() => router.push("/")}
            className=" 
               mt-8 px-3 py-10
               rounded-2xl text-2xl font-bold
               bg-gradient-to-r from-blue-600 to-indigo-600
               hover:from-blue-700 hover:to-indigo-700
               text-white"
          >
            Voltar para a página inicial
          </Button>

        </div>
      </div>
    </div>
  );
}
